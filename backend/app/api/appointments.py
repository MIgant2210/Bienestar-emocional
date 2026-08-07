from flask import Blueprint, request, jsonify
from app import db
from app.models.appointment import Appointment
from app.utils.decorators import token_required, roles_accepted
from datetime import datetime

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('', methods=['GET'])
@token_required
def get_appointments(current_user):
    """
    Retorna la lista de citas del usuario o de la Psicóloga.
    """
    if not current_user.institution_id:
        return jsonify({'message': 'Sin institución.'}), 400
        
    if current_user.role in ['superadmin', 'admin_institucion', 'profesional_apoyo']:
        appts = Appointment.query.filter_by(institution_id=current_user.institution_id).order_by(Appointment.date_time.asc()).all()
    else:
        appts = Appointment.query.filter_by(user_id=current_user.id).order_by(Appointment.date_time.asc()).all()
        
    return jsonify([a.to_dict() for a in appts]), 200

@appointments_bp.route('', methods=['POST'])
@token_required
def create_appointment(current_user):
    """
    Agenda una nueva sesión de acompañamiento 1 a 1.
    """
    data = request.get_json() or {}
    date_time_str = data.get('date_time')
    reason = data.get('reason', 'Sesión de Apoyo y Orientación Emocional')
    professional_name = data.get('professional_name', 'Dra. Sofía Gómez (Psicóloga)')
    
    if not date_time_str:
        return jsonify({'message': 'Se requiere especificar la fecha y hora de la cita.'}), 400
        
    try:
        dt = datetime.fromisoformat(date_time_str.replace('Z', ''))
    except ValueError:
        return jsonify({'message': 'Fecha u hora en formato inválido.'}), 400
        
    # Si la Psicóloga o Admin está creando la cita, pueden asignar un user_id específico
    target_user_id = current_user.id
    if current_user.role in ['superadmin', 'admin_institucion', 'profesional_apoyo'] and data.get('user_id'):
        target_user_id = data.get('user_id')
        
    initial_status = 'aprobada' if current_user.role in ['superadmin', 'admin_institucion', 'profesional_apoyo'] else 'pendiente'

    appt = Appointment(
        user_id=target_user_id,
        institution_id=current_user.institution_id,
        professional_name=professional_name,
        date_time=dt,
        reason=reason,
        status=initial_status
    )
    
    try:
        db.session.add(appt)
        db.session.commit()
        return jsonify({
            'message': 'Cita agendada exitosamente. Se ha notificado a la Psicóloga.',
            'appointment': appt.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al agendar cita: {str(e)}'}), 500

@appointments_bp.route('/<uuid:appt_id>/status', methods=['PUT'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo')
def update_appointment_status(current_user, appt_id):
    """
    Actualiza el estado o añade notas clínicas a la cita 1 a 1.
    """
    data = request.get_json() or {}
    status = data.get('status')
    notes = data.get('clinical_notes')
    
    appt = Appointment.query.get_or_404(appt_id)
    if status:
        appt.status = status
    if notes:
        appt.clinical_notes = notes
        
    db.session.commit()
    return jsonify({'message': 'Cita actualizada exitosamente.', 'appointment': appt.to_dict()}), 200
