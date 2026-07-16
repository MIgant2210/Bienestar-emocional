from flask import Blueprint, request, jsonify
from app import db
from app.models.evaluation import Evaluation
from app.utils.decorators import token_required, roles_accepted
from datetime import datetime

evaluations_bp = Blueprint('evaluations', __name__)

@evaluations_bp.route('', methods=['GET'])
@token_required
def get_evaluations(current_user):
    """
    Retorna la lista de evaluaciones / cuestionarios de la institución.
    - Miembros ven evaluaciones activas únicamente.
    - Administradores ven todas (activas e inactivas).
    """
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'El usuario no tiene una institución asociada.'}), 400
        
    if current_user.role == 'miembro':
        evals = Evaluation.query.filter_by(
            institution_id=institution_id, 
            is_active=True
        ).order_by(Evaluation.created_at.desc()).all()
    else:
        evals = Evaluation.query.filter_by(
            institution_id=institution_id
        ).order_by(Evaluation.created_at.desc()).all()
        
    return jsonify([ev.to_dict() for ev in evals]), 200

@evaluations_bp.route('', methods=['POST'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def create_evaluation(current_user):
    """
    Crea una nueva evaluación calendarizada para la institución (Admin solamente).
    """
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    scheduled_date_str = data.get('scheduled_date')
    
    if not title:
        return jsonify({'message': 'El título del cuestionario es obligatorio.'}), 400
        
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400
        
    scheduled_date = None
    if scheduled_date_str:
        try:
            scheduled_date = datetime.fromisoformat(scheduled_date_str.replace('Z', ''))
        except ValueError:
            return jsonify({'message': 'Fecha inválida. Use formato ISO (YYYY-MM-DD).'}), 400
            
    new_eval = Evaluation(
        title=title,
        description=description,
        scheduled_date=scheduled_date,
        institution_id=institution_id
    )
    
    try:
        db.session.add(new_eval)
        db.session.commit()
        return jsonify({
            'message': 'Cuestionario programado exitosamente.',
            'evaluation': new_eval.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al crear el cuestionario: {str(e)}'}), 500

@evaluations_bp.route('/<uuid:eval_id>', methods=['PUT'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def update_evaluation(current_user, eval_id):
    """
    Actualiza o desactiva/activa un cuestionario de la institución.
    """
    data = request.get_json() or {}
    evaluation = Evaluation.query.get_or_404(eval_id)
    
    if evaluation.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para modificar este cuestionario.'}), 403
        
    if 'title' in data:
        evaluation.title = data['title']
    if 'description' in data:
        evaluation.description = data['description']
    if 'is_active' in data:
        evaluation.is_active = bool(data['is_active'])
    if 'scheduled_date' in data:
        if data['scheduled_date']:
            try:
                evaluation.scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', ''))
            except ValueError:
                return jsonify({'message': 'Fecha inválida.'}), 400
        else:
            evaluation.scheduled_date = None
            
    try:
        db.session.commit()
        return jsonify({
            'message': 'Cuestionario actualizado exitosamente.',
            'evaluation': evaluation.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al actualizar el cuestionario: {str(e)}'}), 500

@evaluations_bp.route('/<uuid:eval_id>', methods=['DELETE'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def delete_evaluation(current_user, eval_id):
    """
    Elimina un cuestionario.
    """
    evaluation = Evaluation.query.get_or_404(eval_id)
    
    if evaluation.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para eliminar este cuestionario.'}), 403
        
    try:
        db.session.delete(evaluation)
        db.session.commit()
        return jsonify({'message': 'Cuestionario eliminado exitosamente.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al eliminar el cuestionario: {str(e)}'}), 500
