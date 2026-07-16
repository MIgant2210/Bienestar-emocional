import uuid
from datetime import datetime
from app import db

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reflection_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('reflections.id', ondelete='CASCADE'), nullable=False)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    
    priority = db.Column(db.String(20), nullable=False, default='Media')  # 'Baja', 'Media', 'Alta'
    status = db.Column(db.String(30), nullable=False, default='pendiente')  # 'pendiente', 'atendida'
    
    resolved_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('alerts', lazy=True))
    reflection = db.relationship('Reflection', backref=db.backref('alerts', lazy=True))
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref=db.backref('resolved_alerts', lazy=True))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'user_name': f"{self.user.first_name} {self.user.last_name}" if self.user else "Usuario Desconocido",
            'reflection_id': str(self.reflection_id),
            'reflection_text': self.reflection.original_text if self.reflection else "",
            'stress_score': self.reflection.stress_score if self.reflection else 0,
            'burnout_score': self.reflection.burnout_score if self.reflection else 0,
            'institution_id': str(self.institution_id),
            'priority': self.priority,
            'status': self.status,
            'resolved_by': str(self.resolved_by) if self.resolved_by else None,
            'resolver_name': f"{self.resolver.first_name} {self.resolver.last_name}" if self.resolver else None,
            'resolution_notes': self.resolution_notes,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat()
        }
