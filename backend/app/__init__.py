from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config
from app.utils.db_schema import ensure_task_schema

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Habilitar CORS para las peticiones desde el frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        ensure_task_schema(db)
    
    # Registrar los Blueprints (rutas de la API)
    from app.api.auth import auth_bp
    from app.api.analysis import analysis_bp
    from app.api.institutions import institutions_bp
    from app.api.tasks import tasks_bp
    from app.api.alerts import alerts_bp
    from app.api.audit import audit_bp
    from app.api.evaluations import evaluations_bp
    from app.api.reports import reports_bp
    from app.api.rewards import rewards_bp
    from app.api.appointments import appointments_bp
    from app.api.kudos import kudos_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
    app.register_blueprint(institutions_bp, url_prefix='/api/institutions')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(audit_bp, url_prefix='/api/audit')
    app.register_blueprint(evaluations_bp, url_prefix='/api/evaluations')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(rewards_bp, url_prefix='/api/rewards')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(kudos_bp, url_prefix='/api/kudos')
    
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove()
        
    return app
