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
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Segmentación por tipo de destinatario (Módulo 5)
    assigned_type = db.Column(db.String(30), nullable=False, default='all') # 'all', 'department', 'individual'
    assigned_target = db.Column(db.String(150), nullable=True)             # Email o Nombre del departamento

    # Relaciones adicionales para facilidad en consultas
    assigned_user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('assigned_tasks', lazy=True))
    creator = db.relationship('User', foreign_keys=[created_by], backref=db.backref('created_tasks', lazy=True))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'assigned_type': self.assigned_type or 'all',
            'assigned_target': self.assigned_target,
            'assigned_user_name': f"{self.assigned_user.first_name} {self.assigned_user.last_name}" if self.assigned_user else ("Todos" if self.assigned_type == 'all' else f"{self.assigned_type}: {self.assigned_target}"),
            'institution_id': str(self.institution_id),
            'created_by': str(self.created_by) if self.created_by else None,
            'creator_name': f"{self.creator.first_name} {self.creator.last_name}" if self.creator else "Sistema",
            'created_at': self.created_at.isoformat()
        }
