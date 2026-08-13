from flask import Blueprint, request, jsonify
from app import db
from app.models.kudos import Kudos
from app.utils.decorators import token_required

kudos_bp = Blueprint('kudos', __name__)

BLOCKED_WORDS = [
    'puta', 'mierda', 'estupido', 'estúpido', 'pendejo', 'imbecil', 'imbécil', 
    'basura', 'malparido', 'idiota', 'maricon', 'maricón', 'culero', 'maldito', 
    'hijo de puta', 'chinga', 'zorra', 'bastardo', 'maldita', 'perra'
]

@kudos_bp.route('', methods=['GET'])
@token_required
def get_kudos(current_user):
    """
    Retorna los reconocimientos / Kudos del Muro de Gratitud de la institución.
    """
    query = Kudos.query
    if current_user.role != 'superadmin' or current_user.institution_id:
        if not current_user.institution_id:
            return jsonify({'message': 'Sin institución.'}), 400
        query = query.filter_by(institution_id=current_user.institution_id)
        
    kudos_list = query.order_by(Kudos.created_at.desc()).limit(50).all()
    return jsonify([k.to_dict() for k in kudos_list]), 200

@kudos_bp.route('', methods=['POST'])
@token_required
def create_kudos(current_user):
    """
    Publica un reconocimiento / Kudo a un compañero o departamento en el Muro de Gratitud (+10 XP).
    """
    data = request.get_json() or {}
    receiver_name = data.get('receiver_name')
    receiver_department = data.get('receiver_department', 'General')
    message = data.get('message', '')
    badge_type = data.get('badge_type', 'Gratitud')
    is_anonymous = bool(data.get('is_anonymous', False))
    
    if not receiver_name or not message:
        return jsonify({'message': 'Nombre del destinatario y mensaje son requeridos.'}), 400

    # Filtro de Palabras Obscenas o Hirientes
    msg_lower = message.lower()
    for bad_word in BLOCKED_WORDS:
        if bad_word in msg_lower:
            return jsonify({
                'message': 'El mensaje contiene palabras inapropiadas o hirientes. Por favor mantén un lenguaje respetuoso y positivo en la comunidad.'
            }), 400
        
    kudo = Kudos(
        sender_id=current_user.id,
        institution_id=current_user.institution_id,
        receiver_name=receiver_name,
        receiver_department=receiver_department,
        message=message,
        badge_type=badge_type,
        is_anonymous=is_anonymous
    )
    
    try:
        db.session.add(kudo)
        db.session.commit()
        return jsonify({
            'message': '¡Kudo publicado exitosamente en el Muro de Gratitud! (+10 XP por reconocer a un compañero) 💖',
            'kudos': kudo.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al publicar Kudo: {str(e)}'}), 500

@kudos_bp.route('/<uuid:kudo_id>/like', methods=['POST'])
@token_required
def like_kudos(current_user, kudo_id):
    """
    Añade una reacción de apoyo a un Kudo.
    """
    kudo = Kudos.query.get_or_404(kudo_id)
    kudo.likes_count += 1
    db.session.commit()
    return jsonify({'message': 'Reacción registrada.', 'kudos': kudo.to_dict()}), 200
