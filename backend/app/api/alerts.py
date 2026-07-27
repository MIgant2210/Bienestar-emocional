from flask import Blueprint, request, jsonify
from app import db
from app.models.alert import Alert
from app.utils.decorators import token_required, roles_accepted
from app.services.audit_service import AuditService
from datetime import datetime

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('', methods=['GET'])
@token_required
@roles_accepted('profesional_apoyo', 'admin_institucion', 'superadmin')
def get_alerts(current_user):
    """
    Lista las alertas de riesgo emocional de la institución.
    Soporta filtrar por estado: ?status=pendiente o ?status=atendida
    """
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'El usuario no tiene una institución asociada.'}), 400
        
    status_filter = request.args.get('status')
    
    query = Alert.query.filter_by(institution_id=institution_id)
    
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    alerts = query.order_by(Alert.created_at.desc()).all()
    
    return jsonify([alert.to_dict() for alert in alerts]), 200

@alerts_bp.route('/<uuid:alert_id>/attend', methods=['PUT'])
@token_required
@roles_accepted('profesional_apoyo', 'admin_institucion', 'superadmin')
def attend_alert(current_user, alert_id):
    """
    Registra el seguimiento y notas de atención de una alerta emocional por parte del profesional.
    """
    data = request.get_json() or {}
    notes = data.get('notes')
    
    if not notes or len(notes.strip()) < 5:
        return jsonify({'message': 'Debe ingresar notas de atención válidas (mínimo 5 caracteres).'}), 400
        
    alert = Alert.query.get_or_404(alert_id)
    
    if alert.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para atender alertas de otra institución.'}), 403
        
    alert.status = 'atendida'
    alert.resolved_by = current_user.id
    alert.resolution_notes = notes
    alert.resolved_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # Registrar acción en logs de auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="ALERT_RESOLVED",
            details=f"Alerta resolvió miembro ID: {alert.user_id}. Notas: {notes}",
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'message': 'Alerta emocional marcada como atendida exitosamente.',
            'alert': alert.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al actualizar la alerta: {str(e)}'}), 500
