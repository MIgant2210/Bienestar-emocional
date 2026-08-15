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
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in roles:
                _log_denied_access(current_user, f"Intento no autorizado a {request.path} (requiere roles {roles})")
                return jsonify({'message': 'Acceso denegado: No cuenta con el rol requerido.'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

def permission_required(module):
    """
    Decorador que valida el acceso a un módulo específico del sistema según la Matriz RBAC.
    Debe usarse DESPUÉS de @token_required.
    Ejemplo:
        @token_required
        @permission_required('reports')
        def mi_reporte(current_user):
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            from app.utils.rbac import has_module_access
            if not has_module_access(current_user.role, module):
                _log_denied_access(current_user, f"Intento no autorizado al módulo '{module}' en {request.path}")
                return jsonify({'message': f"Acceso denegado: Su rol no tiene permisos para el módulo '{module}'."}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

def _log_denied_access(user, details):
    """
    Registra intentos de acceso no autorizados (403) en la bitácora de auditoría.
    """
    try:
        from app import db
        from app.models.audit_log import AuditLog
        log = AuditLog(
            user_id=user.id,
            action="ACCESO_DENEGADO_403",
            details=details,
            institution_id=user.institution_id
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        pass
