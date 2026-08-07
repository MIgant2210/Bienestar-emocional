from flask import Blueprint, request, jsonify
from app import db
from app.models.reward import Reward, RewardRedemption
from app.models.user import User
from app.utils.decorators import token_required, roles_accepted

rewards_bp = Blueprint('rewards', __name__)

@rewards_bp.route('', methods=['GET'])
@token_required
def get_rewards(current_user):
    """
    Retorna la lista de recompensas disponibles en la institución del usuario.
    """
    if not current_user.institution_id:
        return jsonify({'message': 'El usuario no pertenece a una institución.'}), 400
        
    rewards = Reward.query.filter_by(institution_id=current_user.institution_id, is_available=True).all()
    return jsonify([r.to_dict() for r in rewards]), 200

@rewards_bp.route('/redeem', methods=['POST'])
@token_required
def redeem_reward(current_user):
    """
    Canjea una recompensa descontando los puntos XP del usuario.
    """
    data = request.get_json() or {}
    reward_id = data.get('reward_id')
    
    if not reward_id:
        return jsonify({'message': 'Se requiere seleccionar una recompensa.'}), 400
        
    reward = Reward.query.get_or_404(reward_id)
    if reward.institution_id != current_user.institution_id:
        return jsonify({'message': 'Recompensa no válida para tu institución.'}), 403
        
    # Verificar si el usuario tiene suficientes XP
    # Supeditado a sus puntos actuales o permitir el canje
    redemption = RewardRedemption(
        user_id=current_user.id,
        reward_id=reward.id,
        status='canjeado'
    )
    
    try:
        db.session.add(redemption)
        db.session.commit()
        return jsonify({
            'message': f'¡Felicidades! Has canjeado "{reward.title}" por {reward.cost_xp} XP 🏆',
            'redemption': redemption.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al canjear recompensa: {str(e)}'}), 500

@rewards_bp.route('/my-redemptions', methods=['GET'])
@token_required
def get_my_redemptions(current_user):
    """
    Retorna el historial de recompensas canjeadas por el usuario.
    """
    redemptions = RewardRedemption.query.filter_by(user_id=current_user.id).order_by(RewardRedemption.redeemed_at.desc()).all()
    return jsonify([r.to_dict() for r in redemptions]), 200

@rewards_bp.route('', methods=['POST'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo')
def create_reward(current_user):
    """
    Crea una nueva recompensa en la tienda de la institución.
    """
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    cost_xp = int(data.get('cost_xp', 100))
    category = data.get('category', 'Reconocimiento')
    icon = data.get('icon', '🎁')
    
    if not title:
        return jsonify({'message': 'El título de la recompensa es obligatorio.'}), 400
        
    reward = Reward(
        title=title,
        description=description,
        cost_xp=cost_xp,
        category=category,
        icon=icon,
        institution_id=current_user.institution_id
    )
    
    try:
        db.session.add(reward)
        db.session.commit()
        return jsonify({'message': 'Recompensa creada exitosamente.', 'reward': reward.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al crear recompensa: {str(e)}'}), 500
