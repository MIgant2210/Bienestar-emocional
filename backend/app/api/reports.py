from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app import db
from app.models.reflection import Reflection
from app.models.alert import Alert
from app.models.user import User
from app.models.task_model import Task
from app.models.evaluation import Evaluation
from app.models.audit_log import AuditLog
from app.models.kudos import Kudos
from app.models.reward import Reward
from app.models.appointment import Appointment
from app.utils.decorators import token_required, roles_accepted, permission_required
from datetime import datetime

from sqlalchemy.orm import joinedload
from app.models.department import Department

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/dashboard-bundle', methods=['GET'])
@token_required
def get_admin_dashboard_bundle(current_user):
    """
    Endpoint Agregado de Alto Rendimiento para Panel Administrativo y de Apoyo:
    Consolida métricas de clima emocional, conteo de alertas pendientes, miembros activos y departamentos
    en 1 sola llamada HTTP.
    """
    inst_id = current_user.institution_id
    if current_user.role == 'superadmin' and not inst_id:
        inst_id = None

    # 1. Clima emocional (Promedios en 1 sola consulta SQL)
    avg_query = db.session.query(
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('total')
    )
    if inst_id:
        avg_query = avg_query.filter(Reflection.institution_id == inst_id)
    averages = avg_query.first()

    # 2. Distribución de Sentimientos
    sentiment_query = db.session.query(
        Reflection.dominant_sentiment,
        func.count(Reflection.id).label('count')
    )
    if inst_id:
        sentiment_query = sentiment_query.filter(Reflection.institution_id == inst_id)
    sentiment_distribution = sentiment_query.group_by(Reflection.dominant_sentiment).all()
    sentiment_data = {'Positivo': 0, 'Neutro': 0, 'Negativo': 0}
    for item in sentiment_distribution:
        if item.dominant_sentiment in sentiment_data:
            sentiment_data[item.dominant_sentiment] = item.count

    # 3. Tendencia Histórica (Evolución del Clima)
    trends_query = db.session.query(
        func.date(Reflection.created_at).label('date'),
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('reflections_count')
    )
    if inst_id:
        trends_query = trends_query.filter(Reflection.institution_id == inst_id)
    historical_trends = trends_query.group_by(func.date(Reflection.created_at))\
        .order_by(func.date(Reflection.created_at).asc()).limit(30).all()
    trends_list = [{
        'date': str(trend.date),
        'stress': round(float(trend.avg_stress or 0), 1),
        'motivation': round(float(trend.avg_motivation or 0), 1),
        'burnout': round(float(trend.avg_burnout or 0), 1),
        'count': trend.reflections_count
    } for trend in historical_trends]

    # 4. Alertas pendientes con eager loading (1 sola consulta)
    alert_query = Alert.query.options(
        joinedload(Alert.user),
        joinedload(Alert.reflection),
        joinedload(Alert.resolver)
    ).filter_by(status='pendiente')
    if inst_id:
        alert_query = alert_query.filter(Alert.institution_id == inst_id)
    pending_alerts = alert_query.order_by(Alert.created_at.desc()).limit(15).all()

    # 5. Departamentos
    dept_query = Department.query
    if inst_id:
        dept_query = dept_query.filter_by(institution_id=inst_id)
    departments = dept_query.all()

    # 6. Total Miembros Activos
    user_query = User.query.filter(User.status.in_(['ACTIVE', 'ACTIVO']))
    if inst_id:
        user_query = user_query.filter_by(institution_id=inst_id)
    active_users_count = user_query.count()

    pending_alerts_count = len(pending_alerts)

    return jsonify({
        'averages': {
            'stress': round(float(averages.avg_stress or 0), 1),
            'motivation': round(float(averages.avg_motivation or 0), 1),
            'burnout': round(float(averages.avg_burnout or 0), 1),
            'total_reflections': averages.total or 0
        },
        'sentiment_distribution': sentiment_data,
        'historical_trends': trends_list,
        'total_members': active_users_count,
        'pending_alerts': [a.to_dict() for a in pending_alerts],
        'pending_alerts_count': pending_alerts_count,
        'active_users_count': active_users_count,
        'departments': [d.to_dict() for d in departments]
    }), 200

@reports_bp.route('/export', methods=['GET'])
@reports_bp.route('/all', methods=['GET'])
@token_required
@permission_required('reports')
def get_all_system_reports(current_user):
    """
    Retorna la suite completa de los 10 Reportes del Sistema consolidados en tiempo real.
    Soporta filtros dinámicos por rango de fechas (start_date, end_date), departamento (department) y estado.
    """
    try:
        inst_id = current_user.institution_id
        if current_user.role == 'superadmin' and not inst_id:
            inst_id = None

        # Parámetros de filtrado opcionales desde el query string
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        dept_filter = request.args.get('department')
        status_filter = request.args.get('status')
        role_filter = request.args.get('role')

        start_date = None
        end_date = None
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str[:10], '%Y-%m-%d')
            except Exception:
                pass
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str[:10], '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            except Exception:
                pass

        # 1. Reporte Clima Emocional
        avg_query = db.session.query(
            func.avg(Reflection.stress_score).label('avg_stress'),
            func.avg(Reflection.motivation_score).label('avg_motivation'),
            func.avg(Reflection.burnout_score).label('avg_burnout'),
            func.count(Reflection.id).label('total')
        )
        if inst_id:
            avg_query = avg_query.filter(Reflection.institution_id == inst_id)
        if start_date:
            avg_query = avg_query.filter(Reflection.created_at >= start_date)
        if end_date:
            avg_query = avg_query.filter(Reflection.created_at <= end_date)
        
        averages = avg_query.first()

        sent_query = db.session.query(
            Reflection.dominant_sentiment,
            func.count(Reflection.id).label('count')
        )
        if inst_id:
            sent_query = sent_query.filter(Reflection.institution_id == inst_id)
        if start_date:
            sent_query = sent_query.filter(Reflection.created_at >= start_date)
        if end_date:
            sent_query = sent_query.filter(Reflection.created_at <= end_date)
            
        sentiment_dist = {item.dominant_sentiment: item.count for item in sent_query.group_by(Reflection.dominant_sentiment).all() if item.dominant_sentiment}

        # 2. Reporte Alertas
        alert_query = Alert.query
        if inst_id:
            alert_query = alert_query.filter_by(institution_id=inst_id)
        if start_date:
            alert_query = alert_query.filter(Alert.created_at >= start_date)
        if end_date:
            alert_query = alert_query.filter(Alert.created_at <= end_date)
        if status_filter and status_filter != 'todos':
            alert_query = alert_query.filter_by(status=status_filter)
        alerts_list = alert_query.order_by(Alert.created_at.desc()).all()

        # 3. Reporte Tareas
        task_query = Task.query
        if inst_id:
            task_query = task_query.filter_by(institution_id=inst_id)
        if start_date:
            task_query = task_query.filter(Task.created_at >= start_date)
        if end_date:
            task_query = task_query.filter(Task.created_at <= end_date)
        if status_filter and status_filter != 'todos':
            if status_filter == 'completada':
                task_query = task_query.filter(Task.status == 'completada')
            elif status_filter == 'pendiente':
                task_query = task_query.filter(Task.status != 'completada')
        tasks_list = task_query.order_by(Task.created_at.desc()).all()

        # 4. Reporte Citas Clínicas
        appt_query = Appointment.query
        if inst_id:
            appt_query = appt_query.filter_by(institution_id=inst_id)
        if start_date:
            appt_query = appt_query.filter(Appointment.date_time >= start_date)
        if end_date:
            appt_query = appt_query.filter(Appointment.date_time <= end_date)
        if status_filter and status_filter != 'todos':
            appt_query = appt_query.filter(Appointment.status == status_filter)
        appts_list = appt_query.order_by(Appointment.date_time.desc()).all()

        # 5. Reporte Muro de Gratitud y Kudos
        kudos_query = Kudos.query
        if inst_id:
            kudos_query = kudos_query.filter_by(institution_id=inst_id)
        if start_date:
            kudos_query = kudos_query.filter(Kudos.created_at >= start_date)
        if end_date:
            kudos_query = kudos_query.filter(Kudos.created_at <= end_date)
        if dept_filter and dept_filter != 'todos':
            kudos_query = kudos_query.filter_by(receiver_dept=dept_filter)
        kudos_list = kudos_query.order_by(Kudos.created_at.desc()).all()

        # 6. Reporte Gamificación y Recompensas
        rewards_query = Reward.query
        if inst_id:
            rewards_query = rewards_query.filter_by(institution_id=inst_id)
        rewards_list = rewards_query.all()

        # 7. Reporte Directorio de Usuarios
        users_query = User.query
        if inst_id:
            users_query = users_query.filter_by(institution_id=inst_id)
        if dept_filter and dept_filter != 'todos':
            users_query = users_query.filter_by(department=dept_filter)
        if role_filter and role_filter != 'todos':
            users_query = users_query.filter_by(role=role_filter)
        users_list = users_query.all()

        # 8. Reporte Tests y Cuestionarios
        evals_query = Evaluation.query
        if inst_id:
            evals_query = evals_query.filter(
                (Evaluation.institution_id == inst_id) | (Evaluation.institution_id.is_(None))
            )
        evals_list = evals_query.all()

        # 9. Reporte Auditoría de Seguridad (Logs) - AuditLog usa created_at
        audit_query = AuditLog.query
        if start_date:
            audit_query = audit_query.filter(AuditLog.created_at >= start_date)
        if end_date:
            audit_query = audit_query.filter(AuditLog.created_at <= end_date)
        audit_list = audit_query.order_by(AuditLog.created_at.desc()).limit(100).all()

        # 10. Reporte Sugerencias de Estrategia IA (Extraídas de las reflexiones procesadas)
        sug_query = Reflection.query.filter(Reflection.institution_suggestion.isnot(None))
        if inst_id:
            sug_query = sug_query.filter_by(institution_id=inst_id)
        if start_date:
            sug_query = sug_query.filter(Reflection.created_at >= start_date)
        if end_date:
            sug_query = sug_query.filter(Reflection.created_at <= end_date)
        reflections_with_suggestions = sug_query.order_by(Reflection.created_at.desc()).all()

        sug_list = [{
            'id': str(ref.id),
            'suggestion': ref.institution_suggestion,
            'sentiment': ref.dominant_sentiment,
            'created_at': ref.created_at.isoformat() if ref.created_at else None
        } for ref in reflections_with_suggestions]

        # Construcción de la Respuesta Consolidada
        reports_payload = {
            'institucion': current_user.institution.name if current_user.institution else "EquilibrIA Sistema Global",
            'fecha_generacion': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'filtros_aplicados': {
                'fecha_inicio': start_date_str or 'Todo el Historial',
                'fecha_fin': end_date_str or 'Fecha Actual',
                'departamento': dept_filter or 'Todos',
                'estado': status_filter or 'Todos'
            },
            'reporte_1_clima': {
                'titulo': 'Reporte 1: Clima Emocional e Indicadores Institucionales',
                'estres_promedio': round(float(averages.avg_stress), 1) if averages and averages.avg_stress is not None else 0,
                'motivacion_promedio': round(float(averages.avg_motivation), 1) if averages and averages.avg_motivation is not None else 0,
                'burnout_promedio': round(float(averages.avg_burnout), 1) if averages and averages.avg_burnout is not None else 0,
                'total_reflexiones': averages.total if averages and averages.total is not None else 0,
                'distribucion_sentimientos': sentiment_dist
            },
            'reporte_2_alertas': {
                'titulo': 'Reporte 2: Alertas de Riesgo Emocional y Prioridades',
                'total_alertas': len(alerts_list),
                'pendientes': len([a for a in alerts_list if a.status == 'pendiente']),
                'atendidas': len([a for a in alerts_list if a.status in ['atendida', 'resuelta']]),
                'detalle': [a.to_dict() for a in alerts_list[:25]]
            },
            'reporte_3_tareas': {
                'titulo': 'Reporte 3: Avance y Cumplimiento de Tareas Institucionales',
                'total_tareas': len(tasks_list),
                'por_hacer': len([t for t in tasks_list if t.board_column == 'todo' or (not t.board_column and t.status != 'completada')]),
                'en_proceso': len([t for t in tasks_list if t.board_column == 'in_progress']),
                'en_revision': len([t for t in tasks_list if t.board_column == 'in_review']),
                'completadas': len([t for t in tasks_list if t.status == 'completada' or t.board_column == 'completed']),
                'detalle': [t.to_dict() for t in tasks_list[:25]]
            },
            'reporte_4_citas': {
                'titulo': 'Reporte 4: Citas Clínicas de Apoyo y Orientación Emocional',
                'total_citas': len(appts_list),
                'pendientes': len([a for a in appts_list if a.status == 'programada']),
                'completadas': len([a for a in appts_list if a.status == 'completada']),
                'detalle': [a.to_dict() for a in appts_list[:25]]
            },
            'reporte_5_kudos': {
                'titulo': 'Reporte 5: Muro de Gratitud e Interacciones de Compañerismo',
                'total_kudos': len(kudos_list),
                'detalle': [k.to_dict() for k in kudos_list[:25]]
            },
            'reporte_6_gamificacion': {
                'titulo': 'Reporte 6: Gamificación, Puntos XP y Tienda de Recompensas',
                'total_recompensas_catalogo': len(rewards_list),
                'detalle_catalogo': [r.to_dict() for r in rewards_list]
            },
            'reporte_7_usuarios': {
                'titulo': 'Reporte 7: Directorio Institucional de Usuarios y Departamentos',
                'total_usuarios': len(users_list),
                'miembros': len([u for u in users_list if u.role == 'miembro']),
                'lideres': len([u for u in users_list if u.role == 'lider_depto']),
                'administradores': len([u for u in users_list if u.role in ['admin_institucion', 'superadmin']]),
                'psicologos': len([u for u in users_list if u.role == 'profesional_apoyo']),
                'detalle': [u.to_dict() for u in users_list]
            },
            'reporte_8_tests': {
                'titulo': 'Reporte 8: Diagnóstico de Tests y Cuestionarios Estandarizados',
                'total_tests_registrados': len(evals_list),
                'plantillas': len([e for e in evals_list if e.is_template]),
                'activos': len([e for e in evals_list if e.is_active and not e.is_template]),
                'detalle': [e.to_dict() for e in evals_list[:25]]
            },
            'reporte_9_auditoria': {
                'titulo': 'Reporte 9: Auditoría de Seguridad y Eventos del Sistema',
                'total_logs': len(audit_list),
                'detalle': [l.to_dict() for l in audit_list[:35]]
            },
            'reporte_10_sugerencias': {
                'titulo': 'Reporte 10: Estrategias e Intervenciones Organizacionales por Gemini AI',
                'total_sugerencias': len(sug_list),
                'detalle': sug_list[:25]
            }
        }

        return jsonify(reports_payload), 200

    except Exception as err:
        print("Error en get_all_system_reports:", str(err))
        return jsonify({'message': 'Error al procesar el reporte institucional', 'error': str(err)}), 500
