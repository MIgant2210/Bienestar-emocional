import uuid
from datetime import datetime
from app import db

class Institution(db.Model):
    __tablename__ = 'institutions'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = db.Column(db.String(30), unique=True, nullable=True, index=True) # Ej. 'EQUI-EDU-7F82A'
    name = db.Column(db.String(150), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'educativa', 'laboral', 'salud', 'comunitaria'
    description = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    country = db.Column(db.String(80), nullable=True, default='Guatemala')
    city = db.Column(db.String(80), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='ACTIVE') # 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    allowed_domains = db.Column(db.String(255), nullable=True) # Ej. 'universidad.edu.gt,bienestar.com'
    require_institutional_domain = db.Column(db.Boolean, default=False, nullable=False)
    admin_user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    users = db.relationship('User', foreign_keys='User.institution_id', backref='institution', lazy=True, cascade="all, delete-orphan")
    departments = db.relationship('Department', backref='institution_rel', lazy=True, cascade="all, delete-orphan")
    invitation_codes = db.relationship('InvitationCode', back_populates='institution', lazy=True, cascade="all, delete-orphan")
    reflections = db.relationship('Reflection', backref='institution', lazy=True, cascade="all, delete-orphan")
    admin_user = db.relationship('User', foreign_keys=[admin_user_id], lazy=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'code': self.code or '',
            'name': self.name,
            'type': self.type,
            'description': self.description or '',
            'email': self.email or '',
            'phone': self.phone or '',
            'country': self.country or 'Guatemala',
            'city': self.city or '',
            'status': self.status or 'ACTIVE',
            'is_active': self.status == 'ACTIVE',
            'allowed_domains': self.allowed_domains or '',
            'require_institutional_domain': bool(self.require_institutional_domain),
            'admin_user_id': str(self.admin_user_id) if self.admin_user_id else None,
            'admin_user_name': f"{self.admin_user.first_name} {self.admin_user.last_name}" if self.admin_user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
