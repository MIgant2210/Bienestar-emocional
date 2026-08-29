import uuid
from datetime import datetime
from app import db

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False, default='Bienestar')  # 'Bienestar', 'Académica', 'Laboral'
    status = db.Column(db.String(30), nullable=False, default='pendiente')     # 'pendiente', 'completada'
    due_date = db.Column(db.DateTime, nullable=True)
    
    # Claves foráneas
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    resource_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('resources.id', ondelete='SET NULL'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Segmentación por tipo de destinatario (Módulo 5)
    assigned_type = db.Column(db.String(30), nullable=False, default='all') # 'all', 'department', 'individual'
    assigned_target = db.Column(db.String(150), nullable=True)             # Email o Nombre del departamento

    # Nuevos atributos de gestión avanzada de tareas
    priority = db.Column(db.String(20), nullable=False, default='Media')   # 'Alta', 'Media', 'Baja'
    estimated_minutes = db.Column(db.Integer, nullable=False, default=15)
    submission_notes = db.Column(db.Text, nullable=True)                  # Comentarios o evidencia de entrega
    completed_at = db.Column(db.DateTime, nullable=True)
    review_status = db.Column(db.String(30), nullable=False, default='pendiente') # 'pendiente', 'aprobada', 'revision_solicitada'
    feedback_notes = db.Column(db.Text, nullable=True)                    # Retroalimentación de la Psicóloga o Líder
    board_column = db.Column(db.String(30), nullable=False, default='todo') # 'todo', 'in_progress', 'completed'

    # Relaciones adicionales para facilidad en consultas
    assigned_user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('assigned_tasks', lazy=True))
    creator = db.relationship('User', foreign_keys=[created_by], backref=db.backref('created_tasks', lazy=True))
    resource = db.relationship('Resource', foreign_keys=[resource_id], backref=db.backref('linked_tasks', lazy=True))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'priority': self.priority or 'Media',
            'estimated_minutes': self.estimated_minutes or 15,
            'submission_notes': self.submission_notes,
            'review_status': self.review_status or 'pendiente',
            'feedback_notes': self.feedback_notes,
            'board_column': self.board_column or 'todo',
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'resource_id': str(self.resource_id) if self.resource_id else None,
            'resource': self.resource.to_dict() if self.resource else None,
            'assigned_type': self.assigned_type or 'all',
            'assigned_target': self.assigned_target,
            'assigned_user_name': f"{self.assigned_user.first_name} {self.assigned_user.last_name}" if self.assigned_user else ("Todos" if self.assigned_type == 'all' else f"{self.assigned_type}: {self.assigned_target}"),
            'institution_id': str(self.institution_id),
            'created_by': str(self.created_by) if self.created_by else None,
            'creator_name': f"{self.creator.first_name} {self.creator.last_name}" if self.creator else "Sistema",
            'created_at': self.created_at.isoformat()
        }
