from flask import Blueprint, request, jsonify, send_file
import io
import asyncio
import edge_tts
from app import db
from app.models.reflection import Reflection
from app.models.evaluation import Evaluation
from app.models.resource import Resource, ResourceFavorite, ResourceProgress
from app.models.consent import Consent
from app.models.appointment import Appointment
from app.utils.decorators import token_required
from app.services.audit_service import AuditService
from app.services.gamification_service import GamificationService
from app.services.resource_seed_service import ResourceSeedService
from datetime import datetime, timedelta
from sqlalchemy import or_, desc, func, and_, case

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

    # 3. Tareas activas del usuario (asignadas a todos, a su departamento o individuales)
    user_dept = current_user.department or 'General'
    tasks = Task.query.filter(
        or_(
            Task.institution_id == current_user.institution_id,
            Task.institution_id.is_(None)
        ),
        or_(
            Task.assigned_type == 'all',
            Task.assigned_type.is_(None),
            (Task.assigned_type == 'department') & (Task.assigned_target == user_dept),
            (Task.assigned_type == 'individual') & (Task.assigned_target == current_user.email),
            Task.user_id == current_user.id
        )
    ).order_by(Task.created_at.desc()).limit(30).all()
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
    Genera recomendaciones preventivas y no diagnósticas, orientadas al autocuidado,
    vinculando recursos reales y certeros del Centro de Recursos.
    """
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).limit(5).all()
    
    recommendations = []
    
    if reflections:
        avg_stress = sum(r.stress_score for r in reflections) / len(reflections)
        avg_burnout = sum(r.burnout_score for r in reflections) / len(reflections)
        avg_motivation = sum(r.motivation_score for r in reflections) / len(reflections)
        latest_text = (reflections[0].original_text or '').lower()
        
        if avg_stress > 50 or any(k in latest_text for k in ['tenso', 'tensión', 'estrés', 'presión', 'ansiedad']):
            recommendations.append({
                'id': 'rec_stress',
                'title': 'Estrategias para el manejo de la tensión y calma mental',
                'text': 'Durante tus registros recientes se han identificado indicadores relacionados con estrés o tensión muscular. Te sugerimos realizar ejercicios de respiración guiada, pausas activas o grounding sensorial.',
                'target_indicator': 'estres',
                'action_label': 'Ver Recursos de Calma',
                'action_category': 'Manejo del estrés'
            })
            
        if avg_burnout > 50 or any(k in latest_text for k in ['cansado', 'cansancio', 'agotado', 'agotamiento', 'fatiga', 'sueño']):
            recommendations.append({
                'id': 'rec_burnout',
                'title': 'Recuperación de energía, descanso e higiene del sueño',
                'text': 'Tus registros sugieren acumulación de fatiga física o mental. Te recomendamos revisar protocolos de desconexión digital, higiene del sueño y pausas posturales.',
                'target_indicator': 'agotamiento',
                'action_label': 'Ver Recursos de Descanso',
                'action_category': 'Descanso'
            })
            
        if avg_motivation < 55 or any(k in latest_text for k in ['desmotivado', 'bloqueado', 'estancado']):
            recommendations.append({
                'id': 'rec_motivation',
                'title': 'Impulso, autoeficacia y organización de metas',
                'text': 'Observamos una oportunidad para renovar tu enfoque diario. La técnica de bloques de tiempo, las prácticas de gratitud y los retos de bienestar pueden ayudarte a recuperar tu ritmo.',
                'target_indicator': 'motivacion',
                'action_label': 'Ver Recursos de Motivación',
                'action_category': 'Motivación'
            })
            
    # Recomendación general siempre presente si no hay alertas específicas
    if not recommendations:
        recommendations.append({
            'id': 'rec_general',
            'title': 'Mantenimiento del bienestar integral y hábitos saludables',
            'text': 'Tus indicadores se encuentran en un rango equilibrado. Mantener hábitos constantes de hidratación, pausas activas breves y rutinas de autocuidado refuerza tu energía.',
            'target_indicator': 'general',
            'action_label': 'Explorar Centro de Recursos',
            'action_category': 'Autocuidado'
        })

    # Vincular recursos certeros de la base de datos a cada tarjeta de recomendación
    for rec in recommendations:
        ind = rec.get('target_indicator', 'general')
        cat = rec.get('action_category')
        
        q = Resource.query.filter_by(is_published=True)
        if ind != 'general':
            matched = q.filter(
                or_(Resource.target_indicator == ind, Resource.category == cat, Resource.target_indicator == 'general')
            ).order_by(
                case((Resource.target_indicator == ind, 0), else_=1),
                Resource.created_at.desc()
            ).limit(3).all()
        else:
            matched = q.order_by(Resource.created_at.desc()).limit(3).all()
            
        rec['resources'] = [r.to_dict(current_user.id) for r in matched]
        
    return jsonify({
        'recommendations': recommendations,
        'support_prompt': 'Si consideras que requieres acompañamiento profesional personalizado, puedes agendar una sesión 1 a 1 con el equipo de orientación en la pestaña Agenda de Citas.'
    }), 200


OFFICIAL_RESOURCE_CATEGORIES = [
    'Bienestar emocional',
    'Manejo del estrés',
    'Ansiedad y preocupación',
    'Motivación',
    'Autoestima',
    'Inteligencia emocional',
    'Relaciones interpersonales',
    'Comunicación',
    'Autocuidado',
    'Descanso',
    'Hábitos saludables',
    'Organización del tiempo',
    'Ambiente educativo',
    'Ambiente laboral',
    'Prevención del agotamiento',
    'Manejo de emociones',
    'Salud mental',
    'Necesito ayuda',
    'Cultura y bienestar en Guatemala'
]

@wellbeing_bp.route('/resources', methods=['GET'])
@token_required
def get_resources(current_user):
    """
    Retorna el catálogo enriquecido del Centro de Recursos almacenado en PostgreSQL.
    Soporta búsqueda textual por título, descripción y tags, filtros por categoría,
    tipo, nivel, duración estimada, favoritos del usuario y estado de progreso ('no_iniciado', 'en_progreso', 'completado').
    """
    # Si la tabla está vacía, sembrar catálogo de alta calidad
    if Resource.query.count() == 0:
        ResourceSeedService.seed_resources_if_empty()

    category_filter = request.args.get('category')
    search_query = request.args.get('search', '').strip()
    type_filter = request.args.get('type')
    level_filter = request.args.get('level')
    duration_filter = request.args.get('duration') # 'short' (<5m), 'medium' (5-10m), 'long' (>10m)
    status_filter = request.args.get('status') # 'no_iniciado', 'en_progreso', 'completado'
    favorites_only = request.args.get('favorites_only', 'false').lower() in ['true', '1', 'yes']
    sort_by = request.args.get('sort_by', 'recent') # 'recent', 'popular', 'duration_asc', 'xp_desc', 'recommended'

    # Rol del usuario: SuperAdmin/Admin/Psicóloga pueden ver recursos no publicados si lo solicitan
    include_unpublished = request.args.get('include_unpublished', 'false').lower() == 'true' and current_user.role in ['superadmin', 'admin_institucion', 'profesional_apoyo']

    query = Resource.query
    if not include_unpublished:
        query = query.filter_by(is_published=True)

    # Filtrar por pertenencia institucional o global
    if current_user.institution_id:
        query = query.filter(or_(Resource.institution_id.is_(None), Resource.institution_id == current_user.institution_id))

    # Filtro de Favoritos
    if favorites_only:
        fav_resource_ids = [f.resource_id for f in ResourceFavorite.query.filter_by(user_id=current_user.id).all()]
        query = query.filter(Resource.id.in_(fav_resource_ids))

    # Filtro de Categoría
    if category_filter and category_filter not in ['Todas', 'todos', 'all']:
        query = query.filter_by(category=category_filter)

    # Filtro de Tipo
    if type_filter and type_filter not in ['Todos', 'todos', 'all']:
        query = query.filter_by(resource_type=type_filter)

    # Filtro de Nivel
    if level_filter and level_filter not in ['Todos', 'todos', 'all']:
        query = query.filter_by(level=level_filter)

    # Filtro de Duración
    if duration_filter == 'short':
        query = query.filter(Resource.reading_time_minutes <= 5)
    elif duration_filter == 'medium':
        query = query.filter(and_(Resource.reading_time_minutes > 5, Resource.reading_time_minutes <= 10))
    elif duration_filter == 'long':
        query = query.filter(Resource.reading_time_minutes > 10)

    # Búsqueda por texto (Título, Descripción, Contenido, Tags, Autor)
    if search_query:
        term = f"%{search_query}%"
        query = query.filter(or_(
            Resource.title.ilike(term),
            Resource.description.ilike(term),
            Resource.content.ilike(term),
            Resource.tags.ilike(term),
            Resource.author.ilike(term),
            Resource.category.ilike(term)
        ))

    # Ordenamiento
    if sort_by == 'duration_asc':
        query = query.order_by(Resource.reading_time_minutes.asc(), Resource.created_at.desc())
    elif sort_by == 'xp_desc':
        query = query.order_by(Resource.xp_reward.desc(), Resource.created_at.desc())
    else:
        query = query.order_by(Resource.created_at.desc())

    resources = query.all()

    # Mapear progreso y favoritos del usuario autenticado
    user_fav_ids = set(f.resource_id for f in ResourceFavorite.query.filter_by(user_id=current_user.id).all())
    user_progress_map = {p.resource_id: p for p in ResourceProgress.query.filter_by(user_id=current_user.id).all()}

    resource_dicts = []
    for r in resources:
        r_dict = r.to_dict()
        r_dict['is_favorite'] = r.id in user_fav_ids
        prog = user_progress_map.get(r.id)
        if prog:
            r_dict['progress'] = {
                'status': prog.status,
                'progress_percent': prog.progress_percent,
                'started_at': prog.started_at.isoformat() if prog.started_at else None,
                'last_read_at': prog.last_read_at.isoformat() if prog.last_read_at else None,
                'completed_at': prog.completed_at.isoformat() if prog.completed_at else None,
                'interactive_answers': prog.interactive_answers or {}
            }
        else:
            r_dict['progress'] = {
                'status': 'no_iniciado',
                'progress_percent': 0,
                'started_at': None,
                'last_read_at': None,
                'completed_at': None,
                'interactive_answers': {}
            }

        # Filtro post-query por estado si se solicitó
        if status_filter and status_filter in ['no_iniciado', 'en_progreso', 'completado']:
            if r_dict['progress']['status'] != status_filter:
                continue

        resource_dicts.append(r_dict)

    # Identificar recursos recomendados basados en la última reflexión del usuario (Lenguaje neutral y respetuoso)
    last_ref = Reflection.query.filter_by(user_id=current_user.id).order_by(desc(Reflection.created_at)).first()
    recommended_indicator = 'general'
    recommended_label = "Recursos recomendados para tu equilibrio diario y autocuidado integral"
    
    if last_ref:
        ref_text = (last_ref.original_text or '').lower()
        if last_ref.stress_score > 50 or any(k in ref_text for k in ['tenso', 'tensión', 'estrés', 'presión', 'ansiedad']):
            recommended_indicator = 'estres'
            recommended_label = "Recomendaciones certeras para disipar la tensión y calmar la mente"
        elif last_ref.burnout_score > 50 or any(k in ref_text for k in ['cansado', 'cansancio', 'agotado', 'agotamiento', 'fatiga', 'sueño']):
            recommended_indicator = 'agotamiento'
            recommended_label = "Recomendaciones certeras para recargar energía y descanso reparador"
        elif last_ref.motivation_score < 55 or any(k in ref_text for k in ['desmotivado', 'bloqueado', 'estancado']):
            recommended_indicator = 'motivacion'
            recommended_label = "Recomendaciones certeras para activar tu motivación y enfoque"

    rec_query = Resource.query.filter_by(is_published=True)
    if recommended_indicator != 'general':
        recommended_resources = rec_query.filter(
            or_(Resource.target_indicator == recommended_indicator, Resource.target_indicator == 'general')
        ).order_by(
            case((Resource.target_indicator == recommended_indicator, 0), else_=1),
            Resource.created_at.desc()
        ).limit(4).all()
    else:
        recommended_resources = rec_query.order_by(Resource.created_at.desc()).limit(4).all()

    # Combinar categorías de la BD con las 19 oficiales
    db_cats = [c[0] for c in db.session.query(Resource.category).distinct().all() if c[0]]
    combined_cats = list(dict.fromkeys(OFFICIAL_RESOURCE_CATEGORIES + db_cats))

    return jsonify({
        'resources': resource_dicts,
        'recommended': [r.to_dict(current_user.id) for r in recommended_resources],
        'categories': combined_cats,
        'recommended_indicator': recommended_indicator,
        'recommended_label': recommended_label,
        'total_count': len(resource_dicts)
    }), 200


@wellbeing_bp.route('/resources/<uuid:res_id>', methods=['GET'])
@token_required
def get_resource_detail(current_user, res_id):
    """
    Retorna el detalle completo de un recurso específico con su estado de favorito y progreso.
    """
    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    return jsonify(resource.to_dict(user_id=current_user.id)), 200


@wellbeing_bp.route('/resources/<uuid:res_id>/favorite', methods=['POST', 'DELETE'])
@token_required
def toggle_resource_favorite(current_user, res_id):
    """
    Guarda o elimina (toggle) un recurso de los favoritos personales del usuario en PostgreSQL.
    """
    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    existing_fav = ResourceFavorite.query.filter_by(user_id=current_user.id, resource_id=res_id).first()

    if request.method == 'DELETE' or existing_fav:
        if existing_fav:
            db.session.delete(existing_fav)
            db.session.commit()
        return jsonify({'message': 'Recurso removido de tus guardados.', 'is_favorite': False}), 200
    else:
        new_fav = ResourceFavorite(user_id=current_user.id, resource_id=res_id)
        db.session.add(new_fav)
        db.session.commit()
        return jsonify({'message': '¡Recurso guardado en tus favoritos!', 'is_favorite': True}), 200


@wellbeing_bp.route('/resources/<uuid:res_id>/progress', methods=['POST'])
@token_required
def update_resource_progress(current_user, res_id):
    """
    Actualiza el porcentaje de lectura o interacción de un recurso.
    """
    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    data = request.get_json() or {}
    progress_percent = max(0, min(100, int(data.get('progress_percent', 0))))

    prog = ResourceProgress.query.filter_by(user_id=current_user.id, resource_id=res_id).first()
    if not prog:
        prog = ResourceProgress(
            user_id=current_user.id,
            resource_id=res_id,
            status='en_progreso' if progress_percent < 100 else 'completado',
            progress_percent=progress_percent,
            started_at=datetime.utcnow(),
            last_read_at=datetime.utcnow()
        )
        db.session.add(prog)
    else:
        prog.progress_percent = max(prog.progress_percent, progress_percent)
        prog.last_read_at = datetime.utcnow()
        if prog.status != 'completado' and prog.progress_percent >= 100:
            prog.status = 'completado'
            prog.completed_at = datetime.utcnow()
        elif prog.status == 'no_iniciado' and progress_percent > 0:
            prog.status = 'en_progreso'

    db.session.commit()
    return jsonify({'message': 'Progreso actualizado.', 'progress': prog.to_dict()}), 200


@wellbeing_bp.route('/resources/<uuid:res_id>/complete', methods=['POST'])
@token_required
def complete_resource(current_user, res_id):
    """
    Marca el recurso como completado, otorga los XP correspondientes mediante GamificationService
    (con anti-duplicados por reference_id), actualiza la racha de participación y desbloquea medallas.
    """
    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    prog = ResourceProgress.query.filter_by(user_id=current_user.id, resource_id=res_id).first()
    if not prog:
        prog = ResourceProgress(
            user_id=current_user.id,
            resource_id=res_id,
            status='completado',
            progress_percent=100,
            started_at=datetime.utcnow(),
            last_read_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        db.session.add(prog)
    else:
        prog.status = 'completado'
        prog.progress_percent = 100
        prog.last_read_at = datetime.utcnow()
        if not prog.completed_at:
            prog.completed_at = datetime.utcnow()

    db.session.commit()

    # Otorgar XP mediante GamificationService evitando duplicidad
    xp_to_award = resource.xp_reward or 15
    gamification_res = GamificationService.award_xp(
        user_id=current_user.id,
        action_type='resource_completed',
        reference_id=str(resource.id),
        custom_description=f"Completaste: {resource.title}"
    )

    # Actualizar racha diaria si el recurso cuenta para racha
    if resource.counts_for_streak:
        GamificationService.record_activity_day(current_user.id, 'resource_reading')

    # ── VALIDACIÓN AUTOMÁTICA DE TAREAS VINCULADAS ──
    # Si el usuario tiene tareas pendientes vinculadas a este recurso, marcarlas automáticamente como completadas
    user_dept = current_user.department or 'General'
    linked_tasks = Task.query.filter(
        Task.resource_id == res_id,
        Task.status != 'completada',
        or_(
            Task.institution_id == current_user.institution_id,
            Task.institution_id.is_(None)
        ),
        or_(
            Task.assigned_type == 'all',
            Task.assigned_type.is_(None),
            (Task.assigned_type == 'department') & (Task.assigned_target == user_dept),
            (Task.assigned_type == 'individual') & (Task.assigned_target == current_user.email),
            Task.user_id == current_user.id
        )
    ).all()
    completed_task_ids = []
    for t in linked_tasks:
        t.status = 'completada'
        t.board_column = 'completed'
        t.completed_at = datetime.utcnow()
        t.submission_notes = f"Recurso '{resource.title}' completado con éxito mediante el reproductor interactivo."
        completed_task_ids.append(str(t.id))
    if linked_tasks:
        db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="RESOURCE_COMPLETED",
        details=f"Usuario completó recurso '{resource.title}' ({resource.resource_type}). Tareas vinculadas validadas: {len(completed_task_ids)}. XP ganado: {gamification_res.get('xp_gained', 0)}."
    )

    return jsonify({
        'message': f'¡Excelente! Has completado "{resource.title}".',
        'progress': prog.to_dict(),
        'completed_tasks_count': len(completed_task_ids),
        'completed_task_ids': completed_task_ids,
        'gamification': {
            'xp_gained': gamification_res.get('xp_gained', 0) if gamification_res else 0,
            'total_xp': current_user.total_xp,
            'current_streak': current_user.current_streak,
            'already_awarded': gamification_res.get('already_awarded', False) if gamification_res else False,
            'new_badges': gamification_res.get('new_badges', []) if gamification_res else []
        }
    }), 200


@wellbeing_bp.route('/resources/<uuid:res_id>/interactive-submit', methods=['POST'])
@token_required
def submit_interactive_answer(current_user, res_id):
    """
    Guarda respuestas interactivas privadas (ítems de checklist o respuestas a reflexiones guiadas)
    asociadas exclusivamente al usuario.
    """
    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    data = request.get_json() or {}
    answers = data.get('answers', {})

    prog = ResourceProgress.query.filter_by(user_id=current_user.id, resource_id=res_id).first()
    if not prog:
        prog = ResourceProgress(
            user_id=current_user.id,
            resource_id=res_id,
            status='en_progreso',
            progress_percent=50,
            interactive_answers=answers,
            started_at=datetime.utcnow(),
            last_read_at=datetime.utcnow()
        )
        db.session.add(prog)
    else:
        current_answers = prog.interactive_answers or {}
        current_answers.update(answers)
        prog.interactive_answers = current_answers
        prog.last_read_at = datetime.utcnow()

    db.session.commit()
    return jsonify({
        'message': 'Respuestas interactivas guardadas de forma segura y confidencial.',
        'interactive_answers': prog.interactive_answers
    }), 200


# ==============================================================================
# GESTIÓN ADMINISTRATIVA DE RECURSOS (SUPERADMIN / ADMIN INSTITUCIONAL / PSICÓLOGA)
# ==============================================================================

def validate_resource_config(resource_type, config):
    """
    Valida la estructura de configuración específica según el tipo de recurso dinámico (15 tipos).
    Retorna (is_valid, error_message, sanitized_config).
    """
    if not isinstance(config, dict):
        config = {}

    sanitized = dict(config)

    if resource_type == 'checklist':
        items = config.get('items', [])
        if not isinstance(items, list) or len(items) == 0:
            return False, "Un recurso de tipo Checklist debe contener al menos un elemento interactivo.", None
        sanitized_items = []
        for idx, it in enumerate(items):
            if not isinstance(it, dict) or not str(it.get('text', '')).strip():
                return False, f"El elemento #{idx+1} del checklist no tiene un texto válido.", None
            sanitized_items.append({
                'id': it.get('id', f'item_{idx+1}'),
                'text': str(it.get('text', '')).strip(),
                'required': bool(it.get('required', True)),
                'xp': int(it.get('xp', 2)),
                'icon': str(it.get('icon', ''))
            })
        sanitized['items'] = sanitized_items
        sanitized['completion_behavior'] = config.get('completion_behavior', 'all_required')
        sanitized['min_percent'] = int(config.get('min_percent', 80))
        sanitized['completion_message'] = str(config.get('completion_message', '¡Excelente trabajo completando tu checklist!')).strip()

    elif resource_type == 'respiracion':
        try:
            inhale = int(config.get('inhale', 4))
            hold_in = int(config.get('hold_in', 4))
            exhale = int(config.get('exhale', 4))
            hold_out = int(config.get('hold_out', 0))
            cycles = int(config.get('cycles', 4))
        except (ValueError, TypeError):
            return False, "Los tiempos de respiración y ciclos deben ser números enteros positivos.", None

        if inhale <= 0 or exhale <= 0 or cycles <= 0:
            return False, "Los tiempos de inhalación, exhalación y ciclos deben ser mayores a 0 segundos.", None

        sanitized['inhale'] = inhale
        sanitized['hold_in'] = max(0, hold_in)
        sanitized['exhale'] = exhale
        sanitized['hold_out'] = max(0, hold_out)
        sanitized['cycles'] = cycles
        sanitized['technique_name'] = str(config.get('technique_name', 'Respiración Consciente')).strip()
        sanitized['total_seconds'] = (inhale + max(0, hold_in) + exhale + max(0, hold_out)) * cycles
        sanitized['sound_theme'] = str(config.get('sound_theme', 'zen_ambient')).strip()
        sanitized['voice_guide'] = bool(config.get('voice_guide', True))

    elif resource_type == 'reflexion':
        main_q = str(config.get('main_question', '')).strip()
        if not main_q:
            return False, "La reflexión debe incluir una pregunta principal de orientación.", None
        sanitized['main_question'] = main_q
        sanitized['secondary_questions'] = [str(q).strip() for q in config.get('secondary_questions', []) if str(q).strip()]
        sanitized['response_type'] = str(config.get('response_type', 'text')).strip()
        sanitized['options'] = config.get('options', [])
        sanitized['is_private'] = bool(config.get('is_private', True))

    elif resource_type == 'registro_emocional':
        sanitized['available_emotions'] = config.get('available_emotions', ['Calma', 'Alegría', 'Tensión', 'Cansancio', 'Motivación', 'Tristeza', 'Frustración', 'Agradecimiento'])
        sanitized['track_intensity'] = bool(config.get('track_intensity', True))
        sanitized['additional_prompt'] = str(config.get('additional_prompt', '¿Qué factor o situación influyó principalmente en tu estado de hoy?')).strip()
        sanitized['tags'] = config.get('tags', ['Trabajo', 'Familia', 'Salud', 'Descanso', 'Metas'])

    elif resource_type == 'audio':
        sanitized['audio_url'] = str(config.get('audio_url', '')).strip()
        sanitized['narrator'] = str(config.get('narrator', 'Sofía Gómez')).strip()
        sanitized['duration_minutes'] = int(config.get('duration_minutes', 5))
        sanitized['transcription'] = str(config.get('transcription', '')).strip()
        sanitized['background_music'] = str(config.get('background_music', 'calm_piano')).strip()

    elif resource_type == 'reto':
        duration_days = int(config.get('duration_days', 7))
        if duration_days <= 0 or duration_days > 60:
            return False, "La duración del reto debe estar entre 1 y 60 días.", None
        days = config.get('days', [])
        if not isinstance(days, list) or len(days) == 0:
            days = [{'day': i+1, 'title': f'Día {i+1}', 'task': f'Actividad de bienestar del día {i+1}', 'xp': 5} for i in range(duration_days)]
        sanitized['duration_days'] = duration_days
        sanitized['days'] = days
        sanitized['final_reward_xp'] = int(config.get('final_reward_xp', 50))
        sanitized['badge_unlock'] = str(config.get('badge_unlock', 'Campeón de Bienestar')).strip()

    elif resource_type == 'diario':
        prompts = config.get('prompts', ['¿Cómo fue mi día?', '¿Qué me preocupó o generó tensión?', '¿Qué agradezco hoy?'])
        sanitized['prompts'] = [str(p).strip() for p in prompts if str(p).strip()]
        sanitized['is_private'] = True

    elif resource_type == 'gratitud':
        item_count = int(config.get('item_count', 3))
        sanitized['item_count'] = max(1, min(10, item_count))
        sanitized['prompt_text'] = str(config.get('prompt_text', 'Escribe 3 cosas por las que te sientas agradecido el día de hoy.')).strip()

    elif resource_type == 'quiz':
        questions = config.get('questions', [])
        if not isinstance(questions, list) or len(questions) == 0:
            return False, "Un Quiz Educativo debe incluir al menos una pregunta.", None
        sanitized_questions = []
        for idx, q in enumerate(questions):
            if not isinstance(q, dict) or not str(q.get('question', '')).strip():
                return False, f"La pregunta #{idx+1} del quiz no tiene un enunciado válido.", None
            options = q.get('options', [])
            if not isinstance(options, list) or len(options) < 2:
                return False, f"La pregunta #{idx+1} debe tener al menos 2 opciones de respuesta.", None
            if q.get('correct_answer') is None or str(q.get('correct_answer', '')) == '':
                return False, f"La pregunta #{idx+1} debe especificar cuál es la opción correcta.", None
            sanitized_questions.append({
                'id': q.get('id', f'q_{idx+1}'),
                'question': str(q.get('question', '')).strip(),
                'type': q.get('type', 'single'),
                'options': [str(opt).strip() for opt in options],
                'correct_answer': q.get('correct_answer'),
                'explanation': str(q.get('explanation', '')).strip()
            })
        sanitized['questions'] = sanitized_questions
        sanitized['disclaimer'] = "Este quiz es de naturaleza estrictamente educativa y pedagógica, no constituye diagnóstico médico ni clínico."

    elif resource_type == 'video':
        sanitized['video_url'] = str(config.get('video_url', '')).strip()
        sanitized['thumbnail_url'] = str(config.get('thumbnail_url', '')).strip()
        sanitized['duration_minutes'] = int(config.get('duration_minutes', 5))
        sanitized['transcription'] = str(config.get('transcription', '')).strip()

    elif resource_type == 'consejo':
        sanitized['key_takeaway'] = str(config.get('key_takeaway', '')).strip()
        sanitized['icon_badge'] = str(config.get('icon_badge', '💡')).strip()

    elif resource_type == 'grounding':
        technique = str(config.get('technique', '5-4-3-2-1')).strip()
        steps = config.get('steps', [
            {'step': 5, 'sensory': 'Vista', 'instruction': 'Observa 5 cosas a tu alrededor que puedas ver con atención.', 'duration': 20},
            {'step': 4, 'sensory': 'Tacto', 'instruction': 'Siente 4 texturas o sensaciones físicas en tu cuerpo o entorno.', 'duration': 20},
            {'step': 3, 'sensory': 'Oído', 'instruction': 'Escucha 3 sonidos distintos en tu ambiente actual.', 'duration': 15},
            {'step': 2, 'sensory': 'Olfato', 'instruction': 'Identifica 2 aromas o respira profundamente para percibir el aire.', 'duration': 15},
            {'step': 1, 'sensory': 'Gusto', 'instruction': 'Conecta con 1 sensación de sabor o bebe un sorbo de agua.', 'duration': 10}
        ])
        sanitized['technique'] = technique
        sanitized['steps'] = steps

    elif resource_type == 'pausa_activa':
        steps = config.get('steps', [
            {'step': 1, 'title': 'Estiramiento de cuello', 'instruction': 'Gira suavemente la cabeza hacia la derecha durante 15s y luego a la izquierda.', 'duration': 30},
            {'step': 2, 'title': 'Rotación de hombros', 'instruction': 'Haz círculos con los hombros hacia atrás y hacia adelante.', 'duration': 30},
            {'step': 3, 'title': 'Extensión de espalda', 'instruction': 'Entrelaza las manos y estira los brazos hacia el frente y hacia arriba.', 'duration': 30}
        ])
        sanitized['steps'] = steps

    return True, None, sanitized


@wellbeing_bp.route('/resources', methods=['POST'])
@token_required
def create_resource(current_user):
    """
    Crea un nuevo recurso en el catálogo mediante el Constructor Inteligente.
    """
    if current_user.role not in ['superadmin', 'admin_institucion', 'profesional_apoyo']:
        return jsonify({'message': 'Acceso denegado: Su rol no tiene permisos para crear recursos.'}), 403

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    content = (data.get('content') or '').strip()
    resource_type = data.get('resource_type', 'articulo')

    if not title or not description or not content:
        return jsonify({'message': 'Título, descripción y contenido son obligatorios.'}), 400

    raw_config = data.get('resource_config') or data.get('interactive_data') or {}
    is_valid, err_msg, sanitized_config = validate_resource_config(resource_type, raw_config)
    if not is_valid:
        return jsonify({'message': f'Error de validación en la plantilla ({resource_type}): {err_msg}'}), 400

    new_res = Resource(
        title=title,
        description=description,
        content=content,
        category=data.get('category', 'Bienestar emocional'),
        resource_type=resource_type,
        image_url=data.get('image_url'),
        author=data.get('author', f"{current_user.first_name} {current_user.last_name}"),
        reading_time_minutes=int(data.get('reading_time_minutes', 5)),
        level=data.get('level', 'principiante'),
        tags=data.get('tags', ''),
        source_url=data.get('source_url'),
        source_institution=data.get('source_institution', 'Institucional'),
        xp_reward=int(data.get('xp_reward', 15)),
        counts_for_streak=bool(data.get('counts_for_streak', True)),
        allow_ai_recommendation=bool(data.get('allow_ai_recommendation', True)),
        interactive_type=resource_type,
        interactive_data=sanitized_config,
        media_url=data.get('media_url') or sanitized_config.get('audio_url') or sanitized_config.get('video_url'),
        target_indicator=data.get('target_indicator', 'general'),
        is_published=bool(data.get('is_published', True)),
        institution_id=current_user.institution_id if current_user.role != 'superadmin' else data.get('institution_id')
    )
    db.session.add(new_res)
    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="RESOURCE_CREATED",
        details=f"Recurso '{new_res.title}' ({new_res.resource_type}) creado por {current_user.first_name} {current_user.last_name}."
    )

    return jsonify({
        'message': 'Recurso creado exitosamente.',
        'resource': new_res.to_dict()
    }), 201


@wellbeing_bp.route('/resources/<uuid:res_id>', methods=['PUT'])
@token_required
def update_resource(current_user, res_id):
    """
    Edita un recurso existente mediante el Constructor Inteligente.
    """
    if current_user.role not in ['superadmin', 'admin_institucion', 'profesional_apoyo']:
        return jsonify({'message': 'Acceso denegado: Su rol no puede editar recursos.'}), 403

    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    # Aislamiento institucional
    if current_user.role != 'superadmin' and resource.institution_id and str(resource.institution_id) != str(current_user.institution_id):
        return jsonify({'message': 'No puede modificar recursos de otra institución.'}), 403

    data = request.get_json() or {}
    resource_type = data.get('resource_type', resource.resource_type)

    if 'resource_config' in data or 'interactive_data' in data:
        raw_config = data.get('resource_config') or data.get('interactive_data') or {}
        is_valid, err_msg, sanitized_config = validate_resource_config(resource_type, raw_config)
        if not is_valid:
            return jsonify({'message': f'Error de validación en la plantilla ({resource_type}): {err_msg}'}), 400
        resource.interactive_data = sanitized_config
        resource.interactive_type = resource_type

    if 'title' in data: resource.title = data['title'].strip()
    if 'description' in data: resource.description = data['description'].strip()
    if 'content' in data: resource.content = data['content'].strip()
    if 'category' in data: resource.category = data['category']
    if 'resource_type' in data: resource.resource_type = resource_type
    if 'image_url' in data: resource.image_url = data['image_url']
    if 'author' in data: resource.author = data['author']
    if 'reading_time_minutes' in data: resource.reading_time_minutes = int(data['reading_time_minutes'])
    if 'level' in data: resource.level = data['level']
    if 'tags' in data: resource.tags = data['tags']
    if 'source_url' in data: resource.source_url = data['source_url']
    if 'source_institution' in data: resource.source_institution = data['source_institution']
    if 'xp_reward' in data: resource.xp_reward = int(data['xp_reward'])
    if 'counts_for_streak' in data: resource.counts_for_streak = bool(data['counts_for_streak'])
    if 'allow_ai_recommendation' in data: resource.allow_ai_recommendation = bool(data['allow_ai_recommendation'])
    if 'media_url' in data: resource.media_url = data['media_url']
    if 'target_indicator' in data: resource.target_indicator = data['target_indicator']
    if 'is_published' in data: resource.is_published = bool(data['is_published'])
    resource.updated_at = datetime.utcnow()

    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="RESOURCE_UPDATED",
        details=f"Recurso '{resource.title}' actualizado por {current_user.first_name} {current_user.last_name}."
    )

    return jsonify({
        'message': 'Recurso actualizado exitosamente.',
        'resource': resource.to_dict()
    }), 200


@wellbeing_bp.route('/resources/<uuid:res_id>/publish', methods=['PATCH'])
@token_required
def toggle_publish_resource(current_user, res_id):
    """
    Alterna el estado de publicación de un recurso.
    """
    if current_user.role not in ['superadmin', 'admin_institucion', 'profesional_apoyo']:
        return jsonify({'message': 'Acceso denegado.'}), 403

    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    resource.is_published = not resource.is_published
    resource.updated_at = datetime.utcnow()
    db.session.commit()

    status_str = "publicado" if resource.is_published else "despublicado"
    return jsonify({
        'message': f'Recurso {status_str} exitosamente.',
        'is_published': resource.is_published
    }), 200


@wellbeing_bp.route('/resources/<uuid:res_id>', methods=['DELETE'])
@token_required
def delete_resource(current_user, res_id):
    """
    Eliminación lógica o segura de un recurso.
    """
    if current_user.role not in ['superadmin', 'admin_institucion', 'profesional_apoyo']:
        return jsonify({'message': 'Acceso denegado.'}), 403

    resource = Resource.query.get(res_id)
    if not resource:
        return jsonify({'message': 'Recurso no encontrado.'}), 404

    # Desactivación lógica para preservar historial de completitud y auditoría
    resource.is_published = False
    resource.updated_at = datetime.utcnow()
    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="RESOURCE_DEACTIVATED",
        details=f"Recurso '{resource.title}' desactivado por {current_user.first_name} {current_user.last_name}."
    )

    return jsonify({'message': 'Recurso retirado del catálogo exitosamente.'}), 200


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


AI_VOICE_PROFILES = {
    'christina': {'voice': 'es-MX-DaliaNeural', 'pitch': '+12Hz', 'rate': '+5%', 'name': 'Camila (Pop & Enérgica)', 'desc': 'Voz femenina juvenil, brillante, expresiva y vibrante'},
    'taylor': {'voice': 'es-US-PalomaNeural', 'pitch': '+4Hz', 'rate': '-2%', 'name': 'Valeria (Dulce & Melódica)', 'desc': 'Tono dulce, suave, amigable y reconfortante'},
    'ariana': {'voice': 'es-PR-KarinaNeural', 'pitch': '+22Hz', 'rate': '+7%', 'name': 'Lucía (Fresca & Vivaz)', 'desc': 'Voz aguda, fresca, juvenil y llena de vitalidad'},
    'arjona': {'voice': 'es-GT-AndresNeural', 'pitch': '-10Hz', 'rate': '-6%', 'name': 'Alejandro (Profunda & Poética)', 'desc': 'Voz masculina grave, reflexiva, pausada y poética'},
    'badbunny': {'voice': 'es-PR-VictorNeural', 'pitch': '-6Hz', 'rate': '-4%', 'name': 'Diego (Urbano & Relajado)', 'desc': 'Tono urbano caribeño, grave, moderno y relajado'},
    'sofia': {'voice': 'es-MX-DaliaNeural', 'pitch': '+2Hz', 'rate': '+0%', 'name': 'Sofía (Joven & Cálida)', 'desc': 'Guía empática, clara, suave y cercana'},
    'mateo': {'voice': 'es-UY-MateoNeural', 'pitch': '+0Hz', 'rate': '+3%', 'name': 'Mateo (Joven & Dinámico)', 'desc': 'Guía motivador, fresco, natural y positivo'},
    'waze': {'voice': 'es-US-PalomaNeural', 'pitch': '+6Hz', 'rate': '+18%', 'name': 'Guía Rápido (Ágil & Directo)', 'desc': 'Dicción ágil, rápida, fluida y al grano'},
    'zen': {'voice': 'es-ES-XimenaNeural', 'pitch': '-6Hz', 'rate': '-15%', 'name': 'Modo Zen (Relajación & Paz)', 'desc': 'Voz pausada, reconfortante, suave y meditativa'}
}

@wellbeing_bp.route('/tts', methods=['POST'])
def generate_ai_voice():
    """
    Sintetiza texto a voz con Inteligencia Artificial (Redes Neuronales de Microsoft Edge TTS)
    Genera audio MP3 ultra-realista, humano y de alta fidelidad, con soporte para perfiles
    de artistas y celebridades (Christina Aguilera, Taylor Swift, Ariana Grande, Morgan Freeman, Bad Bunny, etc.).
    """
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    persona_id = str(data.get('persona', 'sofia')).lower()

    if not text:
        return jsonify({'message': 'El texto es obligatorio para la síntesis de voz.'}), 400

    profile = AI_VOICE_PROFILES.get(persona_id, AI_VOICE_PROFILES['sofia'])

    # Modificador de velocidad
    custom_rate = data.get('rate')
    rate_str = profile['rate']
    if custom_rate and isinstance(custom_rate, (int, float)):
        pct = int((custom_rate - 1.0) * 100)
        rate_str = f"{'+' if pct >= 0 else ''}{pct}%"

    try:
        async def synthesize():
            communicate = edge_tts.Communicate(
                text=text,
                voice=profile['voice'],
                pitch=profile['pitch'],
                rate=rate_str
            )
            buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk['type'] == 'audio':
                    buffer.write(chunk['data'])
            buffer.seek(0)
            return buffer

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            audio_buffer = loop.run_until_complete(synthesize())
        finally:
            loop.close()

        return send_file(
            audio_buffer,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name='ai_speech.mp3'
        )
    except Exception as e:
        print(f"[TTS Error] {str(e)}")
        return jsonify({'message': f'Error en síntesis neural: {str(e)}'}), 500

