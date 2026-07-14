import datetime
import jwt
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from app.models.institution import Institution
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role', 'miembro')  # 'miembro' o 'admin_institucion'
    institution_id = data.get('institution_id')
    institution_name = data.get('institution_name')  # Solo usado si se crea una nueva institución
    
    if not email or not password or not first_name or not last_name:
        return jsonify({'message': 'Faltan campos requeridos.'}), 400
        
    # Verificar si el usuario ya existe
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'El correo electrónico ya está registrado.'}), 400
        
    # Manejar institución
    selected_institution_id = None
    if role == 'admin_institucion' and institution_name:
        # Crear nueva institución para el administrador
        existing_inst = Institution.query.filter_by(name=institution_name).first()
        if existing_inst:
            selected_institution_id = existing_inst.id
        else:
            new_inst = Institution(name=institution_name, type=data.get('institution_type', 'educativa'))
            db.session.add(new_inst)
            db.session.commit()
            selected_institution_id = new_inst.id
    elif institution_id:
        # Miembro se registra a una institución existente
        inst = Institution.query.get(institution_id)
        if not inst:
            return jsonify({'message': 'La institución seleccionada no existe.'}), 400
        selected_institution_id = inst.id
    else:
        # Permitir registro sin institución si es superadmin (creado manualmente)
        if role != 'superadmin':
            return jsonify({'message': 'Se requiere seleccionar una institución.'}), 400
            
    # Crear usuario
    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role,
        institution_id=selected_institution_id
    )
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuario registrado exitosamente.', 'user': new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al registrar el usuario: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Correo y contraseña son requeridos.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Credenciales incorrectas.'}), 401
        
    # Generar JWT Token
    payload = {
        'user_id': str(user.id),
        'role': user.role,
        'institution_id': str(user.institution_id) if user.institution_id else None,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    
    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/institutions', methods=['GET'])
def get_institutions():
    """Ruta pública para listar instituciones en el formulario de registro"""
    institutions = Institution.query.all()
    return jsonify([inst.to_dict() for inst in institutions]), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    """Ruta protegida para obtener el perfil del usuario actual"""
    return jsonify(current_user.to_dict()), 200
