import uuid
from datetime import datetime
from app import db

class Institution(db.Model):
    __tablename__ = 'institutions'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(150), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'educativa', 'laboral', 'comunitaria'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    users = db.relationship('User', backref='institution', lazy=True, cascade="all, delete-orphan")
    reflections = db.relationship('Reflection', backref='institution', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'type': self.type,
            'created_at': self.created_at.isoformat()
        }
