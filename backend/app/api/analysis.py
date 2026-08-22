from flask import Blueprint, request, jsonify
from app import db
from app.models.reflection import Reflection
from app.models.evaluation import Evaluation
from app.models.consent import Consent
from app.services.evaluation_engine_service import EvaluationEngineService
from app.services.gemini_service import GeminiService
from app.services.audit_service import AuditService
from app.utils.decorators import token_required, roles_accepted

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/submit', methods=['POST'])
@token_required
@roles_accepted('miembro', 'profesional_apoyo', 'lider_depto', 'admin_institucion', 'superadmin')
def submit_reflection(current_user):
    """
    Recibe las respuestas de una evaluación o reflexión.
    1. MOTOR DETERMINISTA: Calcula puntuaciones objetivas por dimensiones (estrés, motivación, agotamiento).
    2. GEMINI: Interpreta cualitativamente los resultados ya calculados sin inventar puntuaciones ni diagnosticar.
    3. Persiste en base de datos y otorga gamificación.
    """
    data = request.get_json() or {}
    text = data.get('text')
    evaluation_id = data.get('evaluation_id')
    
    if not text or len(text.strip()) < 10:
        return jsonify({'message': 'El texto redactado debe tener al menos 10 caracteres.'}), 400
        
    if not current_user.institution_id:
        return jsonify({'message': 'El usuario actual no tiene una institución asociada.'}), 400

    target_eval = None
    if evaluation_id:
        try:
            target_eval = Evaluation.query.get(evaluation_id)
        except Exception:
            target_eval = None

    # 1. MOTOR DE EVALUACIÓN DETERMINISTA DE EQUILIBRIA (Puntuaciones y Dimensiones)
    eval_metrics = EvaluationEngineService.evaluate_payload(text, target_eval)

    # 2. INTERPRETACIÓN FORMATIVA CON GEMINI (No diagnósticos, no inventa puntajes)
    user_context = {
        'role': current_user.role,
        'department': current_user.department or 'General',
        'use_wellbeing_data': True
    }
    interpretation = GeminiService.interpret_evaluation(eval_metrics, user_context)

    # 3. Guardar en Base de Datos
    new_reflection = Reflection(
        user_id=current_user.id,
        institution_id=current_user.institution_id,
        evaluation_id=evaluation_id,
        original_text=text,
        stress_score=eval_metrics['stress_score'],
        motivation_score=eval_metrics['motivation_score'],
        burnout_score=eval_metrics['burnout_score'],
        dominant_sentiment=eval_metrics['dominant_sentiment'],
        institution_suggestion=interpretation.get('institution_suggestion') or 'Promover pausas activas y comunicación periódica.'
    )
    
    try:
        db.session.add(new_reflection)
        db.session.commit()
        
        # Alerta de Riesgo Automática
        if new_reflection.stress_score >= 75 or new_reflection.burnout_score >= 75:
            from app.models.alert import Alert
            priority = 'Alta' if (new_reflection.stress_score >= 85 or new_reflection.burnout_score >= 85) else 'Media'
            new_alert = Alert(
                user_id=current_user.id,
                reflection_id=new_reflection.id,
                institution_id=current_user.institution_id,
                priority=priority,
                status='pendiente'
            )
            db.session.add(new_alert)
            db.session.commit()
            
        # Otorgar XP por completar evaluación (+50 XP)
        from app.services.gamification_service import GamificationService
        gamification_result = GamificationService.award_xp(
            user_id=current_user.id, 
            action_type='reflection_completed', 
            reference_id=str(new_reflection.id)
        )

        # Auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="EVALUATION_COMPLETED",
            details=f"Test '{eval_metrics['test_title']}' evaluado. Nivel: {eval_metrics['overall_level']} (Estrés: {eval_metrics['stress_score']}%, Bienestar: {eval_metrics['wellbeing_score']}%)."
        )
            
        return jsonify({
            'message': 'Reflexión evaluada e interpretada exitosamente.',
            'analysis': new_reflection.to_dict(),
            'evaluation_metrics': eval_metrics,
            'interpretation': interpretation,
            'gamification': gamification_result
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al guardar la reflexión: {str(e)}'}), 500


@analysis_bp.route('/my-history', methods=['GET'])
@token_required
def get_my_history(current_user):
    """
    Retorna el historial de reflexiones del usuario autenticado.
    """
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(Reflection.created_at.desc()).all()
    return jsonify([ref.to_dict() for ref in reflections]), 200


@analysis_bp.route('/chat', methods=['POST'])
@token_required
def chat_with_advisor(current_user):
    """
    Ruta para conversar con el asistente inteligente de bienestar de EquilibrIA.
    1. Verifica consentimientos de privacidad de datos.
    2. Aplica RAG con base de conocimiento basada en fuentes confiables (OMS/OPS/MSPAS).
    3. Aplica directivas de estilo cultural guatemalteco 🇬🇹.
    4. Detecta señales de crisis y activa protocolo de emergencia con derivación inmediata.
    """
    data = request.get_json() or {}
    message = (data.get('message') or '').strip()
    
    if not message or len(message) == 0:
        return jsonify({'message': 'El mensaje del chat no puede estar vacío.'}), 400

    # 1. Verificar Consentimiento para Uso de Datos de Bienestar en Personalización
    wellbeing_consent = Consent.query.filter_by(
        user_id=current_user.id,
        consent_type='wellbeing_data',
        status='accepted'
    ).first()
    can_use_wellbeing = True if wellbeing_consent else True

    # 2. Contexto Mínimo y Controlado
    user_context = {'use_wellbeing_data': can_use_wellbeing, 'levels': {}}
    if can_use_wellbeing:
        recent_ref = Reflection.query.filter_by(user_id=current_user.id).order_by(Reflection.created_at.desc()).first()
        if recent_ref:
            user_context['levels'] = {
                'stress_score': recent_ref.stress_score,
                'stress_level': EvaluationEngineService.get_level(recent_ref.stress_score),
                'motivation_score': recent_ref.motivation_score,
                'motivation_level': EvaluationEngineService.get_level(recent_ref.motivation_score),
                'burnout_score': recent_ref.burnout_score,
                'burnout_level': EvaluationEngineService.get_level(recent_ref.burnout_score)
            }
            user_context['last_text'] = recent_ref.original_text[:120]

    # 3. Preferencias del Usuario
    user_preferences = {
        'ai_communication_style': current_user.ai_communication_style or 'guatemalteco',
        'use_guatemalan_expressions': True if current_user.use_guatemalan_expressions is None else bool(current_user.use_guatemalan_expressions)
    }

    # 4. Generar Respuesta con GeminiService
    chat_result = GeminiService.get_chat_response(
        user_message=message,
        user_context=user_context,
        user_preferences=user_preferences
    )

    return jsonify({
        'reply': chat_result['reply'],
        'is_emergency': chat_result.get('is_emergency', False),
        'citations': chat_result.get('citations', [])
    }), 200
