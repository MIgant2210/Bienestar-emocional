from flask import Blueprint, request, jsonify
from app import db
from app.models.cultural_expression import CulturalExpression
from app.services.cultural_dictionary_service import CulturalDictionaryService
from app.services.audit_service import AuditService
from app.utils.decorators import token_required, roles_accepted

culture_bp = Blueprint('culture', __name__)

@culture_bp.route('/expressions', methods=['GET'])
@token_required
def get_cultural_expressions(current_user):
    """
    Retorna el listado de expresiones guatemaltecas con filtros por nivel de seguridad y búsqueda.
    """
    safety_level = request.args.get('safety_level')
    search = request.args.get('search', '').strip().lower()
    category = request.args.get('category')
    active_only = request.args.get('active_only', 'false').lower() == 'true'

    query = CulturalExpression.query

    if active_only:
        query = query.filter_by(active=True)

    if safety_level and safety_level.upper() in ['ALLOWED', 'EXPLAINABLE', 'RESTRICTED']:
        query = query.filter_by(safety_level=safety_level.upper())

    if category:
        query = query.filter_by(category=category.upper())

    if search:
        query = query.filter(
            db.or_(
                CulturalExpression.term.ilike(f'%{search}%'),
                CulturalExpression.meaning.ilike(f'%{search}%'),
                CulturalExpression.example.ilike(f'%{search}%')
            )
        )

    expressions = query.order_by(CulturalExpression.term.asc()).all()

    # Estadísticas optimizadas en 1 sola consulta SQL agregada (GROUP BY)
    grouped_counts = db.session.query(
        CulturalExpression.safety_level,
        db.func.count(CulturalExpression.id)
    ).filter_by(active=True).group_by(CulturalExpression.safety_level).all()

    counts_map = dict(grouped_counts)
    counts = {
        'total': sum(counts_map.values()),
        'allowed': counts_map.get('ALLOWED', 0),
        'explainable': counts_map.get('EXPLAINABLE', 0),
        'restricted': counts_map.get('RESTRICTED', 0)
    }

    return jsonify({
        'expressions': [e.to_dict() for e in expressions],
        'counts': counts
    }), 200


@culture_bp.route('/expressions', methods=['POST'])
@token_required
@roles_accepted('superadmin')
def create_cultural_expression(current_user):
    """
    Crea una nueva expresión cultural guatemalteca (Solo SuperAdmin).
    """
    data = request.get_json() or {}
    term = (data.get('term') or '').strip().lower()
    meaning = (data.get('meaning') or '').strip()
    example = (data.get('example') or '').strip()
    safety_level = (data.get('safety_level') or 'ALLOWED').upper()
    category = (data.get('category') or 'GUATEMALTEQUISMO').upper()
    can_use = data.get('can_use', safety_level == 'ALLOWED')
    can_explain = data.get('can_explain', True)
    context_notes = (data.get('context_notes') or '').strip()

    if not term or not meaning:
        return jsonify({'message': 'El término y su significado son obligatorios.'}), 400

    if safety_level not in ['ALLOWED', 'EXPLAINABLE', 'RESTRICTED']:
        return jsonify({'message': 'Nivel de seguridad inválido. Use ALLOWED, EXPLAINABLE o RESTRICTED.'}), 400

    if CulturalExpression.query.filter(db.func.lower(CulturalExpression.term) == term).first():
        return jsonify({'message': f"La expresión '{term}' ya se encuentra registrada en el diccionario cultural."}), 400

    new_expr = CulturalExpression(
        term=term,
        meaning=meaning,
        example=example,
        category=category,
        safety_level=safety_level,
        can_use=can_use if safety_level != 'RESTRICTED' else False,
        can_explain=can_explain,
        context_notes=context_notes,
        active=True
    )

    try:
        db.session.add(new_expr)
        db.session.commit()

        # Auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="CULTURAL_EXPRESSION_CREATED",
            details=f"Expresión '{term}' creada con nivel {safety_level}."
        )

        return jsonify({
            'message': f"Expresión '{term}' registrada exitosamente en el Diccionario Cultural 🇬🇹.",
            'expression': new_expr.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error al crear expresión: {str(e)}"}), 500


@culture_bp.route('/expressions/<expression_id>', methods=['PUT'])
@token_required
@roles_accepted('superadmin')
def update_cultural_expression(current_user, expression_id):
    """
    Edita una expresión cultural existente (Solo SuperAdmin).
    """
    expr = CulturalExpression.query.get(expression_id)
    if not expr:
        return jsonify({'message': 'Expresión cultural no encontrada.'}), 404

    data = request.get_json() or {}

    if 'meaning' in data:
        expr.meaning = (data.get('meaning') or '').strip()
    if 'example' in data:
        expr.example = (data.get('example') or '').strip()
    if 'category' in data:
        expr.category = (data.get('category') or 'GUATEMALTEQUISMO').upper()
    if 'safety_level' in data:
        new_level = (data.get('safety_level') or 'ALLOWED').upper()
        if new_level in ['ALLOWED', 'EXPLAINABLE', 'RESTRICTED']:
            expr.safety_level = new_level
            if new_level == 'RESTRICTED':
                expr.can_use = False
    if 'can_use' in data:
        expr.can_use = bool(data.get('can_use')) if expr.safety_level != 'RESTRICTED' else False
    if 'can_explain' in data:
        expr.can_explain = bool(data.get('can_explain'))
    if 'context_notes' in data:
        expr.context_notes = (data.get('context_notes') or '').strip()
    if 'active' in data:
        expr.active = bool(data.get('active'))

    try:
        db.session.commit()

        # Auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="CULTURAL_EXPRESSION_UPDATED",
            details=f"Expresión '{expr.term}' actualizada (Nivel: {expr.safety_level}, Activa: {expr.active})."
        )

        return jsonify({
            'message': f"Expresión '{expr.term}' actualizada exitosamente.",
            'expression': expr.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error al actualizar expresión: {str(e)}"}), 500


@culture_bp.route('/expressions/<expression_id>', methods=['DELETE'])
@token_required
@roles_accepted('superadmin')
def delete_cultural_expression(current_user, expression_id):
    """
    Elimina o desactiva una expresión cultural (Solo SuperAdmin).
    """
    expr = CulturalExpression.query.get(expression_id)
    if not expr:
        return jsonify({'message': 'Expresión cultural no encontrada.'}), 404

    term_name = expr.term
    try:
        db.session.delete(expr)
        db.session.commit()

        # Auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="CULTURAL_EXPRESSION_DELETED",
            details=f"Expresión '{term_name}' eliminada del Diccionario Cultural."
        )

        return jsonify({'message': f"Expresión '{term_name}' eliminada exitosamente."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error al eliminar expresión: {str(e)}"}), 500


@culture_bp.route('/explain', methods=['POST'])
@token_required
def explain_cultural_term(current_user):
    """
    Endpoint para consultar la explicación contextualizada de un término guatemalteco.
    """
    data = request.get_json() or {}
    term = (data.get('term') or '').strip().lower()

    if not term:
        return jsonify({'message': 'Debes especificar el término a consultar.'}), 400

    expr = CulturalExpression.query.filter(
        db.func.lower(CulturalExpression.term) == term,
        CulturalExpression.active == True
    ).first()

    if not expr:
        return jsonify({
            'found': False,
            'message': f"El término '{term}' no está en el diccionario cultural o es un modismo no catalogado."
        }), 404

    explanation = CulturalDictionaryService.format_explanation_response(expr)
    return jsonify({
        'found': True,
        'term': expr.term,
        'safety_level': expr.safety_level,
        'explanation': explanation,
        'expression': expr.to_dict()
    }), 200
