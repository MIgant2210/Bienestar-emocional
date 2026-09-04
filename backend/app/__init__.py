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

    # Importar modelos para configurar mappers
    from app.models import (
        Institution, Department, User, Reflection, Task, Alert,
        AuditLog, Evaluation, Reward, Appointment, Kudos,
        XpTransaction, Consent, Resource, Notification,
        InvitationCode, EmailVerificationToken
    )

    from app.utils.db_schema import ensure_task_schema, ensure_gamification_schema, ensure_wellbeing_and_consents_schema, ensure_ai_knowledge_and_culture_schema, ensure_auth_oauth_schema
    from app.utils.db_indexes import ensure_database_indexes
    with app.app_context():
        ensure_auth_oauth_schema(db)
        ensure_task_schema(db)
        ensure_gamification_schema(db)
        ensure_wellbeing_and_consents_schema(db)
        ensure_ai_knowledge_and_culture_schema(db)
        ensure_database_indexes(db)
    
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
    from app.api.gamification import gamification_bp
    from app.api.wellbeing import wellbeing_bp
    from app.api.notifications import notifications_bp
    from app.api.culture import culture_bp
    from app.api.avatar import avatar_bp
    
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
    app.register_blueprint(gamification_bp, url_prefix='/api/gamification')
    app.register_blueprint(wellbeing_bp, url_prefix='/api/wellbeing')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(culture_bp, url_prefix='/api/culture')
    app.register_blueprint(avatar_bp, url_prefix='/api/avatar')
    
    @app.route('/health')
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'service': 'EquilibrIA Backend', 'version': '1.0.0'}, 200
    
    import gzip
    from flask import request

    @app.after_request
    def compress_response(response):
        """Comprime automáticamente respuestas JSON y de texto > 1KB con gzip."""
        accept_encoding = request.headers.get('Accept-Encoding', '')
        if (response.status_code < 200 or 
            response.status_code >= 300 or 
            'gzip' not in accept_encoding.lower() or 
            'Content-Encoding' in response.headers):
            return response

        if response.content_length and response.content_length < 1000:
            return response

        if response.mimetype in ['application/json', 'text/html', 'text/css', 'application/javascript', 'text/plain']:
            try:
                data = response.get_data()
                if len(data) >= 1000:
                    compressed_data = gzip.compress(data, compresslevel=6)
                    if len(compressed_data) < len(data):
                        response.set_data(compressed_data)
                        response.headers['Content-Encoding'] = 'gzip'
                        response.headers['Content-Length'] = len(compressed_data)
            except Exception:
                pass
        return response

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove()
        
    return app
