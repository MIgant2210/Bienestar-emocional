import uuid
from datetime import datetime
from app import db

class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), nullable=False)  # Ej. 'TEC', 'RRHH', 'PSI', 'EDU', 'ADM'
    description = db.Column(db.Text, nullable=True)
    leader_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Restricciones de unicidad por institución
    __table_args__ = (
        db.UniqueConstraint('institution_id', 'code', name='uq_department_institution_code'),
        db.UniqueConstraint('institution_id', 'name', name='uq_department_institution_name'),
    )
    
    # Relación con el líder
    leader = db.relationship('User', foreign_keys=[leader_id], backref='led_departments', lazy=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'institution_id': str(self.institution_id),
            'name': self.name,
            'code': self.code,
            'description': self.description or '',
            'leader_id': str(self.leader_id) if self.leader_id else None,
            'leader_name': f"{self.leader.first_name} {self.leader.last_name}" if self.leader else None,
            'is_active': self.is_active,
            'status': 'ACTIVE' if self.is_active else 'INACTIVE',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
