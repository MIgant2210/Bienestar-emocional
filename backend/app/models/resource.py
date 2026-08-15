import uuid
from datetime import datetime
from app import db

class Resource(db.Model):
    __tablename__ = 'resources'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Categorías: 'Manejo del estrés', 'Ansiedad y preocupación', 'Descanso', 'Inteligencia emocional',
    # 'Motivación', 'Organización del tiempo', 'Relaciones interpersonales', 'Autocuidado', 'Prevención del agotamiento', 'Hábitos saludables'
    category = db.Column(db.String(100), nullable=False, default='Manejo del estrés')
    
    # Tipos: 'articulo', 'guia', 'ejercicio', 'infografia', 'video', 'actividad'
    resource_type = db.Column(db.String(50), nullable=False, default='articulo')
    
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    author = db.Column(db.String(100), default='Equipo de Bienestar EquilibrIA')
    reading_time_minutes = db.Column(db.Integer, default=5)
    
    # Indicador preventivo objetivo: 'estres', 'motivacion', 'agotamiento', 'general'
    target_indicator = db.Column(db.String(50), default='general', nullable=False)
    
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True) # Null si es global
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'resource_type': self.resource_type,
            'content': self.content,
            'image_url': self.image_url,
            'author': self.author,
            'reading_time_minutes': self.reading_time_minutes,
            'target_indicator': self.target_indicator,
            'is_published': self.is_published,
            'institution_id': str(self.institution_id) if self.institution_id else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
