from flask import Blueprint, jsonify, request
from sqlalchemy import func, case, cast, Integer, Float, desc, asc, or_, and_
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta, date
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
from app.models.department import Department
from app.models.institution import Institution
from app.models.gamification import XpTransaction, UserActivityDay, Badge, UserBadge
from app.utils.decorators import token_required, permission_required

reports_bp = Blueprint('reports', __name__)

def parse_date_range(start_date_str, end_date_str, quick_range):
    """
    Parsea y calcula rangos de fecha precisos según presets o fechas personalizadas.
    """
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    today_end = datetime(now.year, now.month, now.day, 23, 59, 59)
    
    start_date = None
    end_date = None

    if quick_range:
        qr = quick_range.lower().strip()
        if qr in ['today', 'hoy']:
            start_date = today_start
            end_date = today_end
        elif qr in ['this_week', 'esta_semana']:
            start_date = today_start - timedelta(days=now.weekday())
            end_date = today_end
        elif qr in ['last_week', 'semana_anterior']:
            start_date = today_start - timedelta(days=now.weekday() + 7)
            end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
        elif qr in ['last_7_days', 'ultimos_7_dias']:
            start_date = today_start - timedelta(days=7)
            end_date = today_end
        elif qr in ['last_30_days', 'ultimos_30_dias']:
            start_date = today_start - timedelta(days=30)
            end_date = today_end
        elif qr in ['this_month', 'este_mes']:
            start_date = datetime(now.year, now.month, 1, 0, 0, 0)
            end_date = today_end
        elif qr in ['last_month', 'mes_anterior']:
            first_this_month = datetime(now.year, now.month, 1, 0, 0, 0)
            last_month_end = first_this_month - timedelta(seconds=1)
            start_date = datetime(last_month_end.year, last_month_end.month, 1, 0, 0, 0)
            end_date = last_month_end
        elif qr in ['this_year', 'este_ano', 'este_año']:
            start_date = datetime(now.year, 1, 1, 0, 0, 0)
            end_date = today_end

    if not start_date and start_date_str:
        try:
            start_date = datetime.strptime(start_date_str[:10], '%Y-%m-%d')
        except Exception:
            pass
    if not end_date and end_date_str:
        try:
            end_date = datetime.strptime(end_date_str[:10], '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        except Exception:
            pass

    return start_date, end_date


@reports_bp.route('/users-search', methods=['GET'])
@token_required
@permission_required('reports')
def search_report_users(current_user):
    """
    Endpoint dinámico con RBAC para búsqueda autocompletada de usuarios para el alcance de reportes.
    Permite buscar por nombre, apellido, usuario y correo institucional.
    """
    try:
        q = request.args.get('q', '').strip()
        dept_filter = request.args.get('department')
        inst_id = current_user.institution_id

        if current_user.role == 'superadmin' and not inst_id:
            target_inst = request.args.get('institution_id')
            inst_id = target_inst if target_inst and target_inst != 'todos' else None

        query = User.query

        # Restricción estricta por Institución
        if inst_id:
            query = query.filter(User.institution_id == inst_id)

        # Restricción RBAC: Líder de departamento solo ve su departamento
        if current_user.role == 'lider_depto' and current_user.department:
            query = query.filter(User.department == current_user.department)
        elif dept_filter and dept_filter != 'todos':
            query = query.filter(User.department == dept_filter)

        # Búsqueda por texto (nombre, apellido, email)
        if q:
            search_pattern = f"%{q}%"
            query = query.filter(
                or_(
                    User.first_name.ilike(search_pattern),
                    User.last_name.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )

        users = query.order_by(User.first_name.asc(), User.last_name.asc()).limit(25).all()

        results = [{
            'id': str(u.id),
            'name': f"{u.first_name} {u.last_name}".strip(),
            'email': u.email,
            'department': u.department or 'General',
            'role': u.role or 'miembro',
            'status': u.status or 'ACTIVO'
        } for u in users]

        return jsonify({'users': results, 'total': len(results)}), 200

    except Exception as err:
        print("Error en search_report_users:", str(err))
        return jsonify({'message': 'Error al buscar usuarios', 'error': str(err)}), 500


@reports_bp.route('/dashboard-bundle', methods=['GET'])
@token_required
def get_admin_dashboard_bundle(current_user):
    """
    Endpoint Agregado de Alto Rendimiento para Panel Administrativo y de Apoyo.
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

    # 4. Alertas pendientes
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

    return jsonify({
        'averages': {
            'stress': round(float(averages.avg_stress or 0), 1) if averages and averages.avg_stress is not None else None,
            'motivation': round(float(averages.avg_motivation or 0), 1) if averages and averages.avg_motivation is not None else None,
            'burnout': round(float(averages.avg_burnout or 0), 1) if averages and averages.avg_burnout is not None else None,
            'total_reflections': averages.total or 0 if averages else 0
        },
        'sentiment_distribution': sentiment_data,
        'historical_trends': trends_list,
        'total_members': active_users_count,
        'pending_alerts': [a.to_dict() for a in pending_alerts],
        'pending_alerts_count': len(pending_alerts),
        'active_users_count': active_users_count,
        'departments': [d.to_dict() for d in departments]
    }), 200


@reports_bp.route('/export', methods=['GET'])
@reports_bp.route('/all', methods=['GET'])
@token_required
@permission_required('reports')
def get_all_system_reports(current_user):
    """
    Retorna la suite completa de los 10 Reportes del Sistema consolidados con consultas reales a PostgreSQL,
    soporte para filtros dinámicos y filtro de alcance (Toda la institución, Departamento o Usuario específico).
    """
    try:
        inst_id = current_user.institution_id
        if current_user.role == 'superadmin' and not inst_id:
            target_inst = request.args.get('institution_id')
            inst_id = target_inst if target_inst and target_inst != 'todos' else None

        # Parámetros de consulta
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        quick_range = request.args.get('quick_range')
        scope = request.args.get('scope', 'institution') # 'institution', 'department', 'user'
        target_user_id = request.args.get('user_id')
        dept_filter = request.args.get('department')
        status_filter = request.args.get('status')
        role_filter = request.args.get('role')
        risk_filter = request.args.get('risk_level')
        priority_filter = request.args.get('priority')
        clinician_filter = request.args.get('clinician')

        start_date, end_date = parse_date_range(start_date_str, end_date_str, quick_range)

        # ====================================================================
        # VALIDACIÓN DE SEGURIDAD Y RBAC DEL ALCANCE
        # ====================================================================
        target_user_obj = None
        if scope == 'user' and target_user_id and target_user_id != 'todos':
            target_user_obj = User.query.get(target_user_id)
            if not target_user_obj:
                return jsonify({'message': 'El usuario especificado no existe.'}), 404
            
            # Validar que el usuario objetivo pertenezca a la misma institución
            if inst_id and target_user_obj.institution_id != inst_id:
                return jsonify({'message': 'No tiene autorización para consultar usuarios de otra institución.'}), 403

            # Restricción RBAC: Líder de departamento solo puede consultar usuarios de su departamento
            if current_user.role == 'lider_depto' and current_user.department:
                if target_user_obj.department != current_user.department:
                    return jsonify({'message': 'No tiene autorización para consultar usuarios de otros departamentos.'}), 403

        # Si el alcance es departamento y el usuario es líder de depto, forzar su departamento
        if current_user.role == 'lider_depto' and current_user.department:
            dept_filter = current_user.department
            if scope == 'institution':
                scope = 'department'

        # Datos de la institución emisora
        inst_name = "EquilibrIA Sistema Global"
        if inst_id:
            inst_obj = Institution.query.get(inst_id)
            if inst_obj:
                inst_name = inst_obj.name
        elif current_user.institution:
            inst_name = current_user.institution.name

        # Construcción de la etiqueta de alcance
        if scope == 'user' and target_user_obj:
            scope_label = f"Usuario: {target_user_obj.first_name} {target_user_obj.last_name}"
            scope_dept = target_user_obj.department or 'General'
            scope_target_name = f"{target_user_obj.first_name} {target_user_obj.last_name}".strip()
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            scope_label = f"Departamento: {dept_filter}"
            scope_dept = dept_filter
            scope_target_name = None
        else:
            scope_label = "Toda la institución"
            scope_dept = 'Todos'
            scope_target_name = None

        is_support_or_admin = current_user.role in ['admin_institucion', 'superadmin', 'profesional_apoyo']

        # ====================================================================
        # REPORTE 1: CLIMA E INDICADORES INSTITUCIONALES
        # ====================================================================
        ref_query = Reflection.query.join(User, Reflection.user_id == User.id, isouter=True)
        if inst_id:
            ref_query = ref_query.filter(Reflection.institution_id == inst_id)
        if start_date:
            ref_query = ref_query.filter(Reflection.created_at >= start_date)
        if end_date:
            ref_query = ref_query.filter(Reflection.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            ref_query = ref_query.filter(Reflection.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            ref_query = ref_query.filter(User.department == dept_filter)

        if risk_filter and risk_filter != 'todos':
            if risk_filter == 'alto':
                ref_query = ref_query.filter(or_(Reflection.stress_score >= 70, Reflection.burnout_score >= 70))
            elif risk_filter == 'medio':
                ref_query = ref_query.filter(and_(Reflection.stress_score >= 40, Reflection.stress_score < 70))
            elif risk_filter == 'bajo':
                ref_query = ref_query.filter(Reflection.stress_score < 40)

        # Agregaciones de Clima
        clima_aggregates = ref_query.with_entities(
            func.avg(Reflection.stress_score).label('avg_stress'),
            func.avg(Reflection.motivation_score).label('avg_motivation'),
            func.avg(Reflection.burnout_score).label('avg_burnout'),
            func.count(Reflection.id).label('total_reflections')
        ).first()

        # Evolución temporal (por día)
        evolucion_temporal_rows = ref_query.with_entities(
            func.date(Reflection.created_at).label('fecha'),
            func.avg(Reflection.stress_score).label('estres'),
            func.avg(Reflection.motivation_score).label('motivacion'),
            func.avg(Reflection.burnout_score).label('burnout'),
            func.count(Reflection.id).label('total')
        ).group_by(func.date(Reflection.created_at)).order_by(func.date(Reflection.created_at).asc()).limit(30).all()

        evolucion_temporal = [{
            'fecha': str(r.fecha),
            'estres': round(float(r.estres or 0), 1),
            'motivacion': round(float(r.motivacion or 0), 1),
            'burnout': round(float(r.burnout or 0), 1),
            'total': r.total
        } for r in evolucion_temporal_rows]

        # Distribución de Clima por Departamento
        dist_dept_rows = ref_query.with_entities(
            func.coalesce(User.department, 'General').label('depto'),
            func.avg(Reflection.stress_score).label('avg_stress'),
            func.avg(Reflection.motivation_score).label('avg_motivation'),
            func.avg(Reflection.burnout_score).label('avg_burnout'),
            func.count(Reflection.id).label('count')
        ).group_by(User.department).all()

        distribucion_departamentos = [{
            'departamento': r.depto or 'General',
            'estres': round(float(r.avg_stress or 0), 1),
            'motivacion': round(float(r.avg_motivation or 0), 1),
            'burnout': round(float(r.avg_burnout or 0), 1),
            'total': r.count
        } for r in dist_dept_rows]

        # Distribución de Sentimientos
        sentiment_rows = ref_query.with_entities(
            Reflection.dominant_sentiment,
            func.count(Reflection.id).label('count')
        ).group_by(Reflection.dominant_sentiment).all()
        sentiment_dist = {r.dominant_sentiment: r.count for r in sentiment_rows if r.dominant_sentiment}

        # Detalle de reflexiones
        reflections_detail = ref_query.order_by(Reflection.created_at.desc()).limit(50).all()
        clima_detalle = []
        for ref in reflections_detail:
            clima_detalle.append({
                'id': str(ref.id),
                'usuario': f"{ref.user.first_name} {ref.user.last_name}" if (ref.user and (is_support_or_admin or scope == 'user')) else "Colaborador Anónimo",
                'departamento': ref.user.department if ref.user else 'General',
                'estres': ref.stress_score,
                'motivacion': ref.motivation_score,
                'burnout': ref.burnout_score,
                'sentimiento': ref.dominant_sentiment,
                'fecha': ref.created_at.isoformat() if ref.created_at else None
            })

        # Título y observaciones dinámicas de Clima
        if scope == 'user' and target_user_obj:
            titulo_clima = f"Reporte Individual de Clima Emocional — {scope_target_name}"
            obs_clima = f"Durante el periodo seleccionado, el colaborador {scope_target_name} registró {clima_aggregates.total_reflections if clima_aggregates else 0} evaluaciones de clima. " + (f"Presenta un nivel promedio de estrés de {round(float(clima_aggregates.avg_stress), 1)}% y motivación de {round(float(clima_aggregates.avg_motivation), 1)}%." if clima_aggregates and clima_aggregates.avg_stress is not None else "Sin registros en las fechas seleccionadas.")
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_clima = f"Reporte Departamental de Clima Emocional — Departamento: {dept_filter}"
            obs_clima = f"En el departamento de {dept_filter} se analizaron {clima_aggregates.total_reflections if clima_aggregates else 0} reflexiones de clima. " + (f"El estrés promedio se ubica en {round(float(clima_aggregates.avg_stress), 1)}% frente a una motivación del {round(float(clima_aggregates.avg_motivation), 1)}%." if clima_aggregates and clima_aggregates.avg_stress is not None else "Sin registros en las fechas seleccionadas.")
        else:
            titulo_clima = "Reporte Institucional de Clima Emocional e Indicadores"
            obs_clima = f"A nivel institucional se analizaron {clima_aggregates.total_reflections if clima_aggregates else 0} registros de clima en el periodo. " + (f"El nivel de estrés promedio institucional se sitúa en {round(float(clima_aggregates.avg_stress), 1)}% y la motivación en {round(float(clima_aggregates.avg_motivation), 1)}%." if clima_aggregates and clima_aggregates.avg_stress is not None else "Sin registros suficientes para emitir diagnóstico comparativo.")

        # ====================================================================
        # REPORTE 2: ALERTAS Y PRIORIDADES
        # ====================================================================
        alert_q = Alert.query.join(User, Alert.user_id == User.id, isouter=True)
        if inst_id:
            alert_q = alert_q.filter(Alert.institution_id == inst_id)
        if start_date:
            alert_q = alert_q.filter(Alert.created_at >= start_date)
        if end_date:
            alert_q = alert_q.filter(Alert.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            alert_q = alert_q.filter(Alert.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            alert_q = alert_q.filter(User.department == dept_filter)

        if status_filter and status_filter != 'todos':
            alert_q = alert_q.filter(Alert.status == status_filter)
        if risk_filter and risk_filter != 'todos':
            alert_q = alert_q.filter(Alert.priority.ilike(f"%{risk_filter}%"))

        alerts_all = alert_q.order_by(Alert.created_at.desc()).all()
        total_alerts = len(alerts_all)
        activas_alerts = len([a for a in alerts_all if a.status in ['pendiente', 'activa']])
        atendidas_alerts = len([a for a in alerts_all if a.status in ['atendida', 'en_atencion']])
        cerradas_alerts = len([a for a in alerts_all if a.status in ['resuelta', 'cerrada']])

        resolved_alerts = [a for a in alerts_all if a.resolved_at and a.created_at]
        avg_attention_hours = None
        if resolved_alerts:
            total_sec = sum([(a.resolved_at - a.created_at).total_seconds() for a in resolved_alerts])
            avg_attention_hours = round(total_sec / (len(resolved_alerts) * 3600), 1)

        risk_dist = {
            'Alta': len([a for a in alerts_all if a.priority and a.priority.lower() == 'alta']),
            'Media': len([a for a in alerts_all if a.priority and a.priority.lower() == 'media']),
            'Baja': len([a for a in alerts_all if a.priority and a.priority.lower() == 'baja'])
        }

        alerts_detail = []
        for a in alerts_all[:50]:
            alerts_detail.append({
                'id': str(a.id),
                'usuario': f"{a.user.first_name} {a.user.last_name}" if (a.user and (is_support_or_admin or scope == 'user')) else "Colaborador Anónimo",
                'departamento': a.user.department if a.user else 'General',
                'prioridad': a.priority or 'Media',
                'estado': a.status or 'pendiente',
                'atendido_por': f"{a.resolver.first_name} {a.resolver.last_name}" if a.resolver else "Sin asignar",
                'fecha_creacion': a.created_at.isoformat() if a.created_at else None,
                'fecha_resolucion': a.resolved_at.isoformat() if a.resolved_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_alertas = f"Reporte Individual de Alertas — {scope_target_name}"
            obs_alertas = f"Se registran {total_alerts} alertas para {scope_target_name} ({activas_alerts} activas, {atendidas_alerts + cerradas_alerts} atendidas)."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_alertas = f"Reporte Departamental de Alertas — {dept_filter}"
            obs_alertas = f"En el departamento {dept_filter} se procesaron {total_alerts} alertas en el periodo."
        else:
            titulo_alertas = "Reporte Institucional de Alertas y Prioridades"
            obs_alertas = f"Total de {total_alerts} alertas procesadas a nivel institucional. {activas_alerts} activas y {atendidas_alerts + cerradas_alerts} atendidas."

        # ====================================================================
        # REPORTE 3: CUMPLIMIENTO DE TAREAS
        # ====================================================================
        task_q = Task.query.join(User, Task.user_id == User.id, isouter=True)
        if inst_id:
            task_q = task_q.filter(Task.institution_id == inst_id)
        if start_date:
            task_q = task_q.filter(Task.created_at >= start_date)
        if end_date:
            task_q = task_q.filter(Task.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            target_email = target_user_obj.email if target_user_obj else ''
            task_q = task_q.filter(or_(Task.user_id == target_user_id, Task.assigned_target == target_email))
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            task_q = task_q.filter(or_(User.department == dept_filter, Task.assigned_target == dept_filter))

        if priority_filter and priority_filter != 'todos':
            task_q = task_q.filter(Task.priority.ilike(f"%{priority_filter}%"))
        if status_filter and status_filter != 'todos':
            if status_filter == 'completada':
                task_q = task_q.filter(or_(Task.status == 'completada', Task.board_column == 'completed'))
            elif status_filter == 'pendiente':
                task_q = task_q.filter(and_(Task.status != 'completada', Task.board_column != 'completed'))

        tasks_all = task_q.order_by(Task.created_at.desc()).all()
        now_dt = datetime.utcnow()
        total_tasks = len(tasks_all)
        completadas_tasks = len([t for t in tasks_all if t.status == 'completada' or t.board_column == 'completed'])
        pendientes_tasks = len([t for t in tasks_all if t.board_column == 'todo' or (not t.board_column and t.status != 'completada')])
        en_proceso_tasks = len([t for t in tasks_all if t.board_column == 'in_progress'])
        vencidas_tasks = len([t for t in tasks_all if t.due_date and t.due_date < now_dt and t.status != 'completada' and t.board_column != 'completed'])
        cumplimiento_pct = round((completadas_tasks / total_tasks * 100), 1) if total_tasks > 0 else None

        finished_tasks = [t for t in tasks_all if t.completed_at and t.created_at]
        avg_completion_days = None
        if finished_tasks:
            total_sec = sum([(t.completed_at - t.created_at).total_seconds() for t in finished_tasks])
            avg_completion_days = round(total_sec / (len(finished_tasks) * 86400), 1)

        tasks_detail = []
        for t in tasks_all[:50]:
            tasks_detail.append({
                'id': str(t.id),
                'titulo': t.title,
                'categoria': t.category or 'Bienestar',
                'prioridad': t.priority or 'Media',
                'estado': 'Completada' if (t.status == 'completada' or t.board_column == 'completed') else ('En Proceso' if t.board_column == 'in_progress' else 'Pendiente'),
                'asignado_a': t.assigned_user.first_name + ' ' + t.assigned_user.last_name if t.assigned_user else (t.assigned_target or 'Todos'),
                'departamento': t.assigned_user.department if t.assigned_user else 'General',
                'fecha_creacion': t.created_at.isoformat() if t.created_at else None,
                'fecha_limite': t.due_date.isoformat() if t.due_date else None,
                'fecha_completada': t.completed_at.isoformat() if t.completed_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_tareas = f"Reporte Individual de Tareas — {scope_target_name}"
            obs_tareas = f"Para {scope_target_name}, el cumplimiento es del {cumplimiento_pct}% ({completadas_tasks} de {total_tasks} tareas)." if cumplimiento_pct is not None else "Sin tareas registradas."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_tareas = f"Reporte Departamental de Tareas — {dept_filter}"
            obs_tareas = f"El departamento {dept_filter} presenta un cumplimiento de tareas del {cumplimiento_pct}%." if cumplimiento_pct is not None else "Sin tareas en el departamento."
        else:
            titulo_tareas = "Reporte Institucional de Cumplimiento de Tareas"
            obs_tareas = f"El porcentaje global institucional de cumplimiento de tareas es del {cumplimiento_pct}%." if cumplimiento_pct is not None else "Sin tareas registradas en el periodo."

        # ====================================================================
        # REPORTE 4: CITAS CLÍNICAS DE APOYO
        # ====================================================================
        appt_q = Appointment.query.join(User, Appointment.user_id == User.id, isouter=True)
        if inst_id:
            appt_q = appt_q.filter(Appointment.institution_id == inst_id)
        if start_date:
            appt_q = appt_q.filter(Appointment.date_time >= start_date)
        if end_date:
            appt_q = appt_q.filter(Appointment.date_time <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            appt_q = appt_q.filter(Appointment.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            appt_q = appt_q.filter(User.department == dept_filter)

        if clinician_filter and clinician_filter != 'todos':
            appt_q = appt_q.filter(Appointment.professional_name.ilike(f"%{clinician_filter}%"))
        if status_filter and status_filter != 'todos':
            appt_q = appt_q.filter(Appointment.status == status_filter)

        appts_all = appt_q.order_by(Appointment.date_time.desc()).all()
        total_appts = len(appts_all)
        programadas_appts = len([a for a in appts_all if a.status == 'programada'])
        confirmadas_appts = len([a for a in appts_all if a.status == 'confirmada'])
        completadas_appts = len([a for a in appts_all if a.status == 'completada'])
        canceladas_appts = len([a for a in appts_all if a.status == 'cancelada'])
        no_asistio_appts = len([a for a in appts_all if a.status in ['no_asistio', 'ausente']])
        asistencia_pct = round((completadas_appts / (completadas_appts + no_asistio_appts) * 100), 1) if (completadas_appts + no_asistio_appts) > 0 else (100.0 if completadas_appts > 0 else None)

        appts_detail = []
        for ap in appts_all[:50]:
            appts_detail.append({
                'id': str(ap.id),
                'paciente': f"{ap.user.first_name} {ap.user.last_name}" if (ap.user and (is_support_or_admin or scope == 'user')) else "Sesión Privada",
                'departamento': ap.user.department if ap.user else 'General',
                'profesional': ap.professional_name or 'Psicología Institucional',
                'motivo': ap.reason,
                'estado': ap.status,
                'fecha_hora': ap.date_time.isoformat() if ap.date_time else None
            })

        if scope == 'user' and target_user_obj:
            titulo_citas = f"Reporte Individual de Citas Clínicas — {scope_target_name}"
            obs_citas = f"El usuario {scope_target_name} registra {total_appts} sesiones ({completadas_appts} asistidas)."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_citas = f"Reporte Departamental de Citas Clínicas — {dept_filter}"
            obs_citas = f"En {dept_filter} se contabilizan {total_appts} sesiones con tasa de asistencia del {asistencia_pct}%." if asistencia_pct is not None else "Sin sesiones registradas en el departamento."
        else:
            titulo_citas = "Reporte Institucional de Citas Clínicas de Apoyo"
            obs_citas = f"Se programaron {total_appts} sesiones institucionales con asistencia del {asistencia_pct}%." if asistencia_pct is not None else "Sin sesiones en el periodo."

        # ====================================================================
        # REPORTE 5: GRATITUD Y KUDOS
        # ====================================================================
        kudos_q = Kudos.query
        if inst_id:
            kudos_q = kudos_q.filter(Kudos.institution_id == inst_id)
        if start_date:
            kudos_q = kudos_q.filter(Kudos.created_at >= start_date)
        if end_date:
            kudos_q = kudos_q.filter(Kudos.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id and target_user_obj:
            target_full_name = f"{target_user_obj.first_name} {target_user_obj.last_name}".strip()
            kudos_q = kudos_q.filter(or_(Kudos.sender_id == target_user_id, Kudos.receiver_name.ilike(f"%{target_full_name}%")))
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            kudos_q = kudos_q.filter(Kudos.receiver_department == dept_filter)

        kudos_all = kudos_q.order_by(Kudos.created_at.desc()).all()
        total_kudos = len(kudos_all)

        kudos_types_rows = kudos_q.with_entities(
            Kudos.badge_type,
            func.count(Kudos.id).label('count')
        ).group_by(Kudos.badge_type).all()
        kudos_by_type = {r.badge_type: r.count for r in kudos_types_rows if r.badge_type}

        kudos_dept_rows = kudos_q.with_entities(
            Kudos.receiver_department,
            func.count(Kudos.id).label('count')
        ).group_by(Kudos.receiver_department).order_by(desc('count')).limit(10).all()
        kudos_by_dept = [{'departamento': r.receiver_department or 'General', 'total': r.count} for r in kudos_dept_rows]

        kudos_detail = []
        for k in kudos_all[:50]:
            kudos_detail.append({
                'id': str(k.id),
                'remitente': 'Anónimo 🌿' if k.is_anonymous else (f"{k.sender.first_name} {k.sender.last_name}" if hasattr(k.sender, 'first_name') and k.sender else "Compañero"),
                'destinatario': k.receiver_name,
                'departamento': k.receiver_department or 'General',
                'tipo_insignia': k.badge_type or 'Gratitud',
                'mensaje': k.message,
                'fecha': k.created_at.isoformat() if k.created_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_kudos = f"Reporte Individual de Gratitud & Kudos — {scope_target_name}"
            obs_kudos = f"El usuario {scope_target_name} ha participado en {total_kudos} intercambios de gratitud."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_kudos = f"Reporte Departamental de Gratitud & Kudos — {dept_filter}"
            obs_kudos = f"En {dept_filter} se han registrado {total_kudos} interacciones de reconocimiento mutuo."
        else:
            titulo_kudos = "Reporte Institucional de Gratitud y Kudos"
            obs_kudos = f"Se intercambiaron {total_kudos} reconocimientos institucionales, impulsando el bienestar relacional."

        # ====================================================================
        # REPORTE 6: GAMIFICACIÓN Y PUNTOS XP
        # ====================================================================
        xp_q = XpTransaction.query.join(User, XpTransaction.user_id == User.id)
        if inst_id:
            xp_q = xp_q.filter(User.institution_id == inst_id)
        if start_date:
            xp_q = xp_q.filter(XpTransaction.created_at >= start_date)
        if end_date:
            xp_q = xp_q.filter(XpTransaction.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            xp_q = xp_q.filter(XpTransaction.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            xp_q = xp_q.filter(User.department == dept_filter)

        total_xp_periodo = xp_q.with_entities(func.sum(XpTransaction.xp_amount)).scalar() or 0
        total_acciones_bienestar = xp_q.count()

        badges_q = UserBadge.query.join(User, UserBadge.user_id == User.id)
        if inst_id:
            badges_q = badges_q.filter(User.institution_id == inst_id)
        if start_date:
            badges_q = badges_q.filter(UserBadge.unlocked_at >= start_date)
        if end_date:
            badges_q = badges_q.filter(UserBadge.unlocked_at <= end_date)
        if scope == 'user' and target_user_id:
            badges_q = badges_q.filter(UserBadge.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            badges_q = badges_q.filter(User.department == dept_filter)

        total_medallas_periodo = badges_q.count()

        rewards_q = Reward.query
        if inst_id:
            rewards_q = rewards_q.filter_by(institution_id=inst_id)
        rewards_list = rewards_q.all()

        gamification_detail = []
        for r in rewards_list:
            gamification_detail.append({
                'id': str(r.id),
                'nombre': r.name,
                'costo_xp': r.xp_cost,
                'categoria': r.category,
                'stock': r.stock,
                'estado': 'Disponible' if (r.stock is None or r.stock > 0) else 'Agotado'
            })

        if scope == 'user' and target_user_obj:
            titulo_gamificacion = f"Reporte Individual de Gamificación — {scope_target_name}"
            obs_gamificacion = f"El usuario {scope_target_name} generó {total_xp_periodo} XP en {total_acciones_bienestar} actividades de bienestar."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_gamificacion = f"Reporte Departamental de Gamificación — {dept_filter}"
            obs_gamificacion = f"En {dept_filter} se acumularon {total_xp_periodo} XP en el periodo analizado."
        else:
            titulo_gamificacion = "Reporte Institucional de Gamificación y Puntos XP"
            obs_gamificacion = f"Se registraron {total_acciones_bienestar} acciones de bienestar con {total_xp_periodo} XP generados."

        # ====================================================================
        # REPORTE 7: DIRECTORIO DE USUARIOS
        # ====================================================================
        user_q = User.query
        if inst_id:
            user_q = user_q.filter(User.institution_id == inst_id)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            user_q = user_q.filter(User.id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            user_q = user_q.filter(User.department == dept_filter)

        if role_filter and role_filter != 'todos':
            user_q = user_q.filter(User.role == role_filter)
        if status_filter and status_filter != 'todos':
            if status_filter in ['activo', 'ACTIVE', 'ACTIVO']:
                user_q = user_q.filter(User.status.in_(['ACTIVE', 'ACTIVO', 'activo']))
            elif status_filter in ['inactivo', 'INACTIVE', 'INACTIVO']:
                user_q = user_q.filter(User.status.in_(['INACTIVE', 'INACTIVO', 'inactivo', 'SUSPENDIDO']))

        users_all = user_q.all()
        total_users = len(users_all)
        active_users = len([u for u in users_all if u.status in ['ACTIVE', 'ACTIVO', 'activo']])
        inactive_users = len([u for u in users_all if u.status not in ['ACTIVE', 'ACTIVO', 'activo']])

        roles_dist = {
            'Miembros': len([u for u in users_all if u.role == 'miembro']),
            'Líderes de Depto': len([u for u in users_all if u.role == 'lider_depto']),
            'Profesionales de Apoyo': len([u for u in users_all if u.role == 'profesional_apoyo']),
            'Administradores': len([u for u in users_all if u.role in ['admin_institucion', 'superadmin']])
        }

        dept_user_rows = user_q.with_entities(
            func.coalesce(User.department, 'General').label('depto'),
            func.count(User.id).label('count')
        ).group_by(User.department).all()
        dept_user_dist = [{'departamento': r.depto or 'General', 'total': r.count} for r in dept_user_rows]

        users_detail = []
        for u in users_all[:50]:
            users_detail.append({
                'id': str(u.id),
                'nombre_completo': f"{u.first_name} {u.last_name}",
                'email': u.email,
                'rol': u.role,
                'departamento': u.department or 'General',
                'estado': u.status or 'ACTIVO',
                'fecha_registro': u.created_at.isoformat() if u.created_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_usuarios = f"Ficha Individual de Directorio — {scope_target_name}"
            obs_usuarios = f"Ficha del usuario {scope_target_name} ({target_user_obj.role}) en el departamento {target_user_obj.department}."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_usuarios = f"Directorio Departamental de Usuarios — {dept_filter}"
            obs_usuarios = f"El departamento {dept_filter} cuenta con {total_users} colaboradores registrados ({active_users} activos)."
        else:
            titulo_usuarios = "Directorio Institucional de Usuarios y Departamentos"
            obs_usuarios = f"La institución cuenta con {total_users} cuentas registradas ({active_users} activas)."

        # ====================================================================
        # REPORTE 8: TESTS ESTANDARIZADOS
        # ====================================================================
        evals_q = Evaluation.query
        if inst_id:
            evals_q = evals_q.filter(
                (Evaluation.institution_id == inst_id) | (Evaluation.institution_id.is_(None))
            )
        evals_all = evals_q.all()
        total_tests = len(evals_all)
        plantillas_count = len([e for e in evals_all if e.is_template])
        activos_count = len([e for e in evals_all if e.is_active and not e.is_template])

        test_part_q = Reflection.query.join(User, Reflection.user_id == User.id, isouter=True).filter(Reflection.evaluation_id.isnot(None))
        if inst_id:
            test_part_q = test_part_q.filter(Reflection.institution_id == inst_id)
        if start_date:
            test_part_q = test_part_q.filter(Reflection.created_at >= start_date)
        if end_date:
            test_part_q = test_part_q.filter(Reflection.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            test_part_q = test_part_q.filter(Reflection.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            test_part_q = test_part_q.filter(User.department == dept_filter)

        total_participaciones_tests = test_part_q.count()

        evals_detail = []
        for e in evals_all[:50]:
            evals_detail.append({
                'id': str(e.id),
                'titulo': e.title,
                'categoria': e.category or 'Bienestar Integral',
                'preguntas_total': len(e.get_questions()),
                'es_plantilla': e.is_template,
                'estado': 'Activo' if e.is_active else 'Inactivo',
                'destinatarios': e.assigned_type + (f": {e.assigned_target}" if e.assigned_target else ""),
                'fecha_creacion': e.created_at.isoformat() if e.created_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_tests = f"Reporte Individual de Tests — {scope_target_name}"
            obs_tests = f"El usuario {scope_target_name} completó {total_participaciones_tests} respuestas a cuestionarios en el periodo."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_tests = f"Reporte Departamental de Tests — {dept_filter}"
            obs_tests = f"En {dept_filter} se registraron {total_participaciones_tests} respuestas a tests estandarizados."
        else:
            titulo_tests = "Reporte Institucional de Tests y Cuestionarios"
            obs_tests = f"Se contabilizan {activos_count} cuestionarios activos y {total_participaciones_tests} participaciones completadas."

        # ====================================================================
        # REPORTE 9: AUDITORÍA DE SEGURIDAD
        # ====================================================================
        audit_q = AuditLog.query.join(User, AuditLog.user_id == User.id, isouter=True)
        if start_date:
            audit_q = audit_q.filter(AuditLog.created_at >= start_date)
        if end_date:
            audit_q = audit_q.filter(AuditLog.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            audit_q = audit_q.filter(AuditLog.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            audit_q = audit_q.filter(User.department == dept_filter)

        audit_all = audit_q.order_by(AuditLog.created_at.desc()).limit(100).all()
        total_logs = len(audit_all)

        actions_dist_rows = audit_q.with_entities(
            AuditLog.action,
            func.count(AuditLog.id).label('count')
        ).group_by(AuditLog.action).order_by(desc('count')).limit(8).all()
        frequent_actions = [{'accion': r.action, 'total': r.count} for r in actions_dist_rows]

        audit_detail = []
        for a in audit_all:
            audit_detail.append({
                'id': str(a.id),
                'usuario': f"{a.user.first_name} {a.user.last_name}" if a.user else "Sistema / Invitado",
                'email': a.user.email if a.user else "N/A",
                'accion': a.action,
                'detalles': a.details or 'Evento registrado con éxito',
                'ip': a.ip_address or '127.0.0.1',
                'fecha': a.created_at.isoformat() if a.created_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_auditoria = f"Auditoría Individual de Eventos — {scope_target_name}"
            obs_auditoria = f"Se auditaron {total_logs} eventos correspondientes al usuario {scope_target_name}."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_auditoria = f"Auditoría Departamental de Eventos — {dept_filter}"
            obs_auditoria = f"Se auditaron {total_logs} eventos en el departamento {dept_filter}."
        else:
            titulo_auditoria = "Auditoría Institucional de Seguridad y Eventos"
            obs_auditoria = f"Se auditaron {total_logs} eventos de sistema inmutables."

        # ====================================================================
        # REPORTE 10: ESTRATEGIA DE IA GEMINI
        # ====================================================================
        sug_q = Reflection.query.join(User, Reflection.user_id == User.id, isouter=True).filter(Reflection.institution_suggestion.isnot(None))
        if inst_id:
            sug_q = sug_q.filter(Reflection.institution_id == inst_id)
        if start_date:
            sug_q = sug_q.filter(Reflection.created_at >= start_date)
        if end_date:
            sug_q = sug_q.filter(Reflection.created_at <= end_date)

        # Aplicar Alcance
        if scope == 'user' and target_user_id:
            sug_q = sug_q.filter(Reflection.user_id == target_user_id)
        elif (scope == 'department' or dept_filter) and dept_filter and dept_filter != 'todos':
            sug_q = sug_q.filter(User.department == dept_filter)

        sug_all = sug_q.order_by(Reflection.created_at.desc()).all()
        total_sugerencias = len(sug_all)

        sug_detail = []
        for s in sug_all[:50]:
            sug_detail.append({
                'id': str(s.id),
                'recomendacion': s.institution_suggestion,
                'sentimiento_asociado': s.dominant_sentiment,
                'departamento_origen': s.user.department if s.user else 'General',
                'estres_asociado': s.stress_score,
                'fecha': s.created_at.isoformat() if s.created_at else None
            })

        if scope == 'user' and target_user_obj:
            titulo_ia = f"Estrategias Sugeridas por IA — {scope_target_name}"
            obs_ia = f"Se generaron {total_sugerencias} estrategias organizacionales a partir de las reflexiones de {scope_target_name}."
        elif scope == 'department' and dept_filter and dept_filter != 'todos':
            titulo_ia = f"Estrategias Sugeridas por IA — {dept_filter}"
            obs_ia = f"Se generaron {total_sugerencias} intervenciones organizacionales para el departamento {dept_filter}."
        else:
            titulo_ia = "Estrategias e Intervenciones Organizacionales por IA Gemini"
            obs_ia = f"La IA Gemini generó {total_sugerencias} sugerencias organizacionales agregadas."

        # ====================================================================
        # CONSTRUCCIÓN DE LA RESPUESTA CONSOLIDADA INSTITUCIONAL
        # ====================================================================
        reports_payload = {
            'institucion': inst_name,
            'fecha_generacion': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
            'alcance': {
                'tipo': scope,
                'etiqueta': scope_label,
                'departamento': scope_dept,
                'usuario_id': target_user_id if scope == 'user' else None,
                'usuario_nombre': scope_target_name if scope == 'user' else None
            },
            'filtros_aplicados': {
                'fecha_inicio': start_date.strftime('%Y-%m-%d') if start_date else 'Todo el Historial',
                'fecha_fin': end_date.strftime('%Y-%m-%d') if end_date else 'Fecha Actual',
                'periodo_rapido': quick_range or 'Personalizado',
                'alcance': scope_label,
                'departamento': dept_filter or 'Todos',
                'estado': status_filter or 'Todos',
                'rol': role_filter or 'Todos',
                'riesgo': risk_filter or 'Todos',
                'prioridad': priority_filter or 'Todos',
                'profesional': clinician_filter or 'Todos'
            },
            'reporte_1_clima': {
                'id': 'reporte_1_clima',
                'codigo': 'EQ-REP-01',
                'titulo': titulo_clima,
                'estres_promedio': round(float(clima_aggregates.avg_stress), 1) if clima_aggregates and clima_aggregates.avg_stress is not None else None,
                'motivacion_promedio': round(float(clima_aggregates.avg_motivation), 1) if clima_aggregates and clima_aggregates.avg_motivation is not None else None,
                'burnout_promedio': round(float(clima_aggregates.avg_burnout), 1) if clima_aggregates and clima_aggregates.avg_burnout is not None else None,
                'total_reflexiones': clima_aggregates.total_reflections if clima_aggregates else 0,
                'distribucion_sentimientos': sentiment_dist,
                'evolucion_temporal': evolucion_temporal,
                'distribucion_departamentos': distribucion_departamentos,
                'detalle': clima_detalle,
                'observaciones': obs_clima
            },
            'reporte_2_alertas': {
                'id': 'reporte_2_alertas',
                'codigo': 'EQ-REP-02',
                'titulo': titulo_alertas,
                'total_alertas': total_alerts,
                'activas': activas_alerts,
                'atendidas': atendidas_alerts,
                'cerradas': cerradas_alerts,
                'tiempo_promedio_horas': avg_attention_hours,
                'distribucion_riesgo': risk_dist,
                'detalle': alerts_detail,
                'observaciones': obs_alertas
            },
            'reporte_3_tareas': {
                'id': 'reporte_3_tareas',
                'codigo': 'EQ-REP-03',
                'titulo': titulo_tareas,
                'total_tareas': total_tasks,
                'completadas': completadas_tasks,
                'pendientes': pendientes_tasks,
                'en_proceso': en_proceso_tasks,
                'vencidas': vencidas_tasks,
                'porcentaje_cumplimiento': cumplimiento_pct,
                'tiempo_promedio_dias': avg_completion_days,
                'detalle': tasks_detail,
                'observaciones': obs_tareas
            },
            'reporte_4_citas': {
                'id': 'reporte_4_citas',
                'codigo': 'EQ-REP-04',
                'titulo': titulo_citas,
                'total_citas': total_appts,
                'programadas': programadas_appts,
                'confirmadas': confirmadas_appts,
                'completadas': completadas_appts,
                'canceladas': canceladas_appts,
                'no_asistio': no_asistio_appts,
                'porcentaje_asistencia': asistencia_pct,
                'detalle': appts_detail,
                'observaciones': obs_citas
            },
            'reporte_5_kudos': {
                'id': 'reporte_5_kudos',
                'codigo': 'EQ-REP-05',
                'titulo': titulo_kudos,
                'total_kudos': total_kudos,
                'desglose_tipos': kudos_by_type,
                'departamentos_activos': kudos_by_dept,
                'detalle': kudos_detail,
                'observaciones': obs_kudos
            },
            'reporte_6_gamificacion': {
                'id': 'reporte_6_gamificacion',
                'codigo': 'EQ-REP-06',
                'titulo': titulo_gamificacion,
                'total_xp_generado': total_xp_periodo,
                'total_acciones_bienestar': total_acciones_bienestar,
                'total_medallas_otorgadas': total_medallas_periodo,
                'total_recompensas_catalogo': len(rewards_list),
                'detalle': gamification_detail,
                'nota_aclaratoria': 'Las métricas de gamificación reflejan exclusivamente participación en actividades y no constituyen un indicador clínico de salud emocional.',
                'observaciones': obs_gamificacion
            },
            'reporte_7_usuarios': {
                'id': 'reporte_7_usuarios',
                'codigo': 'EQ-REP-07',
                'titulo': titulo_usuarios,
                'total_usuarios': total_users,
                'activos': active_users,
                'inactivos': inactive_users,
                'distribucion_roles': roles_dist,
                'distribucion_departamentos': dept_user_dist,
                'detalle': users_detail,
                'observaciones': obs_usuarios
            },
            'reporte_8_tests': {
                'id': 'reporte_8_tests',
                'codigo': 'EQ-REP-08',
                'titulo': titulo_tests,
                'total_tests_registrados': total_tests,
                'plantillas_disponibles': plantillas_count,
                'tests_activos': activos_count,
                'total_participaciones': total_participaciones_tests,
                'detalle': evals_detail,
                'nota_aclaratoria': 'Los resultados agregados no constituyen diagnósticos médicos individuales a menos que estén formalmente validados por un profesional de salud colegiado.',
                'observaciones': obs_tests
            },
            'reporte_9_auditoria': {
                'id': 'reporte_9_auditoria',
                'codigo': 'EQ-REP-09',
                'titulo': titulo_auditoria,
                'total_eventos': total_logs,
                'acciones_frecuentes': frequent_actions,
                'detalle': audit_detail,
                'observaciones': obs_auditoria
            },
            'reporte_10_sugerencias': {
                'id': 'reporte_10_sugerencias',
                'codigo': 'EQ-REP-10',
                'titulo': titulo_ia,
                'total_sugerencias': total_sugerencias,
                'detalle': sug_detail,
                'observaciones': obs_ia
            }
        }

        return jsonify(reports_payload), 200

    except Exception as err:
        print("Error en get_all_system_reports:", str(err))
        return jsonify({'message': 'Error al procesar el reporte institucional', 'error': str(err)}), 500
