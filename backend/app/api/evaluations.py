import json
from flask import Blueprint, request, jsonify
from app import db
from sqlalchemy import or_
from app.models.evaluation import Evaluation
from app.models.reflection import Reflection
from app.utils.decorators import token_required, roles_accepted
from datetime import datetime, timedelta

evaluations_bp = Blueprint('evaluations', __name__)

@evaluations_bp.route('/templates', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_templates(current_user):
    """
    Retorna el banco de plantillas de tests precargados con 10 preguntas variadas (incluyendo dibujo canvas).
    """
    templates = Evaluation.query.filter_by(is_template=True).all()
    if not templates or len(templates) < 6:
        # Sembrar o actualizar plantillas (3 completas de 10 preguntas + 3 express de 5 preguntas)
        rich_templates_data = [
            {
                "title": "[Plantilla] Chequeo Integral de Clima Laboral y Estrés",
                "description": "Evaluación multidimensional de 10 preguntas para medir clima, sobrecarga laboral, resiliencia y expresión gráfica.",
                "category": "Clima Laboral",
                "questions": [
                    {"id": "q1", "question": "¿Cómo calificarías tu nivel general de carga laboral durante esta semana?", "type": "scale_1_5"},
                    {"id": "q2", "question": "Selecciona el emoji que mejor describe tu estado de ánimo dominante en tu jornada.", "type": "emoji_scale_5"},
                    {"id": "q3", "question": "En una escala de 1 a 10, ¿qué tan respaldado te sientes por tu equipo de trabajo?", "type": "scale_1_10"},
                    {"id": "q4", "question": "¿Sientes que tus metas individuales están alineadas con los objetivos del equipo?", "type": "boolean"},
                    {"id": "q5", "question": "Describe en tus palabras qué factores han generado mayor tensión o cansancio recientemente.", "type": "text"},
                    {"id": "q6", "question": "Dibuja en el lienzo tu nivel de energía o un símbolo gráfico que represente tu estado actual.", "type": "drawing"},
                    {"id": "q7", "question": "¿Qué tan frecuentemente logras hacer pausas activas para descansar tu mente durante el día?", "type": "scale_1_5"},
                    {"id": "q8", "question": "¿Has podido desconectarte laboralmente fuera de tu horario de trabajo?", "type": "boolean"},
                    {"id": "q9", "question": "De 1 a 10, ¿cuál es tu nivel de satisfacción con las herramientas y espacios de trabajo?", "type": "scale_1_10"},
                    {"id": "q10", "question": "¿Tienes alguna sugerencia o idea para mejorar el clima y bienestar de tu área?", "type": "text"}
                ]
            },
            {
                "title": "[Plantilla Express] Chequeo Rápido de Clima Laboral (5 Preguntas)",
                "description": "Evaluación veloz de 5 ítems para medir tensión semanal, emoji de ánimo, voz, dibujo de estado y respaldo.",
                "category": "Clima Laboral",
                "questions": [
                    {"id": "q1", "question": "¿Qué tan manejable ha sido tu nivel de carga laboral durante esta semana?", "type": "scale_1_5"},
                    {"id": "q2", "question": "Selecciona el emoji que mejor describe tu estado de ánimo dominanate hoy.", "type": "emoji_scale_5"},
                    {"id": "q3", "question": "Describe en pocas palabras el principal desafío o factor de tensión en tu jornada.", "type": "text"},
                    {"id": "q4", "question": "Dibuja en el lienzo gráfico un boceto o símbolo de tu estado de ánimo actual.", "type": "drawing"},
                    {"id": "q5", "question": "¿Te sientes respaldado por tu equipo de trabajo para resolver imprevistos?", "type": "boolean"}
                ]
            },
            {
                "title": "[Plantilla] Diagnóstico Semanal de Ánimo y Resiliencia",
                "description": "Cuestionario de 10 ítems para explorar bienestar personal, motivación futura y expresión gráfica emocional.",
                "category": "Ánimo Personal",
                "questions": [
                    {"id": "q1", "question": "¿Cómo te has sentido emocionalmente al iniciar tu jornada hoy?", "type": "emoji_scale_5"},
                    {"id": "q2", "question": "¿Con qué frecuencia te has sentido agotado física o mentalmente esta semana?", "type": "scale_1_5"},
                    {"id": "q3", "question": "¿Sientes que tienes la energía suficiente para completar tus proyectos encomendados?", "type": "boolean"},
                    {"id": "q4", "question": "En una escala de 1 a 10, ¿qué tan satisfecho te sientes con tu equilibrio vida-trabajo?", "type": "scale_1_10"},
                    {"id": "q5", "question": "Dicta por voz o escribe qué logro personal o grupal te ha producido mayor satisfacción.", "type": "text"},
                    {"id": "q6", "question": "Expresa gráficamente mediante un dibujo qué emoción o concepto representa tu momento actual.", "type": "drawing"},
                    {"id": "q7", "question": "¿Cómo evalúas la claridad con la que se comunican las prioridades en tu equipo?", "type": "scale_1_5"},
                    {"id": "q8", "question": "¿Identificas señales de sobrecarga o tensión excesiva en tus actividades?", "type": "boolean"},
                    {"id": "q9", "question": "De 1 a 10, ¿qué tan motivado te sientes respecto a tu desarrollo futuro?", "type": "scale_1_10"},
                    {"id": "q10", "question": "¿De qué manera la institución o la Psicóloga podría brindarte mejor acompañamiento?", "type": "text"}
                ]
            },
            {
                "title": "[Plantilla Express] Diagnóstico Rápido de Ánimo (5 Preguntas)",
                "description": "Cuestionario exprés de 5 ítems sobre energía personal, satisfacción, expresión gráfica y motivación futura.",
                "category": "Ánimo Personal",
                "questions": [
                    {"id": "q1", "question": "Del 1 al 10, ¿cuál es tu nivel de energía para afrontar tus labores de hoy?", "type": "scale_1_10"},
                    {"id": "q2", "question": "Selecciona el emoji que refleja tu nivel de calma ante los retos diarios.", "type": "emoji_scale_5"},
                    {"id": "q3", "question": "Dicta por voz o escribe qué factor te ha brindado mayor motivación hoy.", "type": "text"},
                    {"id": "q4", "question": "Expresa con un dibujo en el lienzo gráfico cómo visualizas tu equilibrio personal.", "type": "drawing"},
                    {"id": "q5", "question": "¿Lograste desconectarte y descansar adecuadamente durante tu último receso?", "type": "boolean"}
                ]
            },
            {
                "title": "[Plantilla] Evaluación de Bienestar Integral y Prevención de Burnout",
                "description": "Test de prevención de sobrecarga crónica de 10 preguntas con diagnósticos cuantitativos y lienzo interactivo.",
                "category": "Bienestar Integral",
                "questions": [
                    {"id": "q1", "question": "¿Qué nivel de cansancio físico o mental acumulas al cierre de la semana?", "type": "scale_1_10"},
                    {"id": "q2", "question": "Selecciona el emoji que refleja tu nivel de calma ante imprevistos cotidianos.", "type": "emoji_scale_5"},
                    {"id": "q3", "question": "¿Has experimentado dificultad para concentrarte o conciliar el sueño por estrés?", "type": "boolean"},
                    {"id": "q4", "question": "¿Con qué frecuencia te sientes reconocido y valorado en tus labores?", "type": "scale_1_5"},
                    {"id": "q5", "question": "Describe las principales fuentes de satisfacción o desafío en tus responsabilidades.", "type": "text"},
                    {"id": "q6", "question": "Dibuja un boceto o símbolo de tu lugar ideal para relajarte o recargar energía.", "type": "drawing"},
                    {"id": "q7", "question": "¿Cuentas con canales de comunicación abiertos para manifestar tus necesidades?", "type": "boolean"},
                    {"id": "q8", "question": "¿Qué tan efectivas consideras las actividades de integración y pausas activas?", "type": "scale_1_5"},
                    {"id": "q9", "question": "Del 1 al 10, ¿qué tan seguro y positivo te sientes en tu entorno actual?", "type": "scale_1_10"},
                    {"id": "q10", "question": "Ingresa cualquier observación adicional sobre tu salud emocional que desees compartir.", "type": "text"}
                ]
            },
            {
                "title": "[Plantilla Express] Chequeo Rápido de Prevención de Burnout (5 Preguntas)",
                "description": "Test veloz de 5 preguntas de prevención de sobrecarga crónica con dibujo lienzo y escala cuantitativa.",
                "category": "Bienestar Integral",
                "questions": [
                    {"id": "q1", "question": "¿Qué nivel de cansancio físico o mental acumulas al día de hoy?", "type": "scale_1_10"},
                    {"id": "q2", "question": "¿Con qué frecuencia logras realizar pausas de respiración o descanso?", "type": "scale_1_5"},
                    {"id": "q3", "question": "Escribe brevemente qué cambios te ayudarían a reducir la fatiga en tu jornada.", "type": "text"},
                    {"id": "q4", "question": "Dibuja un boceto o garabato que represente tu espacio ideal para relajarte.", "type": "drawing"},
                    {"id": "q5", "question": "¿Cuentas con la claridad y herramientas necesarias para cumplir tus funciones?", "type": "boolean"}
                ]
            }
        ]

        # Eliminar antiguas plantillas para re-sembrar las 6 completas
        Evaluation.query.filter_by(is_template=True).delete()
        db.session.commit()

        for tdata in rich_templates_data:
            tpl = Evaluation(
                title=tdata["title"],
                description=tdata["description"],
                category=tdata["category"],
                questions_json=json.dumps(tdata["questions"]),
                is_active=True,
                is_template=True
            )
            db.session.add(tpl)
        db.session.commit()
        templates = Evaluation.query.filter_by(is_template=True).all()

    return jsonify([t.to_dict() for t in templates]), 200

@evaluations_bp.route('/activate-template', methods=['POST'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def activate_template(current_user):
    """
    Clona y activa un test precargado para la institución del usuario con 1 clic.
    """
    data = request.get_json() or {}
    template_id = data.get('template_id')
    scheduled_date_str = data.get('scheduled_date')
    
    if not template_id:
        return jsonify({'message': 'Se requiere seleccionar una plantilla válida.'}), 400
        
    template = Evaluation.query.get_or_404(template_id)
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'El usuario debe pertenecer a una institución.'}), 400
        
    scheduled_date = None
    if scheduled_date_str:
        try:
            scheduled_date = datetime.fromisoformat(scheduled_date_str.replace('Z', ''))
        except ValueError:
            pass
            
    assigned_type = data.get('assigned_type', 'all')
    assigned_target = data.get('assigned_target')

    active_eval = Evaluation(
        title=template.title.replace('[Plantilla] ', ''),
        description=template.description,
        category=template.category,
        questions_json=template.questions_json,
        is_active=True,
        is_template=False,
        scheduled_date=scheduled_date or (datetime.utcnow() + timedelta(days=7)),
        assigned_type=assigned_type,
        assigned_target=assigned_target,
        institution_id=institution_id
    )
    
    try:
        db.session.add(active_eval)
        db.session.commit()
        return jsonify({
            'message': 'Test precargado activado exitosamente para la institución.',
            'evaluation': active_eval.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al activar el test: {str(e)}'}), 500

@evaluations_bp.route('', methods=['GET'])
@token_required
def get_evaluations(current_user):
    """
    Retorna la lista de evaluaciones / cuestionarios de la institución (excluyendo plantillas).
    - Miembros ven evaluaciones activas únicamente.
    - Administradores ven todas (activas e inactivas).
    """
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'El usuario no tiene una institución asociada.'}), 400
        
    query = Evaluation.query.filter_by(institution_id=institution_id, is_template=False)
    
    if current_user.role == 'miembro':
        user_dept = current_user.department or 'General'
        user_email = current_user.email
        evals = query.filter_by(is_active=True).filter(
            or_(
                Evaluation.assigned_type == 'all',
                (Evaluation.assigned_type == 'department') & (Evaluation.assigned_target == user_dept),
                (Evaluation.assigned_type == 'individual') & (Evaluation.assigned_target == user_email)
            )
        ).order_by(Evaluation.created_at.desc()).all()
    else:
        evals = query.order_by(Evaluation.created_at.desc()).all()
        
    return jsonify([ev.to_dict() for ev in evals]), 200

@evaluations_bp.route('', methods=['POST'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def create_evaluation(current_user):
    """
    Crea un nuevo test personalizado con preguntas a medida para la institución (Admin).
    """
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    category = data.get('category', 'Bienestar Integral')
    questions = data.get('questions', [])
    scheduled_date_str = data.get('scheduled_date')
    
    assigned_type = data.get('assigned_type', 'all')
    assigned_target = data.get('assigned_target')
    
    if not title:
        return jsonify({'message': 'El título del test es obligatorio.'}), 400
        
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400
        
    scheduled_date = None
    if scheduled_date_str:
        try:
            scheduled_date = datetime.fromisoformat(scheduled_date_str.replace('Z', ''))
        except ValueError:
            return jsonify({'message': 'Fecha inválida. Use formato ISO (YYYY-MM-DD).'}), 400
            
    questions_json = json.dumps(questions) if questions else None
            
    new_eval = Evaluation(
        title=title,
        description=description,
        category=category,
        questions_json=questions_json,
        scheduled_date=scheduled_date,
        institution_id=institution_id,
        assigned_type=assigned_type,
        assigned_target=assigned_target,
        is_active=True,
        is_template=False
    )
    
    try:
        db.session.add(new_eval)
        db.session.commit()
        return jsonify({
            'message': 'Test de evaluación creado y programado exitosamente.',
            'evaluation': new_eval.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al crear el test: {str(e)}'}), 500

@evaluations_bp.route('/<uuid:eval_id>', methods=['PUT'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def update_evaluation(current_user, eval_id):
    """
    Actualiza o desactiva/activa un cuestionario de la institución.
    """
    data = request.get_json() or {}
    evaluation = Evaluation.query.get_or_404(eval_id)
    
    if evaluation.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para modificar este cuestionario.'}), 403
        
    if 'title' in data:
        evaluation.title = data['title']
    if 'description' in data:
        evaluation.description = data['description']
    if 'category' in data:
        evaluation.category = data['category']
    if 'is_active' in data:
        evaluation.is_active = bool(data['is_active'])
    if 'questions' in data:
        evaluation.questions_json = json.dumps(data['questions'])
            
    try:
        db.session.commit()
        return jsonify({
            'message': 'Cuestionario actualizado exitosamente.',
            'evaluation': evaluation.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al actualizar el cuestionario: {str(e)}'}), 500

@evaluations_bp.route('/<uuid:eval_id>/responses', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_evaluation_responses(current_user, eval_id):
    """
    Retorna los datos agregados, promedios y lista de respuestas individuales asociadas a un test específico para Psicóloga, Líder y Admin.
    """
    evaluation = Evaluation.query.get_or_404(eval_id)
    if current_user.role != 'superadmin' and evaluation.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para ver las respuestas de este test.'}), 403
        
    search_pattern = f"%{evaluation.title}%"
    reflections = Reflection.query.filter(
        Reflection.institution_id == evaluation.institution_id,
        (Reflection.evaluation_id == evaluation.id) | 
        ((Reflection.original_text.like(search_pattern)) & (Reflection.evaluation_id == None))
    ).order_by(Reflection.created_at.desc()).all()
    
    total_responses = len(reflections)
    avg_stress = round(sum(r.stress_score for r in reflections) / total_responses, 1) if total_responses > 0 else 0
    avg_motivation = round(sum(r.motivation_score for r in reflections) / total_responses, 1) if total_responses > 0 else 0
    avg_burnout = round(sum(r.burnout_score for r in reflections) / total_responses, 1) if total_responses > 0 else 0
    
    sentiments = {'Positivo': 0, 'Neutro': 0, 'Negativo': 0}
    for r in reflections:
        if r.dominant_sentiment in sentiments:
            sentiments[r.dominant_sentiment] += 1
            
    return jsonify({
        'test_id': str(evaluation.id),
        'title': evaluation.title,
        'category': evaluation.category,
        'total_responses': total_responses,
        'averages': {
            'stress': avg_stress,
            'motivation': avg_motivation,
            'burnout': avg_burnout
        },
        'sentiments': sentiments,
        'responses': [r.to_dict() for r in reflections]
    }), 200

@evaluations_bp.route('/response/<uuid:reflection_id>/clinical-notes', methods=['PUT'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def update_clinical_notes(current_user, reflection_id):
    """
    Permite a la Psicóloga / Profesional de Apoyo o Admin guardar notas de diagnóstico clínico manual sobre la respuesta de un colaborador.
    """
    data = request.get_json() or {}
    notes = data.get('clinical_notes', '')
    
    reflection = Reflection.query.get_or_404(reflection_id)
    if current_user.role != 'superadmin' and reflection.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para modificar la nota de este usuario.'}), 403
        
    reflection.clinical_notes = notes
    db.session.commit()
    return jsonify({
        'message': 'Notas diagnósticas manuales guardadas exitosamente.',
        'reflection': reflection.to_dict()
    }), 200

@evaluations_bp.route('/<uuid:eval_id>', methods=['DELETE'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def delete_evaluation(current_user, eval_id):
    """
    Elimina un cuestionario.
    """
    evaluation = Evaluation.query.get_or_404(eval_id)
    
    if evaluation.institution_id != current_user.institution_id:
        return jsonify({'message': 'No tiene permisos para eliminar este cuestionario.'}), 403
        
    try:
        db.session.delete(evaluation)
        db.session.commit()
        return jsonify({'message': 'Cuestionario eliminado exitosamente.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al eliminar el cuestionario: {str(e)}'}), 500
