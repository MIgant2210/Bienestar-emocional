import uuid
from datetime import datetime
from app import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    professional_name = db.Column(db.String(120), nullable=False, default='Dra. Sofía Gómez (Psicóloga)')
    date_time = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(200), nullable=False, default='Sesión de Apoyo y Orientación Emocional')
    status = db.Column(db.String(30), nullable=False, default='programada') # 'programada', 'completada', 'cancelada'
    clinical_notes = db.Column(db.Text, nullable=True) # Notas confidenciales de la sesión
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[user_id], lazy=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'user_name': f"{self.user.first_name} {self.user.last_name}" if self.user else "Miembro",
            'user_email': self.user.email if self.user else None,
            'user_department': self.user.department if self.user else 'General',
            'institution_id': str(self.institution_id),
            'professional_name': self.professional_name,
            'date_time': self.date_time.isoformat(),
            'reason': self.reason,
            'status': self.status,
            'clinical_notes': self.clinical_notes,
            'created_at': self.created_at.isoformat()
        }
