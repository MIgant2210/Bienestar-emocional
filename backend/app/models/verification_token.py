import uuid
import hashlib
from datetime import datetime, timedelta
from app import db

class EmailVerificationToken(db.Model):
    __tablename__ = 'email_verification_tokens'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token_hash = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    user = db.relationship('User', backref=db.backref('verification_tokens', lazy=True, cascade='all, delete-orphan'))
    
    @staticmethod
    def hash_token(plain_token):
        """Genera un hash SHA-256 del token en texto plano para guardado seguro."""
        return hashlib.sha256(plain_token.encode('utf-8')).hexdigest()
        
    def is_valid(self):
        """Verifica si el token no ha sido usado y no ha expirado."""
        if self.used_at is not None:
            return False, 'Este enlace de verificación ya fue utilizado previamente.'
        if self.expires_at < datetime.utcnow():
            return False, 'El enlace de verificación ha expirado. Por favor solicita uno nuevo.'
        return True, 'Token válido.'
        
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'expires_at': self.expires_at.isoformat(),
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'created_at': self.created_at.isoformat()
        }
