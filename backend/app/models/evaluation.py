import uuid
import json
from datetime import datetime
from app import db

class Evaluation(db.Model):
    __tablename__ = 'evaluations'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default='Bienestar Integral', nullable=False) # 'Clima Laboral', 'Ánimo Personal', 'Bienestar Integral'
    questions_json = db.Column(db.Text, nullable=True) # Almacena lista de preguntas en formato JSON
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_template = db.Column(db.Boolean, default=False, nullable=False) # True si es plantilla precargada
    scheduled_date = db.Column(db.DateTime, nullable=True)
    
    # Segmentación / Grupo Objetivo del Test
    assigned_type = db.Column(db.String(50), default='all', nullable=False) # 'all', 'department', 'individual'
    assigned_target = db.Column(db.String(150), nullable=True) # Nombre de departamento o correo del colaborador
    
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    institution = db.relationship('Institution', backref=db.backref('evaluations', lazy=True, cascade="all, delete-orphan"))
    
    def get_questions(self):
        if not self.questions_json:
            return [
                {"id": "q1", "question": "¿Cómo evalúas tu nivel de sobrecarga o presión esta semana?", "type": "scale_1_5"},
                {"id": "q2", "question": "¿Qué tan frecuente has sentido cansancio o fatiga física/mental?", "type": "scale_1_5"},
                {"id": "q3", "question": "¿Qué tan motivado(a) te sientes para cumplir con tus metas actuales?", "type": "scale_1_5"},
                {"id": "q4", "question": "Describe factores clave que influyeron en tu estado de ánimo o clima.", "type": "text"}
            ]
        try:
            return json.loads(self.questions_json)
        except Exception:
            return []

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'questions': self.get_questions(),
            'is_active': self.is_active,
            'is_template': self.is_template,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'assigned_type': self.assigned_type,
            'assigned_target': self.assigned_target,
            'institution_id': str(self.institution_id) if self.institution_id else None,
            'created_at': self.created_at.isoformat()
        }
