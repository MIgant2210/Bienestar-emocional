from flask import Blueprint, jsonify, request
from app import db
from app.models.audit_log import AuditLog
from app.utils.decorators import token_required, permission_required

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/logs', methods=['GET'])
@token_required
@permission_required('audit')
def get_audit_logs(current_user):
    """
    Bitácora inmutable de auditoría del sistema optimizada con Paginación y Filtrado:
    - SuperAdmin: Eventos globales de la plataforma.
    - Admin Institucional: Eventos de su institución exclusivamente.
    - Demás roles: Denegado (403).
    """
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', default=50, type=int)
    action_filter = request.args.get('action')
    search = request.args.get('search')

    query = AuditLog.query

    if current_user.role != 'superadmin':
        query = query.filter_by(institution_id=current_user.institution_id)

    if action_filter and action_filter.lower() != 'all':
        query = query.filter(AuditLog.action == action_filter)

    if search:
        query = query.filter(
            db.or_(
                AuditLog.action.ilike(f'%{search}%'),
                AuditLog.details.ilike(f'%{search}%'),
                AuditLog.ip_address.ilike(f'%{search}%')
            )
        )

    query = query.order_by(AuditLog.created_at.desc())

    if page:
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        return jsonify({
            'logs': [log.to_dict() for log in paginated.items],
            'total': paginated.total,
            'page': paginated.page,
            'pages': paginated.pages
        }), 200

    # Límite por defecto para evitar transferencias gigantescas
    logs = query.limit(100).all()
    return jsonify([log.to_dict() for log in logs]), 200
