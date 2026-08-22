import uuid
from datetime import datetime
from app import db

class KnowledgeDocument(db.Model):
    __tablename__ = 'knowledge_documents'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True) 
    # Categorías: bienestar_emocional, estres, ansiedad, agotamiento, motivacion, autoestima, emociones, salud_mental, autocuidado, relaciones, ambiente_laboral, ambiente_educativo, prevencion, senales_de_alerta, recursos_institucionales, cultura_guatemalteca
    concept = db.Column(db.String(200), nullable=True)
    definition = db.Column(db.Text, nullable=False)
    signals = db.Column(db.Text, nullable=True)
    associated_factors = db.Column(db.Text, nullable=True)
    protective_factors = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    when_to_refer_professional = db.Column(db.Text, nullable=True)
    
    # Trazabilidad de Fuentes Confiables (OMS, OPS, MSPAS Guatemala, UNICEF, UNESCO, etc.)
    source = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(300), nullable=True)
    author = db.Column(db.String(150), nullable=True)
    reliability_level = db.Column(db.String(50), default='Oficial', nullable=False) # 'Oficial', 'Científica', 'Institucional'
    tags = db.Column(db.String(250), nullable=True)
    
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'category': self.category,
            'concept': self.concept,
            'definition': self.definition,
            'signals': self.signals,
            'associated_factors': self.associated_factors,
            'protective_factors': self.protective_factors,
            'recommendations': self.recommendations,
            'when_to_refer_professional': self.when_to_refer_professional,
            'source': self.source,
            'url': self.url,
            'author': self.author,
            'reliability_level': self.reliability_level,
            'tags': self.tags,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
