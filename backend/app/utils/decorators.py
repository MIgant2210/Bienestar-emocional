import jwt
from flask import request, jsonify, current_app
from functools import wraps
from app.models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # El token JWT se envía en el encabezado Authorization como 'Bearer <token>'
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Formato de token inválido. Use Bearer <token>'}), 401
                
        if not token:
            return jsonify({'message': 'Token de acceso faltante.'}), 401
            
        try:
            # Decodificar el token usando la clave secreta
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Usuario no encontrado o inactivo.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'El token ha expirado. Inicie sesión nuevamente.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido.'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

def roles_accepted(*roles):
    """
    Decorador para restringir el acceso a ciertos roles.
    Debe usarse DESPUÉS de @token_required.
    Ejemplo:
        @token_required
        @roles_accepted('superadmin', 'admin_institucion')
        def mi_ruta(current_user):
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in roles:
                return jsonify({'message': 'No tiene permisos para realizar esta acción.'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
