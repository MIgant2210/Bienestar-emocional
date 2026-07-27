import uuid
from datetime import datetime
from app import db

class Reflection(db.Model):
    __tablename__ = 'reflections'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    evaluation_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('evaluations.id', ondelete='SET NULL'), nullable=True)
    original_text = db.Column(db.Text, nullable=True)
    
    # Indicadores generados por Gemini (0-100)
    stress_score = db.Column(db.Integer, nullable=False)
    motivation_score = db.Column(db.Integer, nullable=False)
    burnout_score = db.Column(db.Integer, nullable=False)
    
    dominant_sentiment = db.Column(db.String(50), nullable=False)  # 'Positivo', 'Neutro', 'Negativo'
    institution_suggestion = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    evaluation = db.relationship('Evaluation', backref=db.backref('reflections', lazy=True))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'institution_id': str(self.institution_id),
            'evaluation_id': str(self.evaluation_id) if self.evaluation_id else None,
            'original_text': self.original_text,
            'stress_score': self.stress_score,
            'motivation_score': self.motivation_score,
            'burnout_score': self.burnout_score,
            'dominant_sentiment': self.dominant_sentiment,
            'institution_suggestion': self.institution_suggestion,
            'created_at': self.created_at.isoformat()
        }
