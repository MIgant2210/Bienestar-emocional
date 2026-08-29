import uuid
from datetime import datetime
from app import db
from sqlalchemy import UniqueConstraint

class Resource(db.Model):
    __tablename__ = 'resources'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # 19 Categorías Oficiales de Bienestar:
    # 'Bienestar emocional', 'Manejo del estrés', 'Ansiedad y preocupación', 'Motivación', 'Autoestima',
    # 'Inteligencia emocional', 'Relaciones interpersonales', 'Comunicación', 'Autocuidado', 'Descanso',
    # 'Hábitos saludables', 'Organización del tiempo', 'Ambiente educativo', 'Ambiente laboral',
    # 'Prevención del agotamiento', 'Manejo de emociones', 'Salud mental', 'Necesito ayuda', 'Cultura y bienestar en Guatemala'
    category = db.Column(db.String(100), nullable=False, default='Bienestar emocional')
    
    # Tipos: 'articulo', 'consejo', 'ejercicio', 'reflexion', 'checklist', 'actividad', 'audio', 'video', 'infografia', 'reto', 'educativo'
    resource_type = db.Column(db.String(50), nullable=False, default='articulo')
    
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    author = db.Column(db.String(150), default='Equipo de Bienestar EquilibrIA')
    reading_time_minutes = db.Column(db.Integer, default=5)
    
    # Nivel de dificultad / profundidad: 'principiante', 'intermedio', 'avanzado'
    level = db.Column(db.String(30), default='principiante', nullable=False)
    
    # Etiquetas de búsqueda (ej. "estrés, respiración, pausa activa, calma")
    tags = db.Column(db.String(250), default='', nullable=True)
    
    # Fuentes y respaldo oficial / científico
    source_url = db.Column(db.String(300), nullable=True)
    source_institution = db.Column(db.String(150), nullable=True) # ej. "OMS", "OPS", "MSPAS Guatemala", "UNICEF"
    
    # Gamificación
    xp_reward = db.Column(db.Integer, default=15, nullable=False)
    counts_for_streak = db.Column(db.Boolean, default=True, nullable=False)
    allow_ai_recommendation = db.Column(db.Boolean, default=True, nullable=False)
    
    # Tipo interactivo: 'none', 'breathing', 'reflection', 'checklist', 'audio_guide', 'video', 'infografia'
    interactive_type = db.Column(db.String(50), default='none', nullable=False)
    interactive_data = db.Column(db.JSON, nullable=True) # Configuración de respiración, ítems de checklist, preguntas de reflexión
    
    # Multimedia (Video / Audio URL)
    media_url = db.Column(db.String(400), nullable=True)
    
    # Indicador preventivo objetivo: 'estres', 'motivacion', 'agotamiento', 'general'
    target_indicator = db.Column(db.String(50), default='general', nullable=False)
    
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True) # Null si es global
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    favorites = db.relationship('ResourceFavorite', backref='resource', lazy=True, cascade='all, delete-orphan')
    progress_records = db.relationship('ResourceProgress', backref='resource', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, user_id=None):
        data = {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'resource_type': self.resource_type,
            'content': self.content,
            'image_url': self.image_url,
            'author': self.author,
            'reading_time_minutes': self.reading_time_minutes,
            'level': self.level or 'principiante',
            'tags': [t.strip() for t in self.tags.split(',') if t.strip()] if self.tags else [],
            'source_url': self.source_url,
            'source_institution': self.source_institution,
            'xp_reward': self.xp_reward or 15,
            'counts_for_streak': self.counts_for_streak if self.counts_for_streak is not None else True,
            'allow_ai_recommendation': self.allow_ai_recommendation if self.allow_ai_recommendation is not None else True,
            'interactive_type': self.interactive_type or 'none',
            'interactive_data': self.interactive_data or {},
            'resource_config': self.interactive_data or {},
            'media_url': self.media_url,
            'target_indicator': self.target_indicator,
            'is_published': self.is_published,
            'institution_id': str(self.institution_id) if self.institution_id else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_favorite': False,
            'progress': {
                'status': 'no_iniciado',
                'progress_percent': 0,
                'started_at': None,
                'completed_at': None,
                'interactive_answers': {}
            }
        }
        
        if user_id:
            fav = ResourceFavorite.query.filter_by(user_id=user_id, resource_id=self.id).first()
            data['is_favorite'] = fav is not None
            
            prog = ResourceProgress.query.filter_by(user_id=user_id, resource_id=self.id).first()
            if prog:
                data['progress'] = {
                    'status': prog.status,
                    'progress_percent': prog.progress_percent,
                    'started_at': prog.started_at.isoformat() if prog.started_at else None,
                    'last_read_at': prog.last_read_at.isoformat() if prog.last_read_at else None,
                    'completed_at': prog.completed_at.isoformat() if prog.completed_at else None,
                    'interactive_answers': prog.interactive_answers or {}
                }
                
        return data


class ResourceFavorite(db.Model):
    __tablename__ = 'resource_favorites'
    __table_args__ = (
        UniqueConstraint('user_id', 'resource_id', name='uq_user_resource_favorite'),
    )
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    resource_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('resources.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('resource_favorites', lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'resource_id': str(self.resource_id),
            'created_at': self.created_at.isoformat()
        }


class ResourceProgress(db.Model):
    __tablename__ = 'resource_progress'
    __table_args__ = (
        UniqueConstraint('user_id', 'resource_id', name='uq_user_resource_progress'),
    )
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    resource_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('resources.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Estados: 'no_iniciado', 'en_progreso', 'completado'
    status = db.Column(db.String(30), default='no_iniciado', nullable=False)
    progress_percent = db.Column(db.Integer, default=0, nullable=False)
    
    # Respuestas y estado interactivo privado (respuestas de reflexión, checks de checklist)
    interactive_answers = db.Column(db.JSON, nullable=True, default=dict)
    
    started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_read_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    user = db.relationship('User', backref=db.backref('resource_progress_records', lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'resource_id': str(self.resource_id),
            'status': self.status,
            'progress_percent': self.progress_percent,
            'interactive_answers': self.interactive_answers or {},
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'last_read_at': self.last_read_at.isoformat() if self.last_read_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
