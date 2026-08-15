from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app import db
from app.models.reflection import Reflection
from app.models.user import User
from app.models.institution import Institution
from app.utils.decorators import token_required, roles_accepted, permission_required
from app.utils.rbac import can_manage_roles

institutions_bp = Blueprint('institutions', __name__)

@institutions_bp.route('/dashboard', methods=['GET'])
@token_required
@permission_required('analytics')
def get_dashboard_data(current_user):
    """
    Obtiene datos agregados e históricos del bienestar emocional.
    Alcance:
    - Superadmin: Global o filtrado.
    - Admin Institucional / Profesional de Apoyo: Su institución.
    - Líder de Depto: Su departamento exclusivo dentro de su institución.
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

    # Construir subconsulta de usuarios permitidos si es Líder de Depto
    dept_user_ids = None
    if current_user.role == 'lider_depto':
        user_dept = current_user.department or 'General'
        dept_user_ids = [u.id for u in User.query.filter_by(institution_id=institution_id, department=user_dept).all()]

    # 1. Métricas Generales (Promedios)
    averages_query = db.session.query(
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('total_reflections')
    )
    if institution_id:
        averages_query = averages_query.filter(Reflection.institution_id == institution_id)
    if dept_user_ids is not None:
        averages_query = averages_query.filter(Reflection.user_id.in_(dept_user_ids))
    averages = averages_query.first()
    
    # 2. Distribución de Sentimientos
    sentiment_query = db.session.query(
        Reflection.dominant_sentiment,
        func.count(Reflection.id).label('count')
    )
    if institution_id:
        sentiment_query = sentiment_query.filter(Reflection.institution_id == institution_id)
    if dept_user_ids is not None:
        sentiment_query = sentiment_query.filter(Reflection.user_id.in_(dept_user_ids))
    sentiment_distribution = sentiment_query.group_by(Reflection.dominant_sentiment).all()
    
    sentiment_data = {
        'Positivo': 0,
        'Neutro': 0,
        'Negativo': 0
    }
    for item in sentiment_distribution:
        sentiment_data[item.dominant_sentiment] = item.count
        
    # 3. Tendencia Histórica
    trends_query = db.session.query(
        func.date(Reflection.created_at).label('date'),
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('reflections_count')
    )
    if institution_id:
        trends_query = trends_query.filter(Reflection.institution_id == institution_id)
    if dept_user_ids is not None:
        trends_query = trends_query.filter(Reflection.user_id.in_(dept_user_ids))
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
    if current_user.role == 'lider_depto':
        members_query = members_query.filter_by(department=current_user.department or 'General')
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
@permission_required('members')
def get_institution_members(current_user):
    """
    Retorna el directorio de usuarios según el alcance del rol:
    - Superadmin: Global o filtrado.
    - Admin Institucional: Su institución.
    - Líder de Depto: Directorio exclusivo de su departamento.
    - Otros roles: Denegado.
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
        query = query.filter(User.institution_id == str(institution_id))
        
    if current_user.role == 'lider_depto':
        dept = current_user.department or 'General'
        query = query.filter(User.department == dept)
        
    members = query.order_by(User.created_at.desc()).all()
    return jsonify([m.to_dict() for m in members]), 200

@institutions_bp.route('/members/<uuid:user_id>', methods=['PUT'])
@token_required
@permission_required('members')
def update_institution_member(current_user, user_id):
    """
    Actualiza el rol, departamento o contraseña de un usuario.
    RESTRICCIÓN: Solo SuperAdmin y Admin Institucional pueden modificar usuarios/roles.
    Líderes de Depto, Profesionales de Apoyo y Miembros NO tienen permiso.
    """
    if not can_manage_roles(current_user.role):
        return jsonify({'message': 'Acceso denegado: Su rol no tiene autorización para modificar usuarios o cambiar roles.'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404
        
    # Verificar aislamiento institucional si no es superadmin global
    if current_user.role != 'superadmin' and target_user.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para modificar usuarios de otra institución.'}), 403

    data = request.get_json() or {}
    
    if 'role' in data:
        new_role = data['role']
        valid_roles = ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro']
        if new_role in valid_roles:
            if current_user.role == 'admin_institucion' and new_role == 'superadmin':
                return jsonify({'message': 'Un Administrador Institucional no puede promover usuarios a SuperAdmin.'}), 403
            target_user.role = new_role

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

@institutions_bp.route('', methods=['GET'])
def list_public_institutions():
    """
    Ruta pública para listar instituciones en el formulario de registro.
    """
    from app.models.institution import Institution
    institutions = Institution.query.order_by(Institution.name.asc()).all()
    return jsonify([inst.to_dict() for inst in institutions]), 200

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


