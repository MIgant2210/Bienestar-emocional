from flask import Blueprint, request, jsonify
from app import db
from app.models.task_model import Task
from app.models.user import User
from app.utils.decorators import token_required, roles_accepted
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['GET'])
@token_required
def get_tasks(current_user):
    """
    Retorna las tareas correspondientes según el rol e institución del usuario.
    - Miembros ven tareas colectivas de su institución y las asignadas a ellos individualmente.
    - Administradores ven todas las tareas de su institución.
    """
    if not current_user.institution_id:
        return jsonify({'message': 'El usuario no tiene una institución asociada.'}), 400
        
    if current_user.role == 'miembro':
        # Tareas colectivas (user_id es NULL) o específicas para este usuario
        tasks = Task.query.filter(
            Task.institution_id == current_user.institution_id,
            (Task.user_id.is_(None)) | (Task.user_id == current_user.id)
        ).order_by(Task.created_at.desc()).all()
    else:
        # Administradores e instituciones ven todas las tareas de la institución
        tasks = Task.query.filter_by(
            institution_id=current_user.institution_id
        ).order_by(Task.created_at.desc()).all()
        
    return jsonify([task.to_dict() for task in tasks]), 200

@tasks_bp.route('', methods=['POST'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def create_task(current_user):
    """
    Crea una nueva tarea para la institución.
    Puede asignarse a todos (user_id = null) o a un usuario específico mediante su email.
    """
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    category = data.get('category', 'Bienestar')  # 'Bienestar', 'Académica', 'Laboral'
    due_date_str = data.get('due_date')           # Formato ISO (ej: '2026-07-15T23:59:59')
    assigned_email = data.get('assigned_email')    # Opcional, para asignar a un usuario específico
    
    if not title:
        return jsonify({'message': 'El título de la tarea es obligatorio.'}), 400
        
    if category not in ['Bienestar', 'Académica', 'Laboral']:
        return jsonify({'message': 'Categoría inválida. Use Bienestar, Académica o Laboral.'}), 400
        
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'El administrador no tiene una institución vinculada.'}), 400
        
    assigned_user_id = None
    if assigned_email:
        user_to_assign = User.query.filter_by(
            email=assigned_email, 
            institution_id=institution_id
        ).first()
        if not user_to_assign:
            return jsonify({'message': f'No se encontró un usuario con el correo {assigned_email} en tu institución.'}), 404
        assigned_user_id = user_to_assign.id
        
    due_date = None
    if due_date_str:
        try:
            # Intentar parsear ISO format o fecha simple
            due_date = datetime.fromisoformat(due_date_str.replace('Z', ''))
        except ValueError:
            return jsonify({'message': 'Formato de fecha inválido. Use formato ISO (YYYY-MM-DDTHH:MM:SS).'}), 400
            
    new_task = Task(
        title=title,
        description=description,
        category=category,
        due_date=due_date,
        user_id=assigned_user_id,
        institution_id=institution_id,
        created_by=current_user.id
    )
    
    try:
        db.session.add(new_task)
        db.session.commit()
        return jsonify({
            'message': 'Tarea creada exitosamente.',
            'task': new_task.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al guardar la tarea: {str(e)}'}), 500

@tasks_bp.route('/<uuid:task_id>/status', methods=['PUT'])
@token_required
def update_task_status(current_user, task_id):
    """
    Actualiza el estado de una tarea ('pendiente' o 'completada').
    Los miembros solo pueden actualizar tareas que les pertenecen o son de su institución.
    """
    data = request.get_json() or {}
    status = data.get('status')
    
    if status not in ['pendiente', 'completada']:
        return jsonify({'message': 'Estado inválido. Use pendiente o completada.'}), 400
        
    task = Task.query.get_or_404(task_id)
    
    # Validaciones de seguridad
    if current_user.role == 'miembro':
        if task.institution_id != current_user.institution_id:
            return jsonify({'message': 'No tiene permisos para modificar esta tarea.'}), 403
        if task.user_id and task.user_id != current_user.id:
            return jsonify({'message': 'Esta tarea está asignada a otro usuario.'}), 403
            
    task.status = status
    
    try:
        db.session.commit()
        return jsonify({
            'message': f'Tarea marcada como {status}.',
            'task': task.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al actualizar la tarea: {str(e)}'}), 500

@tasks_bp.route('/<uuid:task_id>', methods=['DELETE'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def delete_task(current_user, task_id):
    """
    Elimina una tarea. Solo permitido para administradores de la misma institución.
    """
    task = Task.query.get_or_404(task_id)
    
    if current_user.role != 'superadmin' and task.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para eliminar esta tarea.'}), 403
        
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Tarea eliminada exitosamente.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al eliminar la tarea: {str(e)}'}), 500
