import uuid
from datetime import datetime
from app import db

class Consent(db.Model):
    __tablename__ = 'consents'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True)
    
    # 'wellbeing_data', 'ai_analysis', 'voice_analysis'
    consent_type = db.Column(db.String(50), nullable=False)
    # 'accepted', 'revoked'
    status = db.Column(db.String(20), default='accepted', nullable=False)
    
    version = db.Column(db.String(20), default='v1.0', nullable=False)
    accepted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    user = db.relationship('User', backref=db.backref('consents', lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'institution_id': str(self.institution_id) if self.institution_id else None,
            'consent_type': self.consent_type,
            'status': self.status,
            'version': self.version,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
