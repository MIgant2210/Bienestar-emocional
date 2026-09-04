import re
from datetime import datetime
from flask import Blueprint, request, jsonify
from app import db
from app.models.user_avatar import UserAvatar
from app.models.user import User
from app.utils.decorators import token_required
from app.utils.db_schema import ensure_user_avatar_schema

avatar_bp = Blueprint('avatar', __name__)

NAME_REGEX = re.compile(r"^.{2,80}$")

DEFAULT_AVATAR_CONFIG = {
    'skinTone': '#f0c4a0',
    'bodyType': 'promedio',      # 'delgado', 'promedio', 'atletico', 'curvilineo', 'robusto'
    'height': 'media',          # 'baja', 'media-baja', 'media', 'media-alta', 'alta'
    'hairStyle': 'curtains',    # 20+ estilos inclusivos
    'hairColor': '#3d2314',     # castaño oscuro
    'faceShape': 'oval',        # 'oval', 'round', 'square', 'heart'
    'eyes': 'friendly',         # 'friendly', 'wide', 'focused', 'calm'
    'eyeColor': '#2e1509',      # castaño, avellana, verde, azul, etc.
    'brows': 'natural',         # 'natural', 'thick', 'arched', 'soft'
    'expression': 'smile',      # 'smile', 'calm', 'serene', 'focused'
    'facialHair': 'none',       # 'none', 'stubble', 'trimmed_beard', 'full_beard', 'goatee', 'moustache'
    'freckles': False,
    'blush': True,
    'glasses': 'none',          # 'none', 'round', 'square', 'rimless', 'sunglasses_dark', 'sunglasses_color'
    'glassesColor': '#7c3aed',
    'topType': 'hoodie',        # 'hoodie', 'tshirt', 'shirt', 'jacket', 'sweater', 'polo', 'sport_top', 'blazer'
    'topColor': '#493362',      # púrpura EquilibrIA
    'bottomType': 'cargo',      # 'cargo', 'jeans', 'sweatpants', 'shorts', 'skirt', 'leggings'
    'bottomColor': '#bfa67a',   # khaki
    'shoesType': 'skate',       # 'skate', 'runners', 'boots', 'loafers', 'sandals'
    'shoesColor': '#18181b',
    'accessories': {
        'watch': True,
        'headphones': False,
        'earrings': False,
        'necklace': False,
        'beanie': False,
        'cap': False
    }
}

@avatar_bp.route('', methods=['GET'])
@token_required
def get_user_avatars(current_user):
    ensure_user_avatar_schema(db)
    
    avatars = UserAvatar.query.filter_by(user_id=current_user.id).order_by(UserAvatar.updated_at.desc()).all()
    
    # Si el usuario no tiene avatares aún, inicializar uno por defecto con su nombre
    if not avatars:
        default_name = f"Avatar de {current_user.first_name}" if current_user.first_name else "Mi Avatar"
        initial_avatar = UserAvatar(
            user_id=current_user.id,
            name=default_name[:50],
            config=current_user.avatar_config or DEFAULT_AVATAR_CONFIG,
            is_active=True
        )
        db.session.add(initial_avatar)
        current_user.avatar_name = initial_avatar.name
        current_user.avatar_config = initial_avatar.config
        db.session.commit()
        avatars = [initial_avatar]
        
    active_avatar = next((a for a in avatars if a.is_active), avatars[0])
    
    return jsonify({
        'active_avatar': active_avatar.to_dict(),
        'avatars': [a.to_dict() for a in avatars]
    }), 200

@avatar_bp.route('', methods=['POST'])
@token_required
def create_avatar(current_user):
    ensure_user_avatar_schema(db)
    data = request.get_json() or {}
    
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'message': 'El nombre del avatar es obligatorio.'}), 400
        
    if not NAME_REGEX.match(name):
        return jsonify({'message': 'El nombre del avatar debe tener entre 2 y 50 caracteres alfanuméricos válidos.'}), 400
        
    config = data.get('config')
    if not isinstance(config, dict):
        return jsonify({'message': 'La configuración del avatar debe ser un objeto JSON válido.'}), 400
        
    set_active = data.get('set_active', True)
    
    if set_active:
        UserAvatar.query.filter_by(user_id=current_user.id).update({'is_active': False})
        
    new_avatar = UserAvatar(
        user_id=current_user.id,
        name=name,
        config=config,
        is_active=set_active
    )
    db.session.add(new_avatar)
    
    if set_active:
        current_user.avatar_name = name
        current_user.avatar_config = config
        
    db.session.commit()
    
    return jsonify({
        'message': '¡Listo! Tu avatar ya está preparado para acompañarte en EquilibrIA. 💜',
        'avatar': new_avatar.to_dict()
    }), 201

@avatar_bp.route('/<string:avatar_id>', methods=['PUT'])
@token_required
def update_avatar(current_user, avatar_id):
    ensure_user_avatar_schema(db)
    import uuid as py_uuid
    try:
        val_uuid = py_uuid.UUID(str(avatar_id))
    except (ValueError, TypeError):
        return jsonify({'message': 'ID de avatar inválido.'}), 404
        
    avatar = UserAvatar.query.filter_by(id=val_uuid, user_id=current_user.id).first()
    if not avatar:
        return jsonify({'message': 'Avatar no encontrado o sin permisos.'}), 404
        
    data = request.get_json() or {}
    name = data.get('name')
    if name is not None:
        name = name.strip()
        if not name or not NAME_REGEX.match(name):
            return jsonify({'message': 'El nombre del avatar debe tener entre 2 y 50 caracteres alfanuméricos válidos.'}), 400
        avatar.name = name
        
    config = data.get('config')
    if config is not None:
        if not isinstance(config, dict):
            return jsonify({'message': 'La configuración debe ser un objeto JSON válido.'}), 400
        avatar.config = config
        
    set_active = data.get('set_active')
    if set_active is True:
        UserAvatar.query.filter_by(user_id=current_user.id).update({'is_active': False})
        avatar.is_active = True
        
    if avatar.is_active:
        current_user.avatar_name = avatar.name
        current_user.avatar_config = avatar.config
        
    avatar.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Avatar actualizado correctamente. 💜',
        'avatar': avatar.to_dict()
    }), 200

@avatar_bp.route('/<string:avatar_id>/activate', methods=['POST'])
@token_required
def activate_avatar(current_user, avatar_id):
    ensure_user_avatar_schema(db)
    import uuid as py_uuid
    try:
        val_uuid = py_uuid.UUID(str(avatar_id))
    except (ValueError, TypeError):
        return jsonify({'message': 'ID de avatar inválido.'}), 404
        
    avatar = UserAvatar.query.filter_by(id=val_uuid, user_id=current_user.id).first()
    if not avatar:
        return jsonify({'message': 'Avatar no encontrado o sin permisos.'}), 404
        
    UserAvatar.query.filter_by(user_id=current_user.id).update({'is_active': False})
    avatar.is_active = True
    current_user.avatar_name = avatar.name
    current_user.avatar_config = avatar.config
    
    db.session.commit()
    
    return jsonify({
        'message': f'Ahora te acompaña {avatar.name} 💜',
        'avatar': avatar.to_dict()
    }), 200

@avatar_bp.route('/<string:avatar_id>', methods=['DELETE'])
@token_required
def delete_avatar(current_user, avatar_id):
    ensure_user_avatar_schema(db)
    import uuid as py_uuid
    try:
        val_uuid = py_uuid.UUID(str(avatar_id))
    except (ValueError, TypeError):
        return jsonify({'message': 'ID de avatar inválido.'}), 404
        
    avatar = UserAvatar.query.filter_by(id=val_uuid, user_id=current_user.id).first()
    if not avatar:
        return jsonify({'message': 'Avatar no encontrado o sin permisos.'}), 404
        
    was_active = avatar.is_active
    db.session.delete(avatar)
    db.session.flush()
    
    remaining = UserAvatar.query.filter_by(user_id=current_user.id).order_by(UserAvatar.updated_at.desc()).all()
    if not remaining:
        # Si eliminó el único, recrear uno predeterminado
        new_default = UserAvatar(
            user_id=current_user.id,
            name=f"Avatar de {current_user.first_name}"[:50] if current_user.first_name else "Mi Avatar",
            config=DEFAULT_AVATAR_CONFIG,
            is_active=True
        )
        db.session.add(new_default)
        current_user.avatar_name = new_default.name
        current_user.avatar_config = new_default.config
        active = new_default
    elif was_active:
        remaining[0].is_active = True
        current_user.avatar_name = remaining[0].name
        current_user.avatar_config = remaining[0].config
        active = remaining[0]
    else:
        active = next((a for a in remaining if a.is_active), remaining[0])
        
    db.session.commit()
    
    return jsonify({
        'message': 'Avatar eliminado correctamente.',
        'active_avatar': active.to_dict(),
        'avatars': [a.to_dict() for a in UserAvatar.query.filter_by(user_id=current_user.id).all()]
    }), 200

@avatar_bp.route('/reset', methods=['POST'])
@token_required
def reset_avatar(current_user):
    ensure_user_avatar_schema(db)
    active_avatar = UserAvatar.query.filter_by(user_id=current_user.id, is_active=True).first()
    default_name = f"Avatar de {current_user.first_name}" if current_user.first_name else "Mi Avatar"
    
    if active_avatar:
        active_avatar.name = default_name[:50]
        active_avatar.config = DEFAULT_AVATAR_CONFIG
        active_avatar.updated_at = datetime.utcnow()
    else:
        active_avatar = UserAvatar(
            user_id=current_user.id,
            name=default_name[:50],
            config=DEFAULT_AVATAR_CONFIG,
            is_active=True
        )
        db.session.add(active_avatar)
        
    current_user.avatar_name = active_avatar.name
    current_user.avatar_config = active_avatar.config
    db.session.commit()
    
    return jsonify({
        'message': 'Avatar restablecido a los valores predeterminados. 💜',
        'avatar': active_avatar.to_dict()
    }), 200
