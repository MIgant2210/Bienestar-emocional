from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.models.gamification import XpTransaction, UserActivityDay, Badge, UserBadge, XpRule
from app.services.gamification_service import GamificationService, LEVEL_THRESHOLDS
from app.utils.decorators import token_required

gamification_bp = Blueprint('gamification', __name__)

@gamification_bp.route('/me', methods=['GET'])
@token_required
def get_my_gamification_profile(current_user):
    """
    Retorna el perfil consolidado de gamificación del usuario autenticado:
    Nivel, XP, Racha real, Medallas y Posición en Ranking.
    """
    profile = GamificationService.get_user_profile(current_user.id)
    if not profile:
        return jsonify({'message': 'Usuario no encontrado.'}), 404
        
    return jsonify(profile), 200

@gamification_bp.route('/xp-history', methods=['GET'])
@token_required
def get_xp_history(current_user):
    """
    Retorna el historial de transacciones de XP otorgadas al usuario desde PostgreSQL.
    """
    history = XpTransaction.query.filter_by(user_id=current_user.id).order_by(XpTransaction.created_at.desc()).limit(100).all()
    return jsonify([tx.to_dict() for tx in history]), 200

@gamification_bp.route('/streak', methods=['GET'])
@token_required
def get_streak_details(current_user):
    """
    Retorna los datos de racha y la lista de días de actividad registrados para el calendario.
    """
    current_streak, longest_streak = GamificationService.update_user_streak(current_user.id)
    
    activity_days = UserActivityDay.query.filter_by(user_id=current_user.id).order_by(UserActivityDay.activity_date.desc()).all()
    active_dates = [a.activity_date.strftime('%Y-%m-%d') for a in activity_days]
    
    return jsonify({
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'last_activity_date': current_user.last_activity_date.strftime('%Y-%m-%d') if current_user.last_activity_date else None,
        'active_dates': active_dates
    }), 200

@gamification_bp.route('/badges', methods=['GET'])
@token_required
def get_badges_status(current_user):
    """
    Retorna las 6 medallas oficiales con su estado (desbloqueada/bloqueada), 
    fecha de obtención y progreso hacia el criterio.
    """
    GamificationService.seed_initial_config()
    GamificationService.check_and_unlock_badges(current_user.id)
    
    user_badges_map = {ub.badge_id: ub.unlocked_at.isoformat() for ub in UserBadge.query.filter_by(user_id=current_user.id).all()}
    all_badges = Badge.query.all()
    
    # Métricas para cálculo de progreso hacia criterios
    from app.models.reflection import Reflection
    from app.models.task_model import Task
    reflections_count = Reflection.query.filter_by(user_id=current_user.id).count()
    tasks_count = Task.query.filter_by(user_id=current_user.id, status='completada').count()
    wellness_count = reflections_count + tasks_count
    streak = max(current_user.current_streak or 0, current_user.longest_streak or 0)
    xp = current_user.total_xp or 0
    
    result = []
    for badge in all_badges:
        b_dict = badge.to_dict()
        is_unlocked = badge.id in user_badges_map
        b_dict['unlocked'] = is_unlocked
        b_dict['unlocked_at'] = user_badges_map.get(badge.id)
        
        # Calcular avance cuantitativo actual
        current_val = 0
        if badge.criterion_type == 'evaluations_count':
            current_val = reflections_count
        elif badge.criterion_type == 'streak_days':
            current_val = streak
        elif badge.criterion_type == 'wellness_activities_count':
            current_val = wellness_count
        elif badge.criterion_type == 'xp_milestone':
            current_val = xp
            
        b_dict['current_value'] = current_val
        b_dict['progress_percent'] = min(100.0, round((current_val / badge.criterion_value) * 100, 1)) if badge.criterion_value > 0 else 0
        
        result.append(b_dict)
        
    return jsonify(result), 200

@gamification_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user):
    """
    Retorna el ranking institucional ordenado dinámicamente por XP (u otros criterios).
    ESTRICTAMENTE AISLADO POR INSTITUCIÓN (institution_id).
    ESTRICTA PRIVACIDAD: Cero exposición de datos emocionales o personales clínicos.
    """
    if not current_user.institution_id:
        return jsonify({'message': 'El usuario no pertenece a una institución.'}), 400
        
    sort_by = request.args.get('sort_by', 'xp') # 'xp', 'badges', 'streak', 'level'
    
    users = User.query.filter_by(institution_id=current_user.institution_id).all()
    
    leaderboard_items = []
    for u in users:
        # Contar medallas
        badges_cnt = UserBadge.query.filter_by(user_id=u.id).count()
        leaderboard_items.append({
            'user_id': str(u.id),
            'first_name': u.first_name,
            'last_name': u.last_name,
            'department': u.department or 'General',
            'total_xp': u.total_xp or 0,
            'current_level': u.current_level or 1,
            'current_streak': u.current_streak or 0,
            'longest_streak': u.longest_streak or 0,
            'badges_count': badges_cnt,
            'is_current_user': (u.id == current_user.id)
        })
        
    # Desempate secundario: XP -> Level -> Badges -> Streak
    if sort_by == 'badges':
        leaderboard_items.sort(key=lambda x: (x['badges_count'], x['total_xp'], x['current_level'], x['current_streak']), reverse=True)
    elif sort_by == 'streak':
        leaderboard_items.sort(key=lambda x: (x['current_streak'], x['total_xp'], x['badges_count'], x['current_level']), reverse=True)
    elif sort_by == 'level':
        leaderboard_items.sort(key=lambda x: (x['current_level'], x['total_xp'], x['badges_count'], x['current_streak']), reverse=True)
    else: # Default: 'xp'
        leaderboard_items.sort(key=lambda x: (x['total_xp'], x['current_level'], x['badges_count'], x['current_streak']), reverse=True)
        
    # Asignar posición #1, #2, #3...
    for idx, item in enumerate(leaderboard_items):
        item['rank'] = idx + 1
        
    return jsonify(leaderboard_items), 200

@gamification_bp.route('/levels', methods=['GET'])
@token_required
def get_levels_config(current_user):
    """
    Retorna la estructura configurable de niveles del sistema.
    """
    levels_data = []
    for lvl, req_xp, title in LEVEL_THRESHOLDS:
        levels_data.append({
            'level': lvl,
            'required_xp': req_xp,
            'title': title
        })
    return jsonify(levels_data), 200

@gamification_bp.route('/activity', methods=['POST'])
@token_required
def record_activity(current_user):
    """
    Endpoint seguro para registrar acciones válidas del usuario que otorgan XP 
    (p. ej., consultar recomendaciones, pausas activas, check-in diario).
    El servidor valida la acción y el monto de XP.
    """
    data = request.get_json() or {}
    action_type = data.get('action_type')
    reference_id = data.get('reference_id')
    
    valid_actions = ['mood_logged', 'reflection_completed', 'recommendation_viewed', 'daily_checkin', 'wellness_activity']
    if not action_type or action_type not in valid_actions:
        return jsonify({'message': f'Acción no válida. Acciones permitidas: {", ".join(valid_actions)}'}), 400
        
    result = GamificationService.award_xp(current_user.id, action_type=action_type, reference_id=reference_id)
    return jsonify(result), 200
