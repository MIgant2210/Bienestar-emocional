from flask import Blueprint, request, jsonify
from app import db
from app.models.reflection import Reflection
from app.services.gemini_service import GeminiService
from app.utils.decorators import token_required, roles_accepted

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/submit', methods=['POST'])
@token_required
@roles_accepted('miembro')
def submit_reflection(current_user):
    """
    Recibe el texto de un miembro, lo analiza mediante Gemini
    y guarda la reflexión asociada al usuario y a su institución.
    """
    data = request.get_json() or {}
    text = data.get('text')
    
    if not text or len(text.strip()) < 10:
        return jsonify({'message': 'El texto redactado debe tener al menos 10 caracteres.'}), 400
        
    if not current_user.institution_id:
        return jsonify({'message': 'El usuario actual no tiene una institución asociada.'}), 400
        
    # Llamar al servicio integrador de Gemini
    analysis_results = GeminiService.analyze_text(text)
    
    # Crear registro en la base de datos
    new_reflection = Reflection(
        user_id=current_user.id,
        institution_id=current_user.institution_id,
        original_text=text,
        stress_score=analysis_results['stress_score'],
        motivation_score=analysis_results['motivation_score'],
        burnout_score=analysis_results['burnout_score'],
        dominant_sentiment=analysis_results['dominant_sentiment'],
        institution_suggestion=analysis_results['institution_suggestion']
    )
    
    try:
        db.session.add(new_reflection)
        db.session.commit()
        return jsonify({
            'message': 'Reflexión analizada y registrada exitosamente.',
            'analysis': new_reflection.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al guardar la reflexión: {str(e)}'}), 500

@analysis_bp.route('/my-history', methods=['GET'])
@token_required
@roles_accepted('miembro')
def get_my_history(current_user):
    """
    Retorna el historial de reflexiones del miembro autenticado.
    Esto permite que el usuario vea su propio progreso.
    """
    reflections = Reflection.query.filter_by(user_id=current_user.id).order_by(Reflection.created_at.desc()).all()
    return jsonify([ref.to_dict() for ref in reflections]), 200

@analysis_bp.route('/chat', methods=['POST'])
@token_required
@roles_accepted('miembro')
def chat_with_advisor(current_user):
    """
    Ruta para conversar con el asistente emocional Gemini.
    Integra el historial del usuario para contextualizar la charla.
    """
    data = request.get_json() or {}
    message = data.get('message')
    
    if not message or len(message.strip()) == 0:
        return jsonify({'message': 'El mensaje del chat no puede estar vacío.'}), 400
        
    # Obtener últimas 5 reflexiones del usuario para darle contexto a la IA
    recent_refs = Reflection.query.filter_by(user_id=current_user.id).order_by(Reflection.created_at.desc()).limit(5).all()
    
    history_summary = ""
    if recent_refs:
        summary_parts = []
        for ref in recent_refs:
            date_str = ref.created_at.strftime('%Y-%m-%d')
            summary_parts.append(
                f"[Fecha: {date_str}, Sentimiento: {ref.dominant_sentiment}, "
                f"Estrés: {ref.stress_score}%, Motivación: {ref.motivation_score}%, Agotamiento: {ref.burnout_score}%. "
                f"Texto escrito: '{ref.original_text}']"
            )
        history_summary = " | ".join(summary_parts)
    else:
        history_summary = "Usuario nuevo, sin reflexiones previas registradas."
        
    response_text = GeminiService.get_chat_response(history_summary, message)
    return jsonify({'reply': response_text}), 200
