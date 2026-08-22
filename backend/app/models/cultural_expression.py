import uuid
from datetime import datetime
from app import db

class CulturalExpression(db.Model):
    __tablename__ = 'cultural_expressions'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    term = db.Column(db.String(100), unique=True, nullable=False, index=True)
    meaning = db.Column(db.Text, nullable=False)
    example = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default='GUATEMALTEQUISMO', nullable=False) # 'GUATEMALTEQUISMO', 'COLOQUIAL', 'JERGA'
    
    # Nivel de seguridad: 'ALLOWED' (Nivel 1), 'EXPLAINABLE' (Nivel 2), 'RESTRICTED' (Nivel 3)
    safety_level = db.Column(db.String(30), default='ALLOWED', nullable=False, index=True)
    
    can_use = db.Column(db.Boolean, default=True, nullable=False) # Si la IA puede usarlo moderadamente
    can_explain = db.Column(db.Boolean, default=True, nullable=False) # Si la IA puede explicarlo cuando se pregunte
    context_notes = db.Column(db.Text, nullable=True)
    active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': str(self.id),
            'term': self.term,
            'meaning': self.meaning,
            'example': self.example,
            'category': self.category,
            'safety_level': self.safety_level,
            'can_use': self.can_use,
            'can_explain': self.can_explain,
            'context_notes': self.context_notes,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
