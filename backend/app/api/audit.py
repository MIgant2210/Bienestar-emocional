from flask import Blueprint, jsonify
from app import db
from app.models.audit_log import AuditLog
from app.utils.decorators import token_required, permission_required

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/logs', methods=['GET'])
@token_required
@permission_required('audit')
def get_audit_logs(current_user):
    """
    Bitácora inmutable de auditoría del sistema (Solo Lectura):
    - SuperAdmin: Eventos globales de la plataforma.
    - Admin Institucional: Eventos de su institución exclusivamente.
    - Demás roles: Denegado (403).
    """
    if current_user.role == 'superadmin':
        logs = AuditLog.query.order_by(AuditLog.created_at.desc()).all()
    else:
        logs = AuditLog.query.filter_by(institution_id=current_user.institution_id).order_by(AuditLog.created_at.desc()).all()
        
    return jsonify([log.to_dict() for log in logs]), 200
