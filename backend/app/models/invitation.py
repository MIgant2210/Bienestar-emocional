import uuid
from datetime import datetime
from app import db

class InvitationCode(db.Model):
    __tablename__ = 'invitation_codes'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = db.Column(db.String(64), unique=True, nullable=False, index=True)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    department_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    department = db.Column(db.String(80), nullable=True, default='General')
    role = db.Column(db.String(30), nullable=False, default='miembro')  # 'miembro', 'lider_depto', 'profesional_apoyo', 'admin_institucion'
    max_uses = db.Column(db.Integer, nullable=True)  # None = usos ilimitados
    used_count = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)  # None = sin expiración
    created_by_user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    institution = db.relationship('Institution', back_populates='invitation_codes', foreign_keys=[institution_id])
    department_rel = db.relationship('Department', foreign_keys=[department_id], lazy=True)
    created_by = db.relationship('User', foreign_keys=[created_by_user_id], backref=db.backref('created_invitations', lazy=True))
    
    def is_valid(self):
        """Comprueba si el código está activo, no ha expirado y no ha superado el límite de usos."""
        if not self.is_active:
            return False, 'El código de invitación está desactivado o ha sido revocado.'
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False, 'El código de invitación ha expirado.'
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False, 'El código de invitación ha alcanzado su límite máximo de registros.'
        return True, 'Código válido.'
        
    def to_dict(self):
        dept_name = self.department_rel.name if self.department_rel else (self.department or 'General')
        return {
            'id': str(self.id),
            'code': self.code,
            'institution_id': str(self.institution_id),
            'institution_name': self.institution.name if self.institution else None,
            'department_id': str(self.department_id) if self.department_id else None,
            'department': dept_name,
            'role': self.role,
            'max_uses': self.max_uses,
            'used_count': self.used_count,
            'is_active': self.is_active,
            'status': 'ACTIVE' if (self.is_active and (not self.expires_at or self.expires_at >= datetime.utcnow()) and (self.max_uses is None or self.used_count < self.max_uses)) else 'EXPIRED' if (self.expires_at and self.expires_at < datetime.utcnow()) else 'EXHAUSTED' if (self.max_uses is not None and self.used_count >= self.max_uses) else 'REVOKED',
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_by_id': str(self.created_by_user_id) if self.created_by_user_id else None,
            'created_by_name': f"{self.created_by.first_name} {self.created_by.last_name}" if self.created_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
