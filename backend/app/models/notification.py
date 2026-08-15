import uuid
from datetime import datetime
from app import db

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True)
    
    title = db.Column(db.String(150), nullable=False)
    # Mensaje respetuoso con la privacidad sin puntajes emocionales individuales
    message = db.Column(db.Text, nullable=False)
    
    # Categorías: 'bienestar', 'tests', 'citas', 'tareas', 'gamificacion', 'kudos', 'sistema', 'seguridad'
    category = db.Column(db.String(50), default='bienestar', nullable=False)
    
    link_url = db.Column(db.String(200), nullable=True) # e.g., '/mi-bienestar', '/tareas', '/agenda-citas'
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('notifications', lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'institution_id': str(self.institution_id) if self.institution_id else None,
            'title': self.title,
            'message': self.message,
            'category': self.category,
            'link_url': self.link_url,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class NotificationPreference(db.Model):
    __tablename__ = 'notification_preferences'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    bienestar = db.Column(db.Boolean, default=True, nullable=False)
    tests = db.Column(db.Boolean, default=True, nullable=False)
    citas = db.Column(db.Boolean, default=True, nullable=False)
    tareas = db.Column(db.Boolean, default=True, nullable=False)
    gamificacion = db.Column(db.Boolean, default=True, nullable=False)
    kudos = db.Column(db.Boolean, default=True, nullable=False)
    sistema = db.Column(db.Boolean, default=True, nullable=False)
    # Seguridad siempre es True y no se desactiva
    seguridad = db.Column(db.Boolean, default=True, nullable=False)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('notification_preference', uselist=False, lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'user_id': str(self.user_id),
            'bienestar': self.bienestar,
            'tests': self.tests,
            'citas': self.citas,
            'tareas': self.tareas,
            'gamificacion': self.gamificacion,
            'kudos': self.kudos,
            'sistema': self.sistema,
            'seguridad': True # Siempre activa
        }
