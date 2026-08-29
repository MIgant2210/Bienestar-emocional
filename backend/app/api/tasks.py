from flask import Blueprint, request, jsonify
from sqlalchemy import or_
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
    - Superadmin ve todas las tareas registradas en la plataforma.
    - Miembros ven tareas dirigidas a todos, a su departamento o a su correo individual.
    - Administradores ven todas las tareas asociadas.
    """
    if current_user.role == 'superadmin':
        tasks = Task.query.order_by(Task.created_at.desc()).all()
    elif current_user.role == 'miembro':
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
        ).order_by(Task.created_at.desc()).all()
    else:
        if current_user.institution_id:
            tasks = Task.query.filter(
                or_(
                    Task.institution_id == current_user.institution_id,
                    Task.institution_id.is_(None)
                )
            ).order_by(Task.created_at.desc()).all()
        else:
            tasks = Task.query.order_by(Task.created_at.desc()).all()
        
    return jsonify([task.to_dict() for task in tasks]), 200

@tasks_bp.route('', methods=['POST'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def create_task(current_user):
    """
    Crea una nueva tarea para la institución con segmentación de destinatarios, prioridad y tiempo estimado.
    """
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    category = data.get('category', 'Bienestar')  # 'Bienestar', 'Académica', 'Laboral'
    priority = data.get('priority', 'Media')      # 'Alta', 'Media', 'Baja'
    estimated_minutes = int(data.get('estimated_minutes', 15))
    due_date_str = data.get('due_date')           # Formato ISO (ej: '2026-07-15')
    assigned_type = data.get('assigned_type', 'all') # 'all', 'department', 'individual'
    assigned_target = data.get('assigned_target')    # Nombre de depto o correo
    assigned_email = data.get('assigned_email') or (assigned_target if assigned_type == 'individual' else None)
    raw_resource_id = data.get('resource_id')
    resource_id = raw_resource_id if raw_resource_id and str(raw_resource_id).strip() else None
    
    if not title:
        return jsonify({'message': 'El título de la tarea es obligatorio.'}), 400
        
    if category not in ['Bienestar', 'Académica', 'Laboral']:
        return jsonify({'message': 'Categoría inválida. Use Bienestar, Académica o Laboral.'}), 400
        
    institution_id = current_user.institution_id or data.get('institution_id')
    if not institution_id:
        if current_user.role == 'superadmin':
            from app.models.institution import Institution
            first_inst = Institution.query.first()
            if first_inst:
                institution_id = first_inst.id
        if not institution_id:
            return jsonify({'message': 'El usuario no tiene una institución vinculada.'}), 400
        
    assigned_user_id = None
    if assigned_type == 'individual' and assigned_email:
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
            due_date = datetime.fromisoformat(due_date_str.replace('Z', ''))
        except ValueError:
            return jsonify({'message': 'Formato de fecha inválido. Use formato ISO.'}), 400
            
    new_task = Task(
        title=title,
        description=description,
        category=category,
        priority=priority,
        estimated_minutes=estimated_minutes,
        due_date=due_date,
        user_id=assigned_user_id,
        institution_id=institution_id,
        created_by=current_user.id,
        assigned_type=assigned_type,
        assigned_target=assigned_target,
        resource_id=resource_id
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
    Actualiza el estado de una tarea ('pendiente' o 'completada'), la columna del tablero Kanban y notas de evidencia.
    """
    data = request.get_json() or {}
    status = data.get('status')
    board_column = data.get('board_column')
    submission_notes = data.get('submission_notes')
    
    task = Task.query.get_or_404(task_id)
    
    # Validaciones de seguridad
    if current_user.role == 'miembro':
        if task.institution_id != current_user.institution_id:
            return jsonify({'message': 'No tiene permisos para modificar esta tarea.'}), 403
        if task.user_id and task.user_id != current_user.id:
            return jsonify({'message': 'Esta tarea está asignada a otro usuario.'}), 403
            
    if status:
        if status in ['pendiente', 'completada']:
            task.status = status
            if status == 'completada':
                task.completed_at = datetime.utcnow()
                task.board_column = 'completed'
            else:
                task.completed_at = None
                
    if board_column and board_column in ['todo', 'in_progress', 'in_review', 'completed']:
        task.board_column = board_column
        if board_column == 'completed':
            task.status = 'completada'
            task.completed_at = datetime.utcnow()
        elif board_column in ['todo', 'in_progress', 'in_review']:
            task.status = 'pendiente'
            task.completed_at = None

    if submission_notes is not None:
        task.submission_notes = submission_notes
    
    try:
        db.session.commit()
        
        # Si la tarea se completó, otorgar XP por actividad de bienestar
        gamification_result = None
        if task.status == 'completada':
            from app.services.gamification_service import GamificationService
            gamification_result = GamificationService.award_xp(
                user_id=current_user.id,
                action_type='wellness_activity',
                reference_id=str(task.id),
                custom_description=f"Actividad completada: {task.title}"
            )
            
        return jsonify({
            'message': 'Tarea actualizada exitosamente.',
            'task': task.to_dict(),
            'gamification': gamification_result
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
