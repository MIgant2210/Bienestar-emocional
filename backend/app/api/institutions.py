from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app import db
from app.models.reflection import Reflection
from app.models.user import User
from app.utils.decorators import token_required, roles_accepted

institutions_bp = Blueprint('institutions', __name__)

@institutions_bp.route('/dashboard', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_dashboard_data(current_user):
    """
    Obtiene datos agregados e históricos del bienestar emocional para la institución.
    IMPORTANTE: Respeta la privacidad anonimizando las respuestas (no se ligan a nombres).
    """
    institution_id = current_user.institution_id
    
    # Permitir que un superadmin filtre por otra institución en la query param
    if current_user.role == 'superadmin':
        inst_param = request.args.get('institution_id')
        if inst_param:
            institution_id = inst_param
        else:
            institution_id = None
            
    if current_user.role != 'superadmin' and not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400

    # Si la institución filtrada no tiene reflexiones registradas aún, mostrar los datos generales de la base de datos
    if institution_id:
        has_data = Reflection.query.filter(Reflection.institution_id == institution_id).count() > 0
        if not has_data and current_user.role in ['superadmin', 'profesional_apoyo', 'admin_institucion']:
            institution_id = None
        
    # 1. Métricas Generales (Promedios)
    averages_query = db.session.query(
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('total_reflections')
    )
    if institution_id:
        averages_query = averages_query.filter(Reflection.institution_id == institution_id)
    averages = averages_query.first()
    
    # 2. Distribución de Sentimientos (para gráfico de pastel/pie chart)
    sentiment_query = db.session.query(
        Reflection.dominant_sentiment,
        func.count(Reflection.id).label('count')
    )
    if institution_id:
        sentiment_query = sentiment_query.filter(Reflection.institution_id == institution_id)
    sentiment_distribution = sentiment_query.group_by(Reflection.dominant_sentiment).all()
    
    sentiment_data = {
        'Positivo': 0,
        'Neutro': 0,
        'Negativo': 0
    }
    for item in sentiment_distribution:
        sentiment_data[item.dominant_sentiment] = item.count
        
    # 3. Tendencia Histórica (Promedios agrupados por fecha de creación)
    # Agrupamos por la fecha (sin la hora)
    trends_query = db.session.query(
        func.date(Reflection.created_at).label('date'),
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('reflections_count')
    )
    if institution_id:
        trends_query = trends_query.filter(Reflection.institution_id == institution_id)
    historical_trends = trends_query.group_by(func.date(Reflection.created_at))\
        .order_by(func.date(Reflection.created_at).asc()).all()
     
    trends_list = []
    for trend in historical_trends:
        trends_list.append({
            'date': str(trend.date),
            'stress': round(float(trend.avg_stress), 1) if trend.avg_stress else 0,
            'motivation': round(float(trend.avg_motivation), 1) if trend.avg_motivation else 0,
            'burnout': round(float(trend.avg_burnout), 1) if trend.avg_burnout else 0,
            'count': trend.reflections_count
        })
        
    # 4. Total de Miembros Registrados
    members_query = User.query.filter_by(role='miembro')
    if institution_id:
        members_query = members_query.filter_by(institution_id=institution_id)
    total_members = members_query.count()
    
    return jsonify({
        'averages': {
            'stress': round(float(averages.avg_stress), 1) if averages.avg_stress else 0,
            'motivation': round(float(averages.avg_motivation), 1) if averages.avg_motivation else 0,
            'burnout': round(float(averages.avg_burnout), 1) if averages.avg_burnout else 0,
            'total_reflections': averages.total_reflections or 0
        },
        'sentiment_distribution': sentiment_data,
        'historical_trends': trends_list,
        'total_members': total_members
    }), 200

@institutions_bp.route('/suggestions', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_suggestions(current_user):
    """
    Retorna el listado de sugerencias colectivas generadas por la IA para la institución.
    """
    institution_id = current_user.institution_id
    if current_user.role == 'superadmin':
        inst_param = request.args.get('institution_id')
        if inst_param:
            institution_id = inst_param
        else:
            institution_id = None
            
    if current_user.role != 'superadmin' and not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400
        
    # Obtener sugerencias recientes y no nulas
    reflections_query = Reflection.query.filter(
        Reflection.institution_suggestion.isnot(None),
        Reflection.institution_suggestion != ''
    )
    if institution_id:
        reflections_query = reflections_query.filter(Reflection.institution_id == institution_id)
    reflections = reflections_query.order_by(Reflection.created_at.desc()).limit(30).all()
    
    suggestions = [{
        'id': str(ref.id),
        'suggestion': ref.institution_suggestion,
        'created_at': ref.created_at.isoformat()
    } for ref in reflections]
    
    return jsonify(suggestions), 200

@institutions_bp.route('/members', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_institution_members(current_user):
    """
    Retorna el directorio de todos los usuarios de la institución.
    """
    institution_id = current_user.institution_id
    if current_user.role == 'superadmin':
        inst_param = request.args.get('institution_id')
        if inst_param:
            institution_id = inst_param
        else:
            institution_id = None

    query = User.query
    if institution_id:
        query = query.filter_by(institution_id=institution_id)
        
    members = query.order_by(User.created_at.desc()).all()
    return jsonify([m.to_dict() for m in members]), 200

@institutions_bp.route('/members/<uuid:user_id>', methods=['PUT'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'lider_depto')
def update_institution_member(current_user, user_id):
    """
    Actualiza el rol, departamento o restablece la contraseña de un usuario.
    """
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404
        
    # Verificar que pertenezca a la misma institución si no es superadmin global
    if current_user.role != 'superadmin' and target_user.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para modificar este usuario.'}), 403

    data = request.get_json() or {}
    
    if 'role' in data:
        valid_roles = ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro']
        if data['role'] in valid_roles:
            target_user.role = data['role']

    if 'department' in data:
        target_user.department = data['department']

    if 'first_name' in data:
        target_user.first_name = data['first_name']

    if 'last_name' in data:
        target_user.last_name = data['last_name']

    if 'new_password' in data and data['new_password']:
        if len(data['new_password']) < 6:
            return jsonify({'message': 'La contraseña debe tener al menos 6 caracteres.'}), 400
        target_user.set_password(data['new_password'])

    db.session.commit()
    return jsonify({
        'message': f'Usuario {target_user.first_name} {target_user.last_name} actualizado exitosamente.',
        'user': target_user.to_dict()
    }), 200

@institutions_bp.route('/all', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_all_institutions(current_user):
    """
    Retorna todas las instituciones registradas con su lista de departamentos y miembros.
    """
    from app.models.institution import Institution
    institutions = Institution.query.order_by(Institution.created_at.desc()).all()
    result = []
    for inst in institutions:
        inst_users = User.query.filter_by(institution_id=inst.id).all()
        departments = list(set([u.department for u in inst_users if u.department]))
        if not departments:
            departments = ['General', 'Tecnología', 'Salud', 'Educación']
            
        inst_data = inst.to_dict()
        inst_data['total_members'] = len(inst_users)
        inst_data['departments'] = departments
        result.append(inst_data)
        
    return jsonify(result), 200

@institutions_bp.route('', methods=['POST'])
@token_required
@roles_accepted('superadmin', 'admin_institucion')
def create_institution(current_user):
    """
    Crea una nueva institución en la base de datos.
    """
    from app.models.institution import Institution
    data = request.get_json() or {}
    name = data.get('name')
    inst_type = data.get('type', 'educativa')
    
    if not name:
        return jsonify({'message': 'El nombre de la institución es requerido.'}), 400
        
    existing = Institution.query.filter_by(name=name).first()
    if existing:
        return jsonify({'message': 'Ya existe una institución con este nombre.'}), 400
        
    inst = Institution(name=name, type=inst_type)
    db.session.add(inst)
    db.session.commit()
    
    return jsonify({
        'message': f'¡Institución "{inst.name}" creada exitosamente en Supabase!',
        'institution': inst.to_dict()
    }), 201


