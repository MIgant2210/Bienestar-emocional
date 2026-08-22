import jwt
from flask import request, jsonify, current_app
from functools import wraps
from sqlalchemy.orm import joinedload
from app.models.user import User
from app.services.audit_service import AuditService

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
            user_id = data.get('user_id')
            if not user_id:
                return jsonify({'message': 'Token inválido sin identidad.'}), 401

            # Eager load institution y department_rel para evitar 2 roundtrips N+1 en cada request
            current_user = User.query.options(
                joinedload(User.institution),
                joinedload(User.department_rel)
            ).filter(User.id == user_id).first()

            if not current_user:
                return jsonify({'message': 'Usuario no encontrado o inactivo.'}), 401
                
            # Validar estado de la cuenta (ACTIVO / ACTIVE)
            if (current_user.status or '').upper() not in ['ACTIVE', 'ACTIVO']:
                status_labels = {
                    'PENDING': 'pendiente de verificación y aprobación',
                    'PENDIENTE': 'pendiente de verificación y aprobación',
                    'SUSPENDED': 'bloqueada temporalmente',
                    'BLOQUEADO': 'bloqueada temporalmente',
                    'BLOCKED': 'bloqueada temporalmente',
                    'REJECTED': 'rechazada',
                    'RECHAZADO': 'rechazada',
                    'INACTIVE': 'desactivada'
                }
                label = status_labels.get((current_user.status or '').upper(), current_user.status)
                return jsonify({'message': f'Acceso denegado: Su cuenta se encuentra {label}.'}), 403
                
            # Validar estado de la institución si no es superadmin
            if current_user.role != 'superadmin' and current_user.institution:
                if current_user.institution.status == 'SUSPENDED':
                    return jsonify({'message': 'Acceso restringido: Su institución se encuentra suspendida temporalmente.'}), 403
                if current_user.institution.status == 'INACTIVE':
                    return jsonify({'message': 'Acceso restringido: Su institución se encuentra inactiva.'}), 403
                    
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

def action_permission_required(action):
    """
    Decorador que valida un permiso granular específico.
    Debe usarse DESPUÉS de @token_required.
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            from app.utils.rbac import has_permission
            if not has_permission(current_user.role, action):
                _log_denied_access(current_user, f"Intento no autorizado para la acción '{action}' en {request.path}")
                return jsonify({'message': f"Acceso denegado: No cuenta con el permiso '{action}'."}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

def _log_denied_access(user, details):
    """
    Registra intentos de acceso no autorizados (403) en la bitácora de auditoría mediante AuditService.
    """
    try:
        ip = request.headers.get('X-Forwarded-For', request.remote_addr or '127.0.0.1')
        if ',' in ip:
            ip = ip.split(',')[0].strip()
        AuditService.log_action(
            user_id=user.id if user else None,
            action="ACCESO_DENEGADO_403",
            details=details,
            ip_address=ip
        )
    except Exception:
        pass
