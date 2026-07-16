import uuid
from datetime import datetime
from app import db

class Evaluation(db.Model):
    __tablename__ = 'evaluations'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=True)
    
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    institution = db.relationship('Institution', backref=db.backref('evaluations', lazy=True, cascade="all, delete-orphan"))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'is_active': self.is_active,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'institution_id': str(self.institution_id),
            'created_at': self.created_at.isoformat()
        }
