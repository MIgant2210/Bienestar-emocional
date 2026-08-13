from datetime import datetime, date, timedelta
from app import db
from app.models.user import User
from app.models.gamification import XpTransaction, UserActivityDay, Badge, UserBadge, XpRule
from app.models.reflection import Reflection
from app.models.task_model import Task

LEVEL_THRESHOLDS = [
    (1, 0, 'Iniciante de Bienestar'),
    (2, 100, 'Explorador Emocional'),
    (3, 250, 'Practicante Consciente'),
    (4, 500, 'Guardián del Equilibrio'),
    (5, 800, 'Mentor de Resiliencia'),
    (6, 1200, 'Líder de Bienestar'),
    (7, 1700, 'Maestro de la Calma'),
    (8, 2300, 'Embajador de Salud'),
    (9, 3000, 'Faro de Positividad'),
    (10, 4000, 'Pilar Institucional')
]

DEFAULT_BADGES = [
    {
        'id': 'primer_paso',
        'name': 'Primer Paso',
        'description': 'Completar tu primera evaluación de bienestar emocional.',
        'icon': 'Footprints',
        'color': '#d97706',
        'criterion_type': 'evaluations_count',
        'criterion_value': 1,
        'rarity': 'Común'
    },
    {
        'id': 'constancia',
        'name': 'Constancia',
        'description': 'Mantener una racha activa de participación por 7 días consecutivos.',
        'icon': 'Calendar',
        'color': '#8b5cf6',
        'criterion_type': 'streak_days',
        'criterion_value': 7,
        'rarity': 'Rara'
    },
    {
        'id': 'compromiso',
        'name': 'Compromiso',
        'description': 'Mantener una racha activa de participación por 30 días consecutivos.',
        'icon': 'Flame',
        'color': '#f97316',
        'criterion_type': 'streak_days',
        'criterion_value': 30,
        'rarity': 'Épica'
    },
    {
        'id': 'explorador',
        'name': 'Explorador',
        'description': 'Completar 10 evaluaciones de bienestar emocional.',
        'icon': 'Compass',
        'color': '#3b82f6',
        'criterion_type': 'evaluations_count',
        'criterion_value': 10,
        'rarity': 'Rara'
    },
    {
        'id': 'bienestar',
        'name': 'Bienestar',
        'description': 'Completar 25 actividades de salud y pausas de bienestar.',
        'icon': 'Heart',
        'color': '#10b981',
        'criterion_type': 'wellness_activities_count',
        'criterion_value': 25,
        'rarity': 'Épica'
    },
    {
        'id': 'inspiracion',
        'name': 'Inspiración',
        'description': 'Alcanzar el hito de 800 XP o llegar al Nivel 5 de progreso.',
        'icon': 'Sparkles',
        'color': '#eab308',
        'criterion_type': 'xp_milestone',
        'criterion_value': 800,
        'rarity': 'Legendaria'
    }
]

DEFAULT_XP_RULES = {
    'evaluation_completed': {'xp': 50, 'desc': 'Completar una evaluación de bienestar'},
    'mood_logged': {'xp': 20, 'desc': 'Registrar estado de ánimo diario'},
    'reflection_completed': {'xp': 10, 'desc': 'Completar una reflexión personal opcional'},
    'recommendation_viewed': {'xp': 5, 'desc': 'Consultar recomendaciones de bienestar generadas'},
    'daily_checkin': {'xp': 10, 'desc': 'Mantener participación diaria activa'},
    'wellness_activity': {'xp': 20, 'desc': 'Completar una actividad de bienestar propuesta'}
}

class GamificationService:
    
    @staticmethod
    def seed_initial_config():
        """Inicializa las 6 medallas y las reglas de XP en PostgreSQL si no existen."""
        try:
            for b_data in DEFAULT_BADGES:
                existing = Badge.query.get(b_data['id'])
                if not existing:
                    badge = Badge(**b_data)
                    db.session.add(badge)
                    
            for action, rule_data in DEFAULT_XP_RULES.items():
                existing_rule = XpRule.query.get(action)
                if not existing_rule:
                    rule = XpRule(
                        action_type=action,
                        xp_amount=rule_data['xp'],
                        description=rule_data['desc']
                    )
                    db.session.add(rule)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding gamification config: {e}")

    @staticmethod
    def get_level_info(total_xp):
        """Calcula el nivel y el progreso en XP hacia el siguiente nivel."""
        current_level = 1
        xp_for_current = 0
        xp_for_next = 100
        level_title = 'Iniciante de Bienestar'
        
        for lvl, req_xp, title in LEVEL_THRESHOLDS:
            if total_xp >= req_xp:
                current_level = lvl
                xp_for_current = req_xp
                level_title = title
            else:
                xp_for_next = req_xp
                break
                
        if total_xp >= LEVEL_THRESHOLDS[-1][1]:
            extra_xp = total_xp - LEVEL_THRESHOLDS[-1][1]
            extra_levels = (extra_xp // 1000) + 1
            current_level = 10 + extra_levels
            xp_for_current = LEVEL_THRESHOLDS[-1][1] + (extra_levels - 1) * 1000
            xp_for_next = xp_for_current + 1000
            level_title = f'Pilar Institucional Nivel {current_level}'
            
        xp_in_current_level = max(0, total_xp - xp_for_current)
        xp_needed_in_level = max(1, xp_for_next - xp_for_current)
        progress_pct = min(100.0, round((xp_in_current_level / xp_needed_in_level) * 100, 1))
        
        return {
            'level': current_level,
            'title': level_title,
            'total_xp': total_xp,
            'xp_for_current_level': xp_for_current,
            'xp_for_next_level': xp_for_next,
            'xp_in_current_level': xp_in_current_level,
            'xp_remaining': max(0, xp_for_next - total_xp),
            'progress_percent': progress_pct
        }

    @staticmethod
    def update_user_streak(user_id):
        """
        Calcula y actualiza la racha continua basándose en los días de actividad 
        reales guardados en user_activity_days.
        """
        user = User.query.get(user_id)
        if not user:
            return 0, 0
            
        today = date.today()
        activity_records = UserActivityDay.query.filter_by(user_id=user_id).order_by(UserActivityDay.activity_date.desc()).all()
        
        if not activity_records:
            user.current_streak = 0
            db.session.commit()
            return 0, user.longest_streak or 0
            
        activity_dates = set(rec.activity_date for rec in activity_records)
        
        # Determinar punto de inicio
        current_streak = 0
        check_date = today
        
        if today not in activity_dates:
            # Si hoy aún no ha participado, revisar si ayer participó
            check_date = today - timedelta(days=1)
            
        while check_date in activity_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
            
        user.current_streak = current_streak
        if current_streak > (user.longest_streak or 0):
            user.longest_streak = current_streak
            
        user.last_activity_date = max(activity_dates) if activity_dates else None
        db.session.commit()
        
        return user.current_streak, user.longest_streak

    @staticmethod
    def record_activity_day(user_id, activity_type='participation'):
        """Registra el día actual en user_activity_days si aún no existe."""
        today = date.today()
        existing = UserActivityDay.query.filter_by(user_id=user_id, activity_date=today).first()
        if not existing:
            act_day = UserActivityDay(
                user_id=user_id,
                activity_date=today,
                activity_type=activity_type
            )
            db.session.add(act_day)
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
                
        # Actualizar la racha
        GamificationService.update_user_streak(user_id)

    @staticmethod
    def check_and_unlock_badges(user_id):
        """
        Inspecciona los criterios de las 6 medallas y otorga automáticamente las que cumpla.
        """
        user = User.query.get(user_id)
        if not user:
            return []
            
        unlocked_new = []
        user_badges = UserBadge.query.filter_by(user_id=user_id).all()
        existing_badge_ids = set(ub.badge_id for ub in user_badges)
        
        # 1. Conteo de evaluaciones/reflexiones
        reflections_count = Reflection.query.filter_by(user_id=user_id).count()
        
        # 2. Conteo de actividades de bienestar (tareas completadas + reflexiones)
        tasks_count = Task.query.filter_by(user_id=user_id, status='completada').count()
        wellness_count = reflections_count + tasks_count
        
        # 3. Racha actual y máxima
        streak = max(user.current_streak or 0, user.longest_streak or 0)
        
        # 4. Total XP
        xp = user.total_xp or 0
        
        all_badges = Badge.query.all()
        for badge in all_badges:
            if badge.id in existing_badge_ids:
                continue
                
            is_unlocked = False
            if badge.criterion_type == 'evaluations_count' and reflections_count >= badge.criterion_value:
                is_unlocked = True
            elif badge.criterion_type == 'streak_days' and streak >= badge.criterion_value:
                is_unlocked = True
            elif badge.criterion_type == 'wellness_activities_count' and wellness_count >= badge.criterion_value:
                is_unlocked = True
            elif badge.criterion_type == 'xp_milestone' and xp >= badge.criterion_value:
                is_unlocked = True
                
            if is_unlocked:
                ub = UserBadge(user_id=user_id, badge_id=badge.id)
                db.session.add(ub)
                unlocked_new.append(badge.to_dict())
                
        if unlocked_new:
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Error saving unlocked badges: {e}")
                
        return unlocked_new

    @staticmethod
    def award_xp(user_id, action_type, reference_id=None, custom_description=None):
        """
        Otorga XP a un usuario mediante la regla configurada en PostgreSQL.
        Garantiza anti-duplicidad si se envía reference_id.
        """
        GamificationService.seed_initial_config()
        
        user = User.query.get(user_id)
        if not user:
            return None
            
        # 1. Anti-duplicados por reference_id
        if reference_id:
            existing_tx = XpTransaction.query.filter_by(
                user_id=user_id, 
                action_type=action_type, 
                reference_id=str(reference_id)
            ).first()
            if existing_tx:
                # Ya fue premiado previamente por esta acción específica
                return {
                    'already_awarded': True,
                    'xp_gained': 0,
                    'total_xp': user.total_xp,
                    'level_info': GamificationService.get_level_info(user.total_xp),
                    'new_badges': []
                }

        # 2. Consultar regla de XP
        rule = XpRule.query.get(action_type)
        xp_amount = rule.xp_amount if rule else DEFAULT_XP_RULES.get(action_type, {}).get('xp', 10)
        desc = custom_description or (rule.description if rule else f"Actividad {action_type}")

        # 3. Guardar Transacción
        tx = XpTransaction(
            user_id=user_id,
            action_type=action_type,
            xp_amount=xp_amount,
            description=desc,
            reference_id=str(reference_id) if reference_id else None
        )
        db.session.add(tx)
        
        old_level = user.current_level or 1
        user.total_xp = (user.total_xp or 0) + xp_amount
        
        # Recalcular nivel
        lvl_info = GamificationService.get_level_info(user.total_xp)
        user.current_level = lvl_info['level']
        
        db.session.commit()
        
        # 4. Registrar día de actividad y racha
        GamificationService.record_activity_day(user_id, activity_type=action_type)
        
        # 5. Evaluar desbloqueo de medallas
        new_badges = GamificationService.check_and_unlock_badges(user_id)
        
        level_up = (lvl_info['level'] > old_level)
        
        return {
            'already_awarded': False,
            'xp_gained': xp_amount,
            'total_xp': user.total_xp,
            'level_info': lvl_info,
            'level_up': level_up,
            'new_badges': new_badges
        }

    @staticmethod
    def get_user_profile(user_id):
        """Retorna la ficha consolidada de gamificación del usuario."""
        GamificationService.seed_initial_config()
        user = User.query.get(user_id)
        if not user:
            return None
            
        # Actualizar racha y medallas
        current_streak, longest_streak = GamificationService.update_user_streak(user_id)
        GamificationService.check_and_unlock_badges(user_id)
        
        level_info = GamificationService.get_level_info(user.total_xp or 0)
        
        # Conteo de medallas obtenidas
        user_badges_list = UserBadge.query.filter_by(user_id=user_id).all()
        badges_count = len(user_badges_list)
        
        # Posición en el ranking de la institución
        rank = 1
        if user.institution_id:
            # Usuarios de la misma institución ordenados por XP desc, nivel desc, racha desc
            higher_users = User.query.filter(
                User.institution_id == user.institution_id,
                User.total_xp > (user.total_xp or 0)
            ).count()
            rank = higher_users + 1
            
        return {
            'user_id': str(user.id),
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'department': user.department or 'General',
            'institution_id': str(user.institution_id) if user.institution_id else None,
            'level_info': level_info,
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'last_activity_date': user.last_activity_date.strftime('%Y-%m-%d') if user.last_activity_date else None,
            'badges_count': badges_count,
            'institution_rank': rank
        }
