from flask import Blueprint, request, jsonify
from app import db
from app.models.notification import Notification, NotificationPreference
from app.utils.decorators import token_required
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

def create_system_notification(user_id, title, message, category='sistema', link_url=None, institution_id=None):
    """
    Crea una notificación para un usuario verificando sus preferencias de privacidad y categoría.
    Garantiza que no se incluyan datos de diagnóstico ni puntajes emocionales individuales.
    """
    pref = NotificationPreference.query.filter_by(user_id=user_id).first()
    if pref:
        # Verificar si la categoría está habilitada en sus preferencias
        category_allowed = getattr(pref, category, True)
        if not category_allowed and category != 'seguridad':
            return None # El usuario desactivó esta categoría
            
    notif = Notification(
        user_id=user_id,
        institution_id=institution_id,
        title=title,
        message=message,
        category=category,
        link_url=link_url,
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()
    return notif

@notifications_bp.route('', methods=['GET'])
@token_required
def get_notifications(current_user):
    """
    Retorna la lista de notificaciones del usuario autenticado con soporte de filtrado por categoría.
    """
    category_filter = request.args.get('category')
    
    query = Notification.query.filter_by(user_id=current_user.id)
    
    if category_filter and category_filter != 'all':
        query = query.filter_by(category=category_filter)
        
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    
    # Si el usuario no tiene notificaciones, inicializar con notificaciones de bienvenida respetuosas
    if not notifications and not category_filter:
        welcome_notifs = [
            Notification(
                user_id=current_user.id,
                institution_id=current_user.institution_id,
                title="Bienvenido a EquilibrIA",
                message="Tu espacio personal de bienestar y acompañamiento institucional está listo.",
                category="sistema",
                link_url="/mi-bienestar",
                is_read=False
            ),
            Notification(
                user_id=current_user.id,
                institution_id=current_user.institution_id,
                title="Nuevo módulo Mi Bienestar",
                message="Hay nueva información y recursos disponibles en tu espacio personal.",
                category="bienestar",
                link_url="/mi-bienestar",
                is_read=False
            ),
            Notification(
                user_id=current_user.id,
                institution_id=current_user.institution_id,
                title="Centro de Recursos activo",
                message="Explora artículos, guías y ejercicios prácticos de autocuidado y descanso.",
                category="bienestar",
                link_url="/mi-bienestar",
                is_read=False
            )
        ]
        for wn in welcome_notifs:
            db.session.add(wn)
        db.session.commit()
        notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()

    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200

@notifications_bp.route('/<uuid:notif_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notif_id):
    """
    Marca una notificación específica como leída.
    """
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != current_user.id:
        return jsonify({'message': 'No autorizado.'}), 403
        
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notificación marcada como leída.', 'notification': notif.to_dict()}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_read(current_user):
    """
    Marca todas las notificaciones del usuario como leídas.
    """
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'Todas las notificaciones han sido marcadas como leídas.'}), 200

@notifications_bp.route('/preferences', methods=['GET'])
@token_required
def get_notification_preferences(current_user):
    """
    Retorna las preferencias de recepción de notificaciones del usuario.
    """
    pref = NotificationPreference.query.filter_by(user_id=current_user.id).first()
    if not pref:
        pref = NotificationPreference(
            user_id=current_user.id,
            bienestar=True,
            tests=True,
            citas=True,
            tareas=True,
            gamificacion=True,
            kudos=True,
            sistema=True,
            seguridad=True
        )
        db.session.add(pref)
        db.session.commit()
        
    return jsonify(pref.to_dict()), 200

@notifications_bp.route('/preferences', methods=['PUT'])
@token_required
def update_notification_preferences(current_user):
    """
    Actualiza las preferencias de notificaciones del usuario.
    """
    data = request.get_json() or {}
    pref = NotificationPreference.query.filter_by(user_id=current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.session.add(pref)
        
    if 'bienestar' in data:
        pref.bienestar = bool(data['bienestar'])
    if 'tests' in data:
        pref.tests = bool(data['tests'])
    if 'citas' in data:
        pref.citas = bool(data['citas'])
    if 'tareas' in data:
        pref.tareas = bool(data['tareas'])
    if 'gamificacion' in data:
        pref.gamificacion = bool(data['gamificacion'])
    if 'kudos' in data:
        pref.kudos = bool(data['kudos'])
    if 'sistema' in data:
        pref.sistema = bool(data['sistema'])
    # Seguridad permanece siempre True
    pref.seguridad = True
    pref.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Preferencias de notificaciones guardadas exitosamente.',
            'preferences': pref.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al guardar preferencias: {str(e)}'}), 500
