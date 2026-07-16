from flask import Blueprint, jsonify
from app import db
from app.models.audit_log import AuditLog
from app.utils.decorators import token_required, roles_accepted

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/logs', methods=['GET'])
@token_required
@roles_accepted('superadmin')
def get_audit_logs(current_user):
    """
    Ruta exclusiva para el Super Admin que retorna la bitácora de auditoría inmutable del sistema.
    """
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200
