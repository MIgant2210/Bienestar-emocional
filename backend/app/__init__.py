from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Habilitar CORS para las peticiones desde el frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Registrar los Blueprints (rutas de la API)
    from app.api.auth import auth_bp
    from app.api.analysis import analysis_bp
    from app.api.institutions import institutions_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
    app.register_blueprint(institutions_bp, url_prefix='/api/institutions')
    
    return app
