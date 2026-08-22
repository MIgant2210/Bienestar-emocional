from flask import Blueprint, request, jsonify
from app import db
from app.models.reflection import Reflection
from app.models.evaluation import Evaluation
from app.models.resource import Resource
from app.models.consent import Consent
from app.models.appointment import Appointment
from app.utils.decorators import token_required
from app.services.audit_service import AuditService
from datetime import datetime, timedelta
from sqlalchemy import or_, desc

from app.models.task_model import Task
from app.models.notification import Notification
from app.models.kudos import Kudos

wellbeing_bp = Blueprint('wellbeing', __name__)

@wellbeing_bp.route('/dashboard-bundle', methods=['GET'])
@token_required
def get_dashboard_bundle(current_user):
    """
    Endpoint de Alto Rendimiento Agregado:
    Consolida en 1 sola llamada HTTP todo el paquete de datos necesario para renderizar
    el MemberDashboard (Mi Bienestar, Tareas, Historial, Evaluaciones y Notificaciones).
    Reduce de 7 peticiones secuenciales a 1 sola respuesta optimizada.
    """
    # 1. Historial de reflexiones recientes
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).limit(10).all()
    history_dicts = [r.to_dict() for r in reflections]
    last_reflection = history_dicts[0] if history_dicts else None

    # 2. Promedios recientes
    if reflections:
        recent_count = len(reflections)
        avg_stress = round(sum(r.stress_score for r in reflections) / recent_count, 1)
        avg_motivation = round(sum(r.motivation_score for r in reflections) / recent_count, 1)
        avg_burnout = round(sum(r.burnout_score for r in reflections) / recent_count, 1)
        status_label = "Indicadores que requieren atención" if (avg_stress > 70 or avg_burnout > 70) else ("Bienestar estable con tendencia positiva" if (avg_stress < 40 and avg_motivation > 60) else "Bienestar estable")
        status_tone = "warning" if (avg_stress > 70 or avg_burnout > 70) else ("success" if (avg_stress < 40 and avg_motivation > 60) else "info")
    else:
        avg_stress, avg_motivation, avg_burnout = 0, 0, 0
        status_label = "Sin registros recientes"
        status_tone = "neutral"

    # 3. Tareas activas del usuario
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_at.desc()).limit(15).all()
    tasks_dicts = [t.to_dict() for t in tasks]

    # 4. Evaluaciones activas
    eval_query = Evaluation.query.filter_by(is_active=True)
    if current_user.institution_id:
        eval_query = eval_query.filter(or_(Evaluation.institution_id == current_user.institution_id, Evaluation.institution_id.is_(None)))
    evaluations = eval_query.order_by(Evaluation.created_at.desc()).limit(10).all()
    eval_dicts = [e.to_dict() for e in evaluations]

    # 5. Conteo de notificaciones no leídas
    unread_notifs = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        'user': current_user.to_dict(),
        'summary': {
            'last_reflection': last_reflection,
            'recent_averages': {
                'stress': avg_stress,
                'motivation': avg_motivation,
                'burnout': avg_burnout
            },
            'status_label': status_label,
            'status_tone': status_tone
        },
        'history': history_dicts,
        'tasks': tasks_dicts,
        'evaluations': eval_dicts,
        'unread_notifications': unread_notifs,
        'xp': current_user.total_xp or 0,
        'streak': current_user.current_streak or 0
    }), 200

@wellbeing_bp.route('/summary', methods=['GET'])
@token_required
def get_wellbeing_summary(current_user):
    """
    Retorna el estado actual del bienestar personal del usuario:
    - Última reflexión o evaluación registrada.
    - Indicadores preventivos recientes.
    - Tendencia de participación.
    - Resumen orientativo con lenguaje preventivo (sin diagnósticos).
    """
    # Últimas reflexiones del usuario
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).limit(10).all()
    
    last_reflection = reflections[0].to_dict() if reflections else None
    
    # Calcular promedios recientes si existen registros
    if reflections:
        recent_count = len(reflections)
        avg_stress = round(sum(r.stress_score for r in reflections) / recent_count, 1)
        avg_motivation = round(sum(r.motivation_score for r in reflections) / recent_count, 1)
        avg_burnout = round(sum(r.burnout_score for r in reflections) / recent_count, 1)
        
        # Determinar estado de bienestar general preventivo
        if avg_stress > 70 or avg_burnout > 70:
            status_label = "Se identifican indicadores que requieren atención"
            status_tone = "warning"
            guidance = "Durante tus últimos registros se han detectado indicadores relacionados con tensión o sobrecarga. Te recomendamos revisar los recursos de descanso y respiración o solicitar apoyo profesional."
        elif avg_stress < 40 and avg_motivation > 60:
            status_label = "Bienestar estable con tendencia positiva"
            status_tone = "success"
            guidance = "Tus indicadores reflejan un ritmo saludable de energía y motivación. Continúa fomentando tus hábitos de autocuidado."
        else:
            status_label = "Bienestar estable"
            status_tone = "info"
            guidance = "Tus indicadores se mantienen en un rango balanceado. Recuerda realizar pausas activas durante tu jornada."
    else:
        avg_stress = 0
        avg_motivation = 0
        avg_burnout = 0
        status_label = "Sin registros recientes"
        status_tone = "neutral"
        guidance = "Aún no tienes registros suficientes. Completa tu primera reflexión o test para visualizar tus indicadores preventivos."

    # Tests asignados y pendientes
    pending_evals_count = 0
    if current_user.institution_id:
        user_dept = current_user.department or 'General'
        pending_evals_count = Evaluation.query.filter_by(
            institution_id=current_user.institution_id,
            is_active=True,
            is_template=False
        ).filter(
            or_(
                Evaluation.assigned_type == 'all',
                (Evaluation.assigned_type == 'department') & (Evaluation.assigned_target == user_dept),
                (Evaluation.assigned_type == 'individual') & (Evaluation.assigned_target == current_user.email)
            )
        ).count()

    return jsonify({
        'status_label': status_label,
        'status_tone': status_tone,
        'guidance': guidance,
        'last_reflection': last_reflection,
        'averages': {
            'stress': avg_stress,
            'motivation': avg_motivation,
            'burnout': avg_burnout,
            'general_wellbeing': round((avg_motivation + (100 - avg_stress) + (100 - avg_burnout)) / 3, 1) if reflections else 0
        },
        'total_records': len(reflections),
        'pending_evaluations_count': pending_evals_count,
        'current_streak': current_user.current_streak or 0,
        'total_xp': current_user.total_xp or 0
    }), 200


@wellbeing_bp.route('/history', methods=['GET'])
@token_required
def get_wellbeing_history(current_user):
    """
    Retorna el historial de bienestar emocional del usuario desde la base de datos
    con soporte para filtros temporales (7d, 30d, 3m, 6m, all).
    """
    period = request.args.get('period', '30d')
    now = datetime.utcnow()
    
    query = Reflection.query.filter_by(user_id=current_user.id)
    
    if period == '7d':
        start_date = now - timedelta(days=7)
        query = query.filter(Reflection.created_at >= start_date)
    elif period == '30d':
        start_date = now - timedelta(days=30)
        query = query.filter(Reflection.created_at >= start_date)
    elif period == '3m':
        start_date = now - timedelta(days=90)
        query = query.filter(Reflection.created_at >= start_date)
    elif period == '6m':
        start_date = now - timedelta(days=180)
        query = query.filter(Reflection.created_at >= start_date)
    # 'all' no aplica filtro de fecha
    
    records = query.order_by(Reflection.created_at.asc()).all()
    
    # Formatear datos para gráficas preventivas y lista
    chart_points = []
    for r in records:
        chart_points.append({
            'id': str(r.id),
            'fecha': r.created_at.strftime('%d/%m/%Y'),
            'timestamp': r.created_at.isoformat(),
            'Estrés': r.stress_score,
            'Motivación': r.motivation_score,
            'Agotamiento': r.burnout_score,
            'Bienestar General': round((r.motivation_score + (100 - r.stress_score) + (100 - r.burnout_score)) / 3, 1),
            'sentimiento': r.dominant_sentiment
        })
        
    return jsonify({
        'period': period,
        'total_points': len(records),
        'chart_data': chart_points,
        'records': [r.to_dict() for r in reversed(records)]
    }), 200


@wellbeing_bp.route('/my-evaluations', methods=['GET'])
@token_required
def get_my_evaluations(current_user):
    """
    Lista de evaluaciones y tests con su estado para el usuario actual:
    - Tests asignados / disponibles.
    - Tests realizados por el usuario con fecha y sus resultados personales.
    """
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify([]), 200
        
    user_dept = current_user.department or 'General'
    user_email = current_user.email
    
    available_evals = Evaluation.query.filter_by(
        institution_id=institution_id,
        is_active=True,
        is_template=False
    ).filter(
        or_(
            Evaluation.assigned_type == 'all',
            (Evaluation.assigned_type == 'department') & (Evaluation.assigned_target == user_dept),
            (Evaluation.assigned_type == 'individual') & (Evaluation.assigned_target == user_email)
        )
    ).order_by(desc(Evaluation.created_at)).all()
    
    # Obtener respuestas del usuario vinculadas a evaluaciones
    user_reflections = Reflection.query.filter_by(user_id=current_user.id).all()
    completed_eval_ids = {str(r.evaluation_id): r for r in user_reflections if r.evaluation_id}
    
    result = []
    for ev in available_evals:
        ev_dict = ev.to_dict()
        ev_id_str = str(ev.id)
        if ev_id_str in completed_eval_ids:
            matching_ref = completed_eval_ids[ev_id_str]
            ev_dict['user_status'] = 'completado'
            ev_dict['completed_at'] = matching_ref.created_at.isoformat()
            ev_dict['my_result'] = {
                'stress_score': matching_ref.stress_score,
                'motivation_score': matching_ref.motivation_score,
                'burnout_score': matching_ref.burnout_score,
                'dominant_sentiment': matching_ref.dominant_sentiment,
                'suggestion': matching_ref.institution_suggestion
            }
        else:
            ev_dict['user_status'] = 'pendiente'
            ev_dict['completed_at'] = None
            ev_dict['my_result'] = None
        result.append(ev_dict)
        
    return jsonify(result), 200


@wellbeing_bp.route('/trends', methods=['GET'])
@token_required
def get_wellbeing_trends(current_user):
    """
    Retorna tendencias comparativas de los indicadores clave:
    Estrés, Motivación, Agotamiento y Bienestar General.
    Clasificación preventiva: 'Mejorando', 'Estable', 'En observación', 'Requiere atención'.
    """
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).limit(10).all()
    
    if len(reflections) < 2:
        return jsonify({
            'has_sufficient_data': False,
            'message': 'No tienes suficientes registros para mostrar una tendencia. Registra al menos 2 reflexiones o evaluaciones.',
            'indicators': []
        }), 200
        
    # Comparar primera mitad con segunda mitad
    recent = reflections[:len(reflections)//2]
    older = reflections[len(reflections)//2:]
    
    recent_stress = sum(r.stress_score for r in recent) / len(recent)
    older_stress = sum(r.stress_score for r in older) / len(older)
    
    recent_mot = sum(r.motivation_score for r in recent) / len(recent)
    older_mot = sum(r.motivation_score for r in older) / len(older)
    
    recent_burn = sum(r.burnout_score for r in recent) / len(recent)
    older_burn = sum(r.burnout_score for r in older) / len(older)
    
    def calc_status(recent_val, older_val, is_inverse=False):
        diff = recent_val - older_val
        if abs(diff) < 5:
            return 'Estable', 'neutral'
        if is_inverse: # Para estrés y burnout, menor es mejor
            if diff < -5:
                return 'Mejorando', 'success'
            elif diff > 15:
                return 'Requiere atención', 'danger'
            else:
                return 'En observación', 'warning'
        else: # Para motivación y bienestar, mayor es mejor
            if diff > 5:
                return 'Mejorando', 'success'
            elif diff < -15:
                return 'Requiere atención', 'danger'
            else:
                return 'En observación', 'warning'

    stress_status, stress_tone = calc_status(recent_stress, older_stress, is_inverse=True)
    mot_status, mot_tone = calc_status(recent_mot, older_mot, is_inverse=False)
    burn_status, burn_tone = calc_status(recent_burn, older_burn, is_inverse=True)
    
    indicators = [
        {
            'name': 'Estrés',
            'current_value': round(recent_stress, 1),
            'previous_value': round(older_stress, 1),
            'status': stress_status,
            'tone': stress_tone,
            'description': 'Indicador preventivo relacionado con sobrecarga o presión percibida.'
        },
        {
            'name': 'Motivación',
            'current_value': round(recent_mot, 1),
            'previous_value': round(older_mot, 1),
            'status': mot_status,
            'tone': mot_tone,
            'description': 'Energía e interés hacia metas personales e institucionales.'
        },
        {
            'name': 'Agotamiento',
            'current_value': round(recent_burn, 1),
            'previous_value': round(older_burn, 1),
            'status': burn_status,
            'tone': burn_tone,
            'description': 'Nivel de fatiga física o cognitiva acumulada.'
        },
        {
            'name': 'Bienestar General',
            'current_value': round((recent_mot + (100 - recent_stress) + (100 - recent_burn)) / 3, 1),
            'previous_value': round((older_mot + (100 - older_stress) + (100 - older_burn)) / 3, 1),
            'status': 'Mejorando' if (recent_mot - older_mot > 0) else 'Estable',
            'tone': 'success' if (recent_mot - older_mot > 0) else 'info',
            'description': 'Balance integral de indicadores preventivos.'
        }
    ]
    
    return jsonify({
        'has_sufficient_data': True,
        'indicators': indicators
    }), 200


@wellbeing_bp.route('/recommendations', methods=['GET'])
@token_required
def get_wellbeing_recommendations(current_user):
    """
    Genera recomendaciones preventivas y no diagnósticas, orientadas al autocuidado.
    """
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).limit(5).all()
    
    recommendations = []
    
    if reflections:
        avg_stress = sum(r.stress_score for r in reflections) / len(reflections)
        avg_burnout = sum(r.burnout_score for r in reflections) / len(reflections)
        avg_motivation = sum(r.motivation_score for r in reflections) / len(reflections)
        
        if avg_stress > 65:
            recommendations.append({
                'id': 'rec_stress',
                'title': 'Estrategias para el manejo de la tensión',
                'text': 'Durante tus registros recientes se han identificado indicadores relacionados con estrés. Puedes consultar estos recursos para conocer técnicas de respiración y pausas activas.',
                'target_indicator': 'estres',
                'action_label': 'Ver recursos de estrés',
                'action_category': 'Manejo del estrés'
            })
            
        if avg_burnout > 65:
            recommendations.append({
                'id': 'rec_burnout',
                'title': 'Recuperación y límites saludables',
                'text': 'Tus registros sugieren acumulación de fatiga. Te recomendamos revisar guías sobre descanso restaurador y desconexión digital fuera de tu jornada.',
                'target_indicator': 'agotamiento',
                'action_label': 'Ver recursos de descanso',
                'action_category': 'Descanso'
            })
            
        if avg_motivation < 45:
            recommendations.append({
                'id': 'rec_motivation',
                'title': 'Impulso y organización de metas',
                'text': 'Observamos una oportunidad para renovar tu enfoque diario. La técnica de bloques de tiempo y pausas conscientes puede ayudarte a recuperar ritmo.',
                'target_indicator': 'motivacion',
                'action_label': 'Ver recursos de motivación',
                'action_category': 'Organización del tiempo'
            })
            
    # Recomendación general siempre presente
    if not recommendations:
        recommendations.append({
            'id': 'rec_general',
            'title': 'Mantenimiento del bienestar integral',
            'text': 'Tus indicadores se encuentran en equilibrio. Mantener hábitos constantes de hidratación, pausas activas y desconexión oportuna refuerza tu energía.',
            'target_indicator': 'general',
            'action_label': 'Explorar Centro de Recursos',
            'action_category': 'Hábitos saludables'
        })
        
    return jsonify({
        'recommendations': recommendations,
        'support_prompt': 'Si consideras que requieres acompañamiento profesional personalizado, puedes agendar una sesión 1 a 1 con el equipo de orientación.'
    }), 200


@wellbeing_bp.route('/resources', methods=['GET'])
@token_required
def get_resources(current_user):
    """
    Retorna el catálogo del Centro de Recursos almacenado en PostgreSQL.
    Permite filtrar por categoría (?category=...) y búsqueda por texto (?search=...).
    Incluye la lista de recomendados para el usuario según sus indicadores.
    """
    category_filter = request.args.get('category')
    search_query = request.args.get('search')
    type_filter = request.args.get('type')
    
    query = Resource.query.filter_by(is_published=True)
    
    if category_filter and category_filter != 'Todas':
        query = query.filter_by(category=category_filter)
        
    if type_filter and type_filter != 'Todos':
        query = query.filter_by(resource_type=type_filter)
        
    if search_query:
        term = f"%{search_query}%"
        query = query.filter(or_(Resource.title.ilike(term), Resource.description.ilike(term), Resource.content.ilike(term)))
        
    resources = query.order_by(Resource.created_at.desc()).all()
    
    # Identificar recursos recomendados basados en la última reflexión del usuario
    last_ref = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).first()
    recommended_indicator = 'general'
    if last_ref:
        if last_ref.stress_score > 60:
            recommended_indicator = 'estres'
        elif last_ref.burnout_score > 60:
            recommended_indicator = 'agotamiento'
        elif last_ref.motivation_score < 50:
            recommended_indicator = 'motivacion'
            
    recommended_resources = Resource.query.filter_by(is_published=True, target_indicator=recommended_indicator).limit(3).all()
    
    # Obtener todas las categorías únicas disponibles
    all_cats = db.session.query(Resource.category).distinct().all()
    categories_list = [c[0] for c in all_cats]
    
    return jsonify({
        'resources': [r.to_dict() for r in resources],
        'recommended': [r.to_dict() for r in recommended_resources],
        'categories': categories_list,
        'recommended_indicator': recommended_indicator
    }), 200


@wellbeing_bp.route('/consents', methods=['GET'])
@token_required
def get_user_consents(current_user):
    """
    Retorna el estado de los consentimientos informados del usuario.
    """
    consents = Consent.query.filter_by(user_id=current_user.id).all()
    consent_map = {c.consent_type: c.to_dict() for c in consents}
    
    types = ['wellbeing_data', 'ai_analysis', 'voice_analysis']
    result = []
    for t in types:
        if t in consent_map:
            result.append(consent_map[t])
        else:
            result.append({
                'id': None,
                'user_id': str(current_user.id),
                'consent_type': t,
                'status': 'not_accepted',
                'version': 'v1.0',
                'accepted_at': None,
                'revoked_at': None
            })
            
    return jsonify(result), 200


@wellbeing_bp.route('/consents', methods=['POST'])
@token_required
def accept_consent(current_user):
    """
    Registra la aceptación de un consentimiento informado específico.
    """
    data = request.get_json() or {}
    consent_type = data.get('consent_type')
    version = data.get('version', 'v1.0')
    
    if consent_type not in ['wellbeing_data', 'ai_analysis', 'voice_analysis']:
        return jsonify({'message': 'Tipo de consentimiento inválido.'}), 400
        
    consent = Consent.query.filter_by(user_id=current_user.id, consent_type=consent_type).first()
    
    if not consent:
        consent = Consent(
            user_id=current_user.id,
            institution_id=current_user.institution_id,
            consent_type=consent_type,
            status='accepted',
            version=version,
            accepted_at=datetime.utcnow()
        )
        db.session.add(consent)
    else:
        consent.status = 'accepted'
        consent.accepted_at = datetime.utcnow()
        consent.revoked_at = None
        consent.version = version
        
    try:
        db.session.commit()
        
        # Registrar auditoría de aceptación de consentimiento
        AuditService.log_action(
            user_id=current_user.id,
            action="CONSENT_ACCEPTED",
            details=f"Consentimiento aceptado: {consent_type} ({version})",
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'message': 'Consentimiento registrado exitosamente.',
            'consent': consent.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al guardar consentimiento: {str(e)}'}), 500


@wellbeing_bp.route('/consents/revoke', methods=['POST'])
@token_required
def revoke_consent(current_user):
    """
    Revoca un consentimiento informado con trazabilidad en auditoría.
    """
    data = request.get_json() or {}
    consent_type = data.get('consent_type')
    
    if not consent_type:
        return jsonify({'message': 'Debe especificar el tipo de consentimiento a revocar.'}), 400
        
    consent = Consent.query.filter_by(user_id=current_user.id, consent_type=consent_type).first()
    if not consent:
        return jsonify({'message': 'No se encontró un consentimiento activo para este tipo.'}), 404
        
    consent.status = 'revoked'
    consent.revoked_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # Registrar en auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="CONSENT_REVOKED",
            details=f"Consentimiento revocado: {consent_type}",
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'message': f'Consentimiento {consent_type} revocado exitosamente.',
            'consent': consent.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al revocar consentimiento: {str(e)}'}), 500
