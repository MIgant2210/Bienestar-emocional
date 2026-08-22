import os
from dotenv import load_dotenv

# Cargar variables desde el archivo .env
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-flask-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-key')
    
    # SQLAlchemy Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    # Ajustar dialecto de postgresql si es necesario (ej: postgres:// a postgresql://)
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración optimizada de pool de conexiones para PostgreSQL Cloud
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'max_overflow': 10,
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'pool_timeout': 15
    }
    
    # Gemini API Config
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
