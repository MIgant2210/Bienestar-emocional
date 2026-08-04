import uuid
import bcrypt
from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(30), nullable=False, default='miembro')  # 'superadmin', 'admin_institucion', 'miembro'
    department = db.Column(db.String(80), nullable=True, default='General') # 'Tecnología', 'Administración', etc.
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con Reflexiones
    reflections = db.relationship(
        'Reflection',
        foreign_keys='Reflection.user_id',
        back_populates='user',
        lazy=True,
        cascade='all, delete-orphan'
    )
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'department': self.department or 'General',
            'institution_id': str(self.institution_id) if self.institution_id else None,
            'created_at': self.created_at.isoformat()
        }
