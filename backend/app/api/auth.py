import re
import time
import secrets
import datetime
import jwt
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from app import db
from app.models.user import User
from app.models.institution import Institution
from app.models.invitation import InvitationCode
from app.models.verification_token import EmailVerificationToken
from app.models.consent import Consent
from app.services.audit_service import AuditService
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

# Control en memoria de intentos de registro para Rate Limiting (máximo 10 por IP en 10 minutos)
_REGISTER_ATTEMPTS = {}

def check_rate_limit(ip_address, max_attempts=10, window_seconds=600):
    now = time.time()
    attempts = _REGISTER_ATTEMPTS.get(ip_address, [])
    # Limpiar intentos fuera de la ventana
    attempts = [t for t in attempts if now - t < window_seconds]
    if len(attempts) >= max_attempts:
        _REGISTER_ATTEMPTS[ip_address] = attempts
        return False
    attempts.append(now)
    _REGISTER_ATTEMPTS[ip_address] = attempts
    return True

@auth_bp.route('/reset-rate-limit', methods=['POST'])
def reset_rate_limit():
    global _REGISTER_ATTEMPTS
    _REGISTER_ATTEMPTS.clear()
    return jsonify({'message': 'Rate limit reset successful.'}), 200

# Validadores Regex de Seguridad
NAME_REGEX = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' -]{2,50}$")
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
SPECIAL_CHAR_REGEX = re.compile(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]")

def validate_password_complexity(password):
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres (recomendado 10+)."
    if not re.search(r"[A-Z]", password):
        return False, "La contraseña debe incluir al menos una letra mayúscula."
    if not re.search(r"[a-z]", password):
        return False, "La contraseña debe incluir al menos una letra minúscula."
    if not re.search(r"[0-9]", password):
        return False, "La contraseña debe incluir al menos un número."
    if not SPECIAL_CHAR_REGEX.search(password):
        return False, "La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)."
    return True, "Contraseña válida."

@auth_bp.route('/invitation-info', methods=['GET'])
def get_invitation_info():
    """
    Endpoint público para validar el código de invitación en tiempo real en la UI
    y retornar el nombre de la institución sin exponer IDs internos.
    """
    code_str = request.args.get('code', '').strip().upper()
    if not code_str:
        return jsonify({'valid': False, 'message': 'Código no proporcionado.'}), 400
        
    inv = InvitationCode.query.filter_by(code=code_str).first()
    if not inv:
        return jsonify({'valid': False, 'message': 'El código de invitación no existe o es inválido.'}), 404
        
    is_valid, msg = inv.is_valid()
    if not is_valid:
        return jsonify({'valid': False, 'message': msg}), 400
        
    return jsonify({
        'valid': True,
        'code': inv.code,
        'institution_name': inv.institution.name if inv.institution else 'Institución Asociada',
        'department': inv.department or 'General'
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr or '127.0.0.1')
    if ',' in ip_address:
        ip_address = ip_address.split(',')[0].strip()

    # 1. Rate Limiting (Protección contra abusos y registros automatizados)
    if not check_rate_limit(ip_address, max_attempts=40, window_seconds=600):
        return jsonify({
            'message': 'Has superado el límite de intentos de registro. Por favor espera unos minutos antes de volver a intentarlo.'
        }), 429

    # 2. Extracción Estricta de Campos (Prevención de Mass Assignment)
    data = request.get_json(silent=True) or {}
    
    first_name = (data.get('first_name') or '').strip()
    last_name = (data.get('last_name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    password_confirm = data.get('password_confirm') or ''
    invitation_code = (data.get('invitation_code') or '').strip().upper()
    terms_accepted = data.get('terms_accepted', False)

    # 3. Validación de Nombre y Apellido
    if not first_name or not last_name:
        return jsonify({'message': 'El nombre y apellido son obligatorios.'}), 400

    if not NAME_REGEX.match(first_name):
        return jsonify({'message': 'El nombre debe tener entre 2 y 50 caracteres y solo contener letras, tildes, guiones o apóstrofes.'}), 400

    if not NAME_REGEX.match(last_name):
        return jsonify({'message': 'El apellido debe tener entre 2 y 50 caracteres y solo contener letras, tildes, guiones o apóstrofes.'}), 400

    # 4. Validación de Correo Electrónico
    if not email or not EMAIL_REGEX.match(email) or len(email) > 120:
        return jsonify({'message': 'Por favor ingresa un correo electrónico válido con formato correcto.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'El correo electrónico ya está registrado en la plataforma.'}), 400

    # 5. Validación de Contraseña y Confirmación
    if not password:
        return jsonify({'message': 'La contraseña es obligatoria.'}), 400

    if password_confirm is not None and password_confirm != '':
        if password != password_confirm:
            return jsonify({'message': 'Las contraseñas ingresadas no coinciden.'}), 400

    is_pass_valid, pass_msg = validate_password_complexity(password)
    if not is_pass_valid:
        return jsonify({'message': pass_msg}), 400

    # 6. Validación de Código de Invitación Institucional
    if not invitation_code:
        return jsonify({'message': 'Se requiere un código de invitación institucional válido para registrarse.'}), 400

    inv = InvitationCode.query.filter_by(code=invitation_code).first()
    if not inv:
        return jsonify({'message': 'El código de invitación ingresado no existe.'}), 400

    is_inv_valid, inv_msg = inv.is_valid()
    if not is_inv_valid:
        return jsonify({'message': f'Código no disponible: {inv_msg}'}), 400

    resolved_institution = Institution.query.get(inv.institution_id)
    if not resolved_institution:
        return jsonify({'message': 'La institución asociada al código de invitación no se encuentra activa.'}), 400

    # Validación de dominio institucional si la institución lo requiere
    if resolved_institution.require_institutional_domain and resolved_institution.allowed_domains:
        allowed_list = [d.strip().lower() for d in resolved_institution.allowed_domains.split(',') if d.strip()]
        email_domain = email.split('@')[-1].lower() if '@' in email else ''
        if allowed_list and email_domain not in allowed_list:
            return jsonify({
                'message': f'El correo electrónico no pertenece a los dominios autorizados por la institución ({resolved_institution.allowed_domains}).'
            }), 400

    resolved_dept = inv.department or 'General'

    # 7. Validación de Consentimiento
    if not terms_accepted:
        return jsonify({'message': 'Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para crear tu cuenta.'}), 400

    # 8. Creación de Usuario con Rol MIEMBRO y Estado PENDIENTE (Aprobación requerida)
    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        role='miembro',  # SIEMPRE miembro / colaborador en registro público
        department=resolved_dept,
        institution_id=resolved_institution.id,
        status='PENDIENTE',  # Requiere aprobación del administrador
        email_verified=False
    )
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.flush()  # Obtener el UUID asignado a new_user

        # Incrementar contador de uso del código de invitación
        inv.used_count += 1

        # Registrar Consentimientos Informados en la base de datos
        consent_terms = Consent(
            user_id=new_user.id,
            institution_id=resolved_institution.id,
            consent_type='terms_and_conditions',
            status='accepted',
            version='v1.0',
            accepted_at=datetime.datetime.utcnow()
        )
        consent_privacy = Consent(
            user_id=new_user.id,
            institution_id=resolved_institution.id,
            consent_type='privacy_notice',
            status='accepted',
            version='v1.0',
            accepted_at=datetime.datetime.utcnow()
        )
        consent_platform = Consent(
            user_id=new_user.id,
            institution_id=resolved_institution.id,
            consent_type='platform_usage',
            status='accepted',
            version='v1.0',
            accepted_at=datetime.datetime.utcnow()
        )
        db.session.add_all([consent_terms, consent_privacy, consent_platform])

        db.session.commit()

        # Registrar en Auditoría
        AuditService.log_action(
            user_id=new_user.id,
            action="USER_REGISTERED",
            details=f"Usuario registrado en '{resolved_institution.name}' con código '{inv.code}'. Estado inicial: PENDIENTE.",
            ip_address=ip_address
        )

        return jsonify({
            'message': 'Tu cuenta fue registrada exitosamente. Tu acceso se encuentra en estado PENDIENTE de revisión y aprobación por el Administrador de tu institución.',
            'status': 'PENDIENTE',
            'user': new_user.to_dict()
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El correo electrónico ya se encuentra registrado o hubo un conflicto concurrente.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Ocurrió un error interno al procesar el registro. Por favor intenta de nuevo más tarde.'}), 500

@auth_bp.route('/verify-email', methods=['POST', 'GET'])
def verify_email():
    """
    Verifica el token de correo, activa la cuenta y marca email_verified = True.
    """
    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr or '127.0.0.1')
    if ',' in ip_address:
        ip_address = ip_address.split(',')[0].strip()

    if request.method == 'GET':
        token = request.args.get('token', '').strip()
    else:
        data = request.get_json(silent=True) or {}
        token = (data.get('token') or request.args.get('token', '')).strip()

    if not token:
        return jsonify({'message': 'El token de verificación es requerido.'}), 400

    token_hash = EmailVerificationToken.hash_token(token)
    token_entry = EmailVerificationToken.query.filter_by(token_hash=token_hash).first()

    if not token_entry:
        return jsonify({'message': 'El enlace de verificación no es válido o ha expirado.'}), 400

    is_valid, msg = token_entry.is_valid()
    if not is_valid:
        return jsonify({'message': msg}), 400

    user = User.query.get(token_entry.user_id)
    if not user:
        return jsonify({'message': 'El usuario asociado a este token no existe.'}), 404

    # Marcar token como utilizado
    token_entry.used_at = datetime.datetime.utcnow()
    
    # Activar cuenta del usuario
    user.email_verified = True
    user.email_verified_at = datetime.datetime.utcnow()
    user.status = 'ACTIVE'

    try:
        db.session.commit()

        AuditService.log_action(
            user_id=user.id,
            action="EMAIL_VERIFIED",
            details=f"Correo {user.email} verificado satisfactoriamente.",
            ip_address=ip_address
        )
        AuditService.log_action(
            user_id=user.id,
            action="ACCOUNT_ACTIVATED",
            details="Cuenta de usuario activada a estado ACTIVE.",
            ip_address=ip_address
        )

        return jsonify({
            'message': '¡Correo verificado y cuenta activada exitosamente! Ya puedes iniciar sesión con tus credenciales.',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al activar la cuenta.'}), 500

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email_by_path(token):
    """
    Ruta alternativa directa para links de correo electrónico.
    """
    token_str = token.strip()
    token_hash = EmailVerificationToken.hash_token(token_str)
    token_entry = EmailVerificationToken.query.filter_by(token_hash=token_hash).first()

    if not token_entry:
        return jsonify({'message': 'El enlace de verificación no es válido.'}), 400

    is_valid, msg = token_entry.is_valid()
    if not is_valid:
        return jsonify({'message': msg}), 400

    user = User.query.get(token_entry.user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404

    token_entry.used_at = datetime.datetime.utcnow()
    user.email_verified = True
    user.email_verified_at = datetime.datetime.utcnow()
    user.status = 'ACTIVE'

    try:
        db.session.commit()
        return jsonify({
            'message': '¡Correo verificado y cuenta activada exitosamente! Ya puedes iniciar sesión con tus credenciales.',
            'user': user.to_dict()
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({'message': 'Error al activar la cuenta.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr or '127.0.0.1')
    if ',' in ip_address:
        ip_address = ip_address.split(',')[0].strip()

    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    
    if not email or not password:
        return jsonify({'message': 'Correo y contraseña son requeridos.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Credenciales incorrectas.'}), 401
        
    # Validar Estado de la Cuenta
    user_status = (user.status or 'ACTIVO').upper()
    if user_status in ['PENDIENTE', 'PENDING']:
        return jsonify({
            'message': 'Tu cuenta se encuentra en estado PENDIENTE de revisión y aprobación por la administración de tu institución.',
            'status': 'PENDIENTE'
        }), 403
    if user_status in ['BLOQUEADO', 'BLOCKED', 'SUSPENDED']:
        return jsonify({
            'message': 'Tu cuenta ha sido bloqueada temporalmente por la administración.',
            'status': 'BLOQUEADO'
        }), 403
    if user_status in ['RECHAZADO', 'REJECTED']:
        return jsonify({
            'message': 'Tu solicitud de registro fue rechazada por la administración de tu institución.',
            'status': 'RECHAZADO'
        }), 403

    # Validar Estado de la Institución si no es superadmin
    if user.role != 'superadmin' and user.institution:
        if user.institution.status == 'SUSPENDED':
            return jsonify({
                'message': f'La institución "{user.institution.name}" se encuentra suspendida temporalmente.',
                'status': 'INSTITUTION_SUSPENDED'
            }), 403
        if user.institution.status == 'INACTIVE':
            return jsonify({
                'message': f'La institución "{user.institution.name}" se encuentra inactiva.',
                'status': 'INSTITUTION_INACTIVE'
            }), 403

    # Actualizar último acceso
    user.last_login_at = datetime.datetime.utcnow()
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()

    # Generar JWT Token solo para cuentas ACTIVE
    payload = {
        'user_id': str(user.id),
        'role': user.role,
        'institution_id': str(user.institution_id) if user.institution_id else None,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    
    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    # Registrar inicio de sesión en auditoría
    try:
        AuditService.log_action(
            user_id=user.id,
            action="LOGIN_SUCCESS",
            details=f"Inicio de sesión exitoso (Rol: {user.role}, Depto: {user.department})",
            ip_address=ip_address
        )
    except Exception:
        pass

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/institutions', methods=['GET'])
def get_institutions():
    """Ruta pública para listar instituciones en el formulario de registro"""
    institutions = Institution.query.order_by(Institution.name.asc()).all()
    return jsonify([inst.to_dict() for inst in institutions]), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    """Ruta protegida para obtener el perfil del usuario actual"""
    return jsonify(current_user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Permite al usuario modificar sus datos personales permitidos (nombre, apellido).
    No permite modificar rol, institución ni permisos.
    """
    data = request.get_json(silent=True) or {}
    first_name = (data.get('first_name') or '').strip()
    last_name = (data.get('last_name') or '').strip()
    
    if not first_name or not last_name:
        return jsonify({'message': 'Nombre y apellido son requeridos.'}), 400

    if not NAME_REGEX.match(first_name) or not NAME_REGEX.match(last_name):
        return jsonify({'message': 'El nombre y apellido deben tener entre 2 y 50 caracteres válidos.'}), 400
        
    current_user.first_name = first_name
    current_user.last_name = last_name
    
    try:
        db.session.commit()
        AuditService.log_action(
            user_id=current_user.id,
            action="PERFIL_ACTUALIZADO",
            details=f"Perfil personal actualizado ({current_user.first_name} {current_user.last_name})",
            ip_address=request.remote_addr
        )
        return jsonify({
            'message': 'Perfil actualizado exitosamente.',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el perfil.'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """
    Permite al usuario cambiar su contraseña validando la contraseña actual y complejidad.
    """
    data = request.get_json(silent=True) or {}
    current_password = data.get('current_password') or ''
    new_password = data.get('new_password') or ''
    
    if not current_password or not new_password:
        return jsonify({'message': 'La contraseña actual y la nueva contraseña son requeridas.'}), 400
        
    if not current_user.check_password(current_password):
        return jsonify({'message': 'La contraseña actual ingresada es incorrecta.'}), 400

    is_valid, msg = validate_password_complexity(new_password)
    if not is_valid:
        return jsonify({'message': msg}), 400
        
    current_user.set_password(new_password)
    
    try:
        db.session.commit()
        AuditService.log_action(
            user_id=current_user.id,
            action="CAMBIO_CONTRASENA",
            details="Contraseña de cuenta modificada exitosamente.",
            ip_address=request.remote_addr
        )
        return jsonify({'message': 'Contraseña modificada exitosamente.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al cambiar la contraseña.'}), 500

@auth_bp.route('/reset-password-info', methods=['GET'])
def get_reset_password_info():
    """
    Endpoint público para verificar si un enlace de restablecimiento es válido.
    """
    token_str = request.args.get('token', '').strip()
    if not token_str:
        return jsonify({'valid': False, 'message': 'Token no proporcionado.'}), 400

    token_hash = EmailVerificationToken.hash_token(token_str)
    token_record = EmailVerificationToken.query.filter_by(token_hash=token_hash).first()
    if not token_record:
        return jsonify({'valid': False, 'message': 'El enlace de restablecimiento no existe o es inválido.'}), 404

    is_valid, msg = token_record.is_valid()
    if not is_valid:
        return jsonify({'valid': False, 'message': msg}), 400

    user = token_record.user
    if not user:
        return jsonify({'valid': False, 'message': 'Usuario asociado no encontrado.'}), 404

    return jsonify({
        'valid': True,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'institution_name': user.institution.name if user.institution else 'EquilibrIA'
    }), 200

@auth_bp.route('/reset-password-confirm', methods=['POST'])
def confirm_reset_password():
    """
    Endpoint público para aplicar la nueva contraseña usando el token temporal.
    """
    data = request.get_json(silent=True) or {}
    token_str = (data.get('token') or '').strip()
    new_password = (data.get('new_password') or '').strip()
    confirm_password = (data.get('confirm_password') or '').strip()

    if not token_str or not new_password:
        return jsonify({'message': 'Token y nueva contraseña son requeridos.'}), 400

    if new_password != confirm_password:
        return jsonify({'message': 'Las contraseñas ingresadas no coinciden.'}), 400

    is_valid_pass, pass_msg = validate_password_complexity(new_password)
    if not is_valid_pass:
        return jsonify({'message': pass_msg}), 400

    token_hash = EmailVerificationToken.hash_token(token_str)
    token_record = EmailVerificationToken.query.filter_by(token_hash=token_hash).first()
    if not token_record:
        return jsonify({'message': 'El enlace de restablecimiento es inválido o no existe.'}), 404

    is_valid, token_msg = token_record.is_valid()
    if not is_valid:
        return jsonify({'message': token_msg}), 400

    user = token_record.user
    if not user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404

    try:
        user.set_password(new_password)
        token_record.used_at = datetime.datetime.utcnow()
        db.session.commit()

        AuditService.log_action(
            user_id=user.id,
            action="PASSWORD_RESET_COMPLETED",
            details=f"Restablecimiento de contraseña completado exitosamente para '{user.email}'.",
            ip_address=request.remote_addr
        )

        return jsonify({
            'message': '¡Tu contraseña ha sido restablecida exitosamente! Ya puedes iniciar sesión con tu nueva clave.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar la contraseña.'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Solicitud pública de recuperación de contraseña.
    Respuesta genérica segura para prevenir enumeración de cuentas.
    """
    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr or '127.0.0.1')
    if ',' in ip_address:
        ip_address = ip_address.split(',')[0].strip()

    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({'message': 'Por favor ingresa un correo electrónico válido.'}), 400

    user = User.query.filter_by(email=email).first()
    if user and (user.status or '').upper() in ['ACTIVE', 'ACTIVO']:
        try:
            AuditService.log_action(
                user_id=user.id,
                action="RECOVERY_REQUESTED",
                details=f"Solicitud pública de recuperación de contraseña registrada para '{user.email}'.",
                ip_address=ip_address
            )
        except Exception:
            pass

    return jsonify({
        'message': 'Si la cuenta puede realizar una recuperación, la solicitud ha sido registrada en el sistema.'
    }), 200


@auth_bp.route('/preferences', methods=['GET'])
@token_required
def get_user_preferences(current_user):
    """
    Retorna las preferencias del usuario relativas a IA y comunicación cultural.
    """
    return jsonify({
        'ai_communication_style': current_user.ai_communication_style or 'guatemalteco',
        'use_guatemalan_expressions': True if current_user.use_guatemalan_expressions is None else bool(current_user.use_guatemalan_expressions)
    }), 200


@auth_bp.route('/preferences', methods=['PUT'])
@token_required
def update_user_preferences(current_user):
    """
    Actualiza las preferencias del usuario para el asistente de IA.
    """
    data = request.get_json() or {}
    
    if 'ai_communication_style' in data:
        style = (data.get('ai_communication_style') or 'guatemalteco').lower()
        if style in ['formal', 'cercano', 'guatemalteco']:
            current_user.ai_communication_style = style
            
    if 'use_guatemalan_expressions' in data:
        current_user.use_guatemalan_expressions = bool(data.get('use_guatemalan_expressions'))
        
    try:
        db.session.commit()
        
        # Auditoría
        AuditService.log_action(
            user_id=current_user.id,
            action="AI_PREFERENCES_UPDATED",
            details=f"Preferencias de IA actualizadas: Estilo={current_user.ai_communication_style}, Modismos={current_user.use_guatemalan_expressions}."
        )
        
        return jsonify({
            'message': 'Preferencias de IA actualizadas exitosamente.',
            'ai_communication_style': current_user.ai_communication_style,
            'use_guatemalan_expressions': current_user.use_guatemalan_expressions
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al guardar preferencias: {str(e)}'}), 500


