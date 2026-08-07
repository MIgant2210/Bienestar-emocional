import uuid
from datetime import datetime
from app import db

class Kudos(db.Model):
    __tablename__ = 'kudos'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    receiver_name = db.Column(db.String(150), nullable=False)
    receiver_department = db.Column(db.String(80), nullable=False, default='General')
    message = db.Column(db.Text, nullable=False)
    badge_type = db.Column(db.String(50), nullable=False, default='Gratitud') # 'Resiliencia', 'Compañerismo', 'Liderazgo', 'Gratitud'
    is_anonymous = db.Column(db.Boolean, default=False)
    likes_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    sender = db.relationship('User', foreign_keys=[sender_id], lazy=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'sender_id': str(self.sender_id) if self.sender_id else None,
            'sender_name': 'Anónimo 🌿' if self.is_anonymous else (f"{self.sender.first_name} {self.sender.last_name}" if self.sender else "Compañero"),
            'institution_id': str(self.institution_id),
            'receiver_name': self.receiver_name,
            'receiver_department': self.receiver_department,
            'message': self.message,
            'badge_type': self.badge_type,
            'is_anonymous': self.is_anonymous,
            'likes_count': self.likes_count,
            'created_at': self.created_at.isoformat()
        }
