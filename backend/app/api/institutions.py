import secrets
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy import func, or_
from app import db
from app.models.reflection import Reflection
from app.models.user import User
from app.models.institution import Institution
from app.models.department import Department
from app.models.invitation import InvitationCode
from app.models.verification_token import EmailVerificationToken
from app.services.audit_service import AuditService
from app.utils.decorators import token_required, roles_accepted, permission_required, action_permission_required
from app.utils.rbac import can_manage_roles, can_manage_institutions, can_manage_departments, has_permission

institutions_bp = Blueprint('institutions', __name__)

def _get_client_ip():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or '127.0.0.1')
    if ',' in ip:
        ip = ip.split(',')[0].strip()
    return ip

# ==============================================================================
# 1. INSTITUCIONES (CRUD, AISLAMIENTO Y ESTADOS)
# ==============================================================================

@institutions_bp.route('', methods=['GET'])
def list_public_institutions():
    """
    Ruta pública para selector de instituciones (registro / consultas generales).
    Solo expone instituciones activas.
    """
    institutions = Institution.query.filter_by(status='ACTIVE').order_by(Institution.name.asc()).all()
    return jsonify([inst.to_dict() for inst in institutions]), 200

@institutions_bp.route('/all', methods=['GET'])
@token_required
@permission_required('institutions')
def get_all_institutions(current_user):
    """
    Retorna la lista de instituciones según el rol:
    - Superadmin: Todas las instituciones del sistema.
    - Admin Institucional: Únicamente su institución vinculada.
    """
    if current_user.role == 'superadmin':
        institutions = Institution.query.order_by(Institution.created_at.desc()).all()
    else:
        if not current_user.institution_id:
            return jsonify([]), 200
        institutions = Institution.query.filter_by(id=current_user.institution_id).all()
        
    result = []
    for inst in institutions:
        inst_dict = inst.to_dict()
        inst_users = User.query.filter_by(institution_id=inst.id).all()
        inst_depts = Department.query.filter_by(institution_id=inst.id).order_by(Department.name.asc()).all()
        
        inst_dict['total_members'] = len(inst_users)
        inst_dict['active_members'] = sum(1 for u in inst_users if u.status == 'ACTIVE')
        inst_dict['pending_members'] = sum(1 for u in inst_users if u.status == 'PENDING')
        inst_dict['suspended_members'] = sum(1 for u in inst_users if u.status == 'SUSPENDED')
        inst_dict['total_departments'] = len(inst_depts)
        inst_dict['departments'] = [d.name for d in inst_depts if d.is_active]
        inst_dict['departments_detail'] = [d.to_dict() for d in inst_depts]
        result.append(inst_dict)
        
    return jsonify(result), 200

@institutions_bp.route('/<uuid:inst_id>', methods=['GET'])
@token_required
@permission_required('institutions')
def get_institution_detail(current_user, inst_id):
    """
    Obtiene el detalle completo de una institución.
    Aislamiento: Admin Institucional solo puede consultar su propia institución.
    """
    if current_user.role != 'superadmin' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'Acceso denegado: No tiene permisos para consultar información de otra institución.'}), 403

    inst = Institution.query.get(inst_id)
    if not inst:
        return jsonify({'message': 'Institución no encontrada.'}), 404
        
    inst_dict = inst.to_dict()
    inst_users = User.query.filter_by(institution_id=inst.id).all()
    inst_depts = Department.query.filter_by(institution_id=inst.id).all()
    
    inst_dict['total_members'] = len(inst_users)
    inst_dict['active_members'] = sum(1 for u in inst_users if u.status == 'ACTIVE')
    inst_dict['pending_members'] = sum(1 for u in inst_users if u.status == 'PENDING')
    inst_dict['suspended_members'] = sum(1 for u in inst_users if u.status == 'SUSPENDED')
    inst_dict['total_departments'] = len(inst_depts)
    inst_dict['departments_detail'] = [d.to_dict() for d in inst_depts]
    
    return jsonify(inst_dict), 200

@institutions_bp.route('', methods=['POST'])
@token_required
def create_institution(current_user):
    """
    Crea una nueva institución.
    RESTRICCIÓN CRÍTICA: Exclusivo para SuperAdmin.
    """
    if current_user.role != 'superadmin':
        return jsonify({'message': 'Acceso denegado: La creación de instituciones está reservada exclusivamente para SuperAdmin.'}), 403

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    inst_type = (data.get('type') or 'laboral').strip().lower()
    description = (data.get('description') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip()
    country = (data.get('country') or 'Guatemala').strip()
    city = (data.get('city') or '').strip()
    admin_user_id = data.get('admin_user_id')
    
    # 1. Validaciones
    if not name or len(name) < 3:
        return jsonify({'message': 'El nombre de la institución es obligatorio y debe tener al menos 3 caracteres.'}), 400
        
    if len(name) > 150:
        return jsonify({'message': 'El nombre de la institución no puede exceder 150 caracteres.'}), 400
        
    valid_types = ['educativa', 'laboral', 'salud', 'comunitaria']
    if inst_type not in valid_types:
        return jsonify({'message': f'Tipo de institución inválido. Opciones: {", ".join(valid_types)}'}), 400
        
    existing = Institution.query.filter(func.lower(Institution.name) == name.lower()).first()
    if existing:
        return jsonify({'message': f'Ya existe una institución registrada con el nombre "{name}".'}), 400

    # 2. Generar Código Institucional Seguro y Único
    type_code = 'EDU' if 'edu' in inst_type else 'LAB' if 'lab' in inst_type else 'MED' if 'salud' in inst_type else 'ORG'
    while True:
        rand_hex = secrets.token_hex(3).upper()
        generated_code = f'EQUI-{type_code}-{rand_hex}'
        if not Institution.query.filter_by(code=generated_code).first():
            break

    # 3. Crear Institución
    inst = Institution(
        code=generated_code,
        name=name,
        type=inst_type,
        description=description,
        email=email or None,
        phone=phone or None,
        country=country or 'Guatemala',
        city=city or None,
        status='ACTIVE',
        allowed_domains=data.get('allowed_domains', '').strip().lower() or None,
        require_institutional_domain=bool(data.get('require_institutional_domain', False)),
        admin_user_id=admin_user_id or None
    )
    db.session.add(inst)
    db.session.flush()

    # 4. Crear departamentos base automáticamente
    default_departments = [
        ('General', 'GEN', 'Área general y transversal de la institución'),
        ('Tecnología', 'TEC', 'Sistemas, infraestructura y desarrollo digital'),
        ('Recursos Humanos', 'RRHH', 'Gestión de talento, bienestar y clima laboral'),
        ('Psicología y Salud', 'SAL', 'Acompañamiento clínico, salud mental y prevención')
    ]
    for d_name, d_code, d_desc in default_departments:
        dept = Department(
            institution_id=inst.id,
            name=d_name,
            code=d_code,
            description=d_desc,
            is_active=True
        )
        db.session.add(dept)

    # 5. Si se asignó un administrador institucional, actualizar su pertenencia
    if admin_user_id:
        admin_u = User.query.get(admin_user_id)
        if admin_u:
            admin_u.institution_id = inst.id
            admin_u.role = 'admin_institucion'

    db.session.commit()

    # 6. Auditoría
    AuditService.log_action(
        user_id=current_user.id,
        action="INSTITUTION_CREATED",
        details=f"Institución '{inst.name}' (Código: {inst.code}) creada exitosamente por SuperAdmin.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Institución "{inst.name}" creada exitosamente.',
        'institution': inst.to_dict()
    }), 201

@institutions_bp.route('/<uuid:inst_id>', methods=['PUT'])
@token_required
def update_institution(current_user, inst_id):
    """
    Actualiza la información de una institución.
    Superadmin: Todos los campos.
    Admin Institucional: Solo campos informativos de su institución.
    """
    if current_user.role != 'superadmin' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'Acceso denegado: No puede modificar otra institución.'}), 403

    inst = Institution.query.get(inst_id)
    if not inst:
        return jsonify({'message': 'Institución no encontrada.'}), 404

    data = request.get_json() or {}
    
    if current_user.role == 'superadmin':
        if 'name' in data and data['name'].strip():
            new_name = data['name'].strip()
            existing = Institution.query.filter(func.lower(Institution.name) == new_name.lower(), Institution.id != inst.id).first()
            if existing:
                return jsonify({'message': 'Ya existe otra institución con ese nombre.'}), 400
            inst.name = new_name
            
        if 'type' in data and data['type']:
            inst.type = data['type'].strip().lower()
            
        if 'admin_user_id' in data:
            inst.admin_user_id = data['admin_user_id'] or None

    if 'description' in data:
        inst.description = data['description'].strip()
    if 'email' in data:
        inst.email = data['email'].strip().lower()
    if 'phone' in data:
        inst.phone = data['phone'].strip()
    if 'country' in data:
        inst.country = data['country'].strip()
    if 'city' in data:
        inst.city = data['city'].strip()
    if 'allowed_domains' in data:
        inst.allowed_domains = data['allowed_domains'].strip().lower() or None
    if 'require_institutional_domain' in data:
        inst.require_institutional_domain = bool(data['require_institutional_domain'])

    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="INSTITUTION_UPDATED",
        details=f"Institución '{inst.name}' actualizada por {current_user.first_name} {current_user.last_name}.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': 'Institución actualizada exitosamente.',
        'institution': inst.to_dict()
    }), 200

@institutions_bp.route('/<uuid:inst_id>/status', methods=['PATCH'])
@token_required
def toggle_institution_status(current_user, inst_id):
    """
    Cambia el estado de una institución (ACTIVE, INACTIVE, SUSPENDED).
    RESTRICCIÓN CRÍTICA: Exclusivo para SuperAdmin.
    """
    if current_user.role != 'superadmin':
        return jsonify({'message': 'Acceso denegado: Solo el SuperAdmin puede modificar el estado de una institución.'}), 403

    inst = Institution.query.get(inst_id)
    if not inst:
        return jsonify({'message': 'Institución no encontrada.'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').upper()
    valid_statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED']
    if new_status not in valid_statuses:
        return jsonify({'message': f'Estado inválido. Opciones: {", ".join(valid_statuses)}'}), 400

    old_status = inst.status
    inst.status = new_status
    db.session.commit()
    
    action_name = "INSTITUTION_SUSPENDED" if new_status == 'SUSPENDED' else "INSTITUTION_REACTIVATED" if new_status == 'ACTIVE' else "INSTITUTION_STATUS_CHANGED"
    AuditService.log_action(
        user_id=current_user.id,
        action=action_name,
        details=f"Estado de institución '{inst.name}' cambiado de '{old_status}' a '{new_status}'.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Estado de la institución cambiado a {new_status}.',
        'institution': inst.to_dict()
    }), 200

# ==============================================================================
# 2. DEPARTAMENTOS (CRUD, UNICIDAD Y SOFT DELETE)
# ==============================================================================

@institutions_bp.route('/<uuid:inst_id>/departments', methods=['GET'])
@token_required
def get_institution_departments(current_user, inst_id):
    """
    Lista todos los departamentos de una institución.
    Aislamiento: Superadmin o usuarios pertenecientes a la institución.
    """
    if current_user.role != 'superadmin' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'Acceso denegado: No pertenece a esta institución.'}), 403

    departments = Department.query.filter_by(institution_id=inst_id).order_by(Department.name.asc()).all()
    result = []
    for d in departments:
        d_dict = d.to_dict()
        user_count = User.query.filter(
            User.institution_id == inst_id,
            or_(User.department_id == d.id, User.department == d.name)
        ).count()
        d_dict['user_count'] = user_count
        result.append(d_dict)
        
    return jsonify(result), 200

@institutions_bp.route('/<uuid:inst_id>/departments', methods=['POST'])
@token_required
def create_department(current_user, inst_id):
    """
    Crea un nuevo departamento en la institución.
    Permisos: SuperAdmin (en cualquier institución) o Admin Institucional (en su institución).
    """
    if current_user.role not in ['superadmin', 'admin_institucion']:
        return jsonify({'message': 'Acceso denegado: Su rol no tiene autorización para crear departamentos.'}), 403

    if current_user.role == 'admin_institucion' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'No puede crear departamentos en otra institución.'}), 403

    inst = Institution.query.get(inst_id)
    if not inst:
        return jsonify({'message': 'Institución no encontrada.'}), 404

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    code = (data.get('code') or '').strip().upper()
    description = (data.get('description') or '').strip()
    leader_id = data.get('leader_id')

    # Validaciones
    if not name or len(name) < 2:
        return jsonify({'message': 'El nombre del departamento es obligatorio (mínimo 2 caracteres).'}), 400
    if not code or len(code) < 2:
        return jsonify({'message': 'El código del departamento es obligatorio (ej. TEC, RRHH, PSI).'}), 400

    # Unicidad dentro de la institución
    name_exists = Department.query.filter(
        Department.institution_id == inst_id,
        func.lower(Department.name) == name.lower()
    ).first()
    if name_exists:
        return jsonify({'message': f'Ya existe un departamento con el nombre "{name}" en esta institución.'}), 400

    code_exists = Department.query.filter(
        Department.institution_id == inst_id,
        Department.code == code
    ).first()
    if code_exists:
        return jsonify({'message': f'Ya existe un departamento con el código "{code}" en esta institución.'}), 400

    # Validar líder si se envió
    if leader_id:
        leader_user = User.query.get(leader_id)
        if not leader_user or str(leader_user.institution_id) != str(inst_id):
            return jsonify({'message': 'El líder seleccionado debe pertenecer a esta institución.'}), 400

    dept = Department(
        institution_id=inst_id,
        name=name,
        code=code,
        description=description,
        leader_id=leader_id or None,
        is_active=True
    )
    db.session.add(dept)
    db.session.flush()

    # Si se asignó un líder, asegurar rol
    if leader_id:
        leader_u = User.query.get(leader_id)
        if leader_u and leader_u.role == 'miembro':
            leader_u.role = 'lider_depto'
            leader_u.department_id = dept.id
            leader_u.department = dept.name

    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="DEPARTMENT_CREATED",
        details=f"Departamento '{dept.name}' ({dept.code}) creado en institución '{inst.name}'.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Departamento "{dept.name}" creado exitosamente.',
        'department': dept.to_dict()
    }), 201

@institutions_bp.route('/<uuid:inst_id>/departments/<uuid:dept_id>', methods=['PUT'])
@token_required
def update_department(current_user, inst_id, dept_id):
    """
    Actualiza información de un departamento.
    """
    if current_user.role not in ['superadmin', 'admin_institucion']:
        return jsonify({'message': 'Acceso denegado: Su rol no puede editar departamentos.'}), 403

    if current_user.role == 'admin_institucion' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'No puede editar departamentos de otra institución.'}), 403

    dept = Department.query.filter_by(id=dept_id, institution_id=inst_id).first()
    if not dept:
        return jsonify({'message': 'Departamento no encontrado.'}), 404

    data = request.get_json() or {}
    
    if 'name' in data and data['name'].strip():
        new_name = data['name'].strip()
        name_exists = Department.query.filter(
            Department.institution_id == inst_id,
            func.lower(Department.name) == new_name.lower(),
            Department.id != dept.id
        ).first()
        if name_exists:
            return jsonify({'message': 'Ya existe otro departamento con ese nombre en esta institución.'}), 400
        dept.name = new_name

    if 'code' in data and data['code'].strip():
        new_code = data['code'].strip().upper()
        code_exists = Department.query.filter(
            Department.institution_id == inst_id,
            Department.code == new_code,
            Department.id != dept.id
        ).first()
        if code_exists:
            return jsonify({'message': 'Ya existe otro departamento con ese código en esta institución.'}), 400
        dept.code = new_code

    if 'description' in data:
        dept.description = data['description'].strip()

    if 'leader_id' in data:
        leader_id = data['leader_id']
        if leader_id:
            leader_u = User.query.get(leader_id)
            if not leader_u or str(leader_u.institution_id) != str(inst_id):
                return jsonify({'message': 'El líder seleccionado debe pertenecer a esta institución.'}), 400
            dept.leader_id = leader_id
        else:
            dept.leader_id = None

    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="DEPARTMENT_UPDATED",
        details=f"Departamento '{dept.name}' ({dept.code}) actualizado.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': 'Departamento actualizado exitosamente.',
        'department': dept.to_dict()
    }), 200

@institutions_bp.route('/<uuid:inst_id>/departments/<uuid:dept_id>/status', methods=['PATCH'])
@token_required
def toggle_department_status(current_user, inst_id, dept_id):
    """
    Desactivación lógica de departamento (Soft Delete).
    Si el departamento tiene usuarios asociados, previene eliminación destructiva.
    """
    if current_user.role not in ['superadmin', 'admin_institucion']:
        return jsonify({'message': 'Acceso denegado: Su rol no puede desactivar departamentos.'}), 403

    if current_user.role == 'admin_institucion' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'No puede desactivar departamentos de otra institución.'}), 403

    dept = Department.query.filter_by(id=dept_id, institution_id=inst_id).first()
    if not dept:
        return jsonify({'message': 'Departamento no encontrado.'}), 404

    # Verificar si tiene usuarios
    user_count = User.query.filter(
        User.institution_id == inst_id,
        or_(User.department_id == dept.id, User.department == dept.name)
    ).count()

    dept.is_active = not dept.is_active
    status_label = "activado" if dept.is_active else "desactivado lógicamente"
    db.session.commit()
    
    action_name = "DEPARTMENT_ACTIVATED" if dept.is_active else "DEPARTMENT_DEACTIVATED"
    AuditService.log_action(
        user_id=current_user.id,
        action=action_name,
        details=f"Departamento '{dept.name}' ({dept.code}) {status_label}. Usuarios vinculados: {user_count}.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Departamento "{dept.name}" {status_label}.',
        'has_users': user_count > 0,
        'user_count': user_count,
        'department': dept.to_dict()
    }), 200

# ==============================================================================
# 3. INVITACIONES INSTITUCIONALES (CREACIÓN, EXPIRACIÓN, REVOCACIÓN)
# ==============================================================================

@institutions_bp.route('/<uuid:inst_id>/invitations', methods=['GET'])
@token_required
def list_institution_invitations(current_user, inst_id):
    """
    Lista las invitaciones generadas para la institución.
    """
    if current_user.role != 'superadmin' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'Acceso denegado: No puede consultar invitaciones de otra institución.'}), 403

    invitations = InvitationCode.query.filter_by(institution_id=inst_id).order_by(InvitationCode.created_at.desc()).all()
    return jsonify([inv.to_dict() for inv in invitations]), 200

@institutions_bp.route('/<uuid:inst_id>/invitations', methods=['POST'])
@token_required
def create_institution_invitation(current_user, inst_id):
    """
    Genera un nuevo código de invitación institucional no predecible.
    Campos: departamento opcional, rol permitido, límite de usos y fecha de expiración.
    """
    if current_user.role not in ['superadmin', 'admin_institucion']:
        return jsonify({'message': 'Acceso denegado: Su rol no puede generar invitaciones.'}), 403

    if current_user.role == 'admin_institucion' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'No puede generar invitaciones para otra institución.'}), 403

    inst = Institution.query.get(inst_id)
    if not inst:
        return jsonify({'message': 'Institución no encontrada.'}), 404

    data = request.get_json() or {}
    department_id = data.get('department_id')
    role = data.get('role', 'miembro')
    max_uses = data.get('max_uses')
    expires_in_days = int(data.get('expires_in_days') or 30)

    # Validar que no puedan crear invitaciones con rol superadmin
    if role == 'superadmin':
        return jsonify({'message': 'No se pueden generar invitaciones con rol SuperAdmin.'}), 403

    valid_roles = ['miembro', 'lider_depto', 'profesional_apoyo', 'admin_institucion']
    if role not in valid_roles:
        return jsonify({'message': f'Rol inválido. Opciones permitidas: {", ".join(valid_roles)}'}), 400

    # Validar departamento si se envió
    dept_obj = None
    if department_id:
        dept_obj = Department.query.filter_by(id=department_id, institution_id=inst_id).first()

    # Generar código criptográfico no predecible
    inst_prefix = (inst.code or 'EQUI').replace('EQUI-', '')[:4]
    while True:
        token_str = secrets.token_hex(4).upper()
        new_code = f"INV-{inst_prefix}-{token_str}"
        if not InvitationCode.query.filter_by(code=new_code).first():
            break

    expires_at = datetime.utcnow() + timedelta(days=expires_in_days) if expires_in_days > 0 else None

    inv = InvitationCode(
        code=new_code,
        institution_id=inst.id,
        department_id=dept_obj.id if dept_obj else None,
        department=dept_obj.name if dept_obj else 'General',
        role=role,
        max_uses=int(max_uses) if max_uses else None,
        used_count=0,
        is_active=True,
        expires_at=expires_at,
        created_by_user_id=current_user.id
    )
    db.session.add(inv)
    db.session.commit()
    
    AuditService.log_action(
        user_id=current_user.id,
        action="INVITATION_CREATED",
        details=f"Invitación '{inv.code}' generada para rol '{role}' (Depto: {inv.department}). Límite de usos: {max_uses or 'Ilimitado'}.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Código de invitación "{inv.code}" generado exitosamente.',
        'invitation': inv.to_dict()
    }), 201

@institutions_bp.route('/<uuid:inst_id>/invitations/<uuid:inv_id>/revoke', methods=['POST'])
@token_required
def revoke_invitation(current_user, inst_id, inv_id):
    """
    Revoca inmediatamente un código de invitación.
    """
    if current_user.role not in ['superadmin', 'admin_institucion']:
        return jsonify({'message': 'Acceso denegado: Su rol no puede revocar invitaciones.'}), 403

    if current_user.role == 'admin_institucion' and str(current_user.institution_id) != str(inst_id):
        return jsonify({'message': 'No puede revocar invitaciones de otra institución.'}), 403

    inv = InvitationCode.query.filter_by(id=inv_id, institution_id=inst_id).first()
    if not inv:
        return jsonify({'message': 'Código de invitación no encontrado.'}), 404

    inv.is_active = False
    db.session.commit()
    
    AuditService.log_action(
        user_id=current_user.id,
        action="INVITATION_REVOKED",
        details=f"Código de invitación '{inv.code}' revocado por {current_user.first_name} {current_user.last_name}.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Código de invitación "{inv.code}" revocado exitosamente.',
        'invitation': inv.to_dict()
    }), 200

# ==============================================================================
# 4. DIRECTORIO DE INTEGRANTES Y RBAC (FILTROS, EDICIÓN, SEGURIDAD)
# ==============================================================================

@institutions_bp.route('/members', methods=['GET'])
@token_required
@permission_required('members')
def get_institution_members(current_user):
    """
    Retorna el directorio de usuarios según el alcance y filtros:
    - Superadmin: Global con opción de filtro por institución.
    - Admin Institucional: Filtrado estricto a su institución.
    - Líder de Depto: Directorio exclusivo de su departamento.
    """
    query = User.query

    # 1. Control de Alcance Institucional
    if current_user.role != 'superadmin':
        if not current_user.institution_id:
            return jsonify([]), 200
        query = query.filter(User.institution_id == current_user.institution_id)
    else:
        # SuperAdmin puede filtrar por institución si la especifica
        inst_param = request.args.get('institution_id')
        if inst_param:
            query = query.filter(User.institution_id == inst_param)

    # 2. Control de Alcance por Departamento si es Líder
    if current_user.role == 'lider_depto':
        user_dept = current_user.department or 'General'
        query = query.filter(or_(User.department == user_dept, User.department_id == current_user.department_id))

    # 3. Filtros opcionales por query params
    role_filter = request.args.get('role')
    if role_filter and role_filter != 'todos':
        query = query.filter(User.role == role_filter)

    dept_filter = request.args.get('department')
    if dept_filter and dept_filter != 'todos':
        query = query.filter(or_(User.department == dept_filter, User.department_id == dept_filter))

    status_filter = request.args.get('status')
    if status_filter and status_filter != 'todos':
        st = status_filter.upper()
        if st in ['ACTIVO', 'ACTIVE']:
            query = query.filter(User.status.in_(['ACTIVO', 'ACTIVE']))
        elif st in ['PENDIENTE', 'PENDING']:
            query = query.filter(User.status.in_(['PENDIENTE', 'PENDING']))
        elif st in ['BLOQUEADO', 'BLOCKED', 'SUSPENDED', 'INACTIVE']:
            query = query.filter(User.status.in_(['BLOQUEADO', 'BLOCKED', 'SUSPENDED', 'INACTIVE']))
        elif st in ['RECHAZADO', 'REJECTED']:
            query = query.filter(User.status.in_(['RECHAZADO', 'REJECTED']))
        else:
            query = query.filter(User.status == st)

    search_text = request.args.get('search', '').strip()
    if search_text:
        search_pattern = f"%{search_text}%"
        query = query.filter(or_(
            User.first_name.ilike(search_pattern),
            User.last_name.ilike(search_pattern),
            User.email.ilike(search_pattern)
        ))

    members = query.order_by(User.created_at.desc()).all()
    return jsonify([m.to_dict() for m in members]), 200

@institutions_bp.route('/members/<uuid:user_id>', methods=['PUT'])
@token_required
@permission_required('members')
def update_institution_member(current_user, user_id):
    """
    Actualiza la información de un integrante (Perfil, Rol, Departamento, Estado).
    
    REGLAS DE SEGURIDAD ESTRICTAS:
    1. Solo SuperAdmin y Admin Institucional pueden modificar usuarios.
    2. Aislamiento: Admin Institucional no puede modificar usuarios de otra institución.
    3. Ningún usuario puede auto-modificarse su propio rol o estado desde este endpoint.
    4. Admin Institucional no puede promover a nadie a SuperAdmin.
    5. PROTECCIÓN DEL ÚLTIMO SUPERADMIN: Imposible degradar de rol o suspender al último SuperAdmin activo.
    """
    if not can_manage_roles(current_user.role):
        return jsonify({'message': 'Acceso denegado: Su rol no tiene autorización para modificar usuarios o cambiar roles.'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404

    # 1. Aislamiento institucional
    if current_user.role != 'superadmin' and str(target_user.institution_id) != str(current_user.institution_id):
        return jsonify({'message': 'Acceso denegado: No tiene permisos para modificar usuarios de otra institución.'}), 403

    # 2. No auto-modificación de rol o estado propio
    data = request.get_json() or {}
    if str(current_user.id) == str(target_user.id):
        if 'role' in data and data['role'] != current_user.role:
            return jsonify({'message': 'No puede modificar su propio rol en el sistema.'}), 403
        if 'status' in data and data['status'] != current_user.status:
            return jsonify({'message': 'No puede suspender ni modificar el estado de su propia cuenta.'}), 403

    # 3. Validar cambios y auditoría de trazabilidad
    audit_changes = []

    # 3.1 Cambio de Rol
    if 'role' in data:
        new_role = data['role'].strip().lower()
        valid_roles = ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro']
        if new_role not in valid_roles:
            return jsonify({'message': f'Rol inválido. Opciones: {", ".join(valid_roles)}'}), 400

        if current_user.role == 'admin_institucion' and new_role == 'superadmin':
            return jsonify({'message': 'Un Administrador Institucional no puede promover usuarios a SuperAdmin.'}), 403

        # REGLA CRÍTICA: Proteger al último SuperAdmin activo
        if target_user.role == 'superadmin' and new_role != 'superadmin':
            active_superadmins = User.query.filter_by(role='superadmin', status='ACTIVE').count()
            if active_superadmins <= 1:
                return jsonify({'message': 'No es posible realizar esta acción porque debe existir al menos un SuperAdmin activo en EquilibrIA.'}), 400

        if target_user.role != new_role:
            audit_changes.append(f"Rol cambiado de '{target_user.role}' a '{new_role}'")
            target_user.role = new_role

    # 3.2 Cambio de Estado (ACTIVO, PENDIENTE, BLOQUEADO, RECHAZADO)
    if 'status' in data:
        raw_status = data['status'].strip().upper()
        status_map = {
            'ACTIVE': 'ACTIVO', 'ACTIVO': 'ACTIVO',
            'PENDING': 'PENDIENTE', 'PENDIENTE': 'PENDIENTE',
            'SUSPENDED': 'BLOQUEADO', 'BLOCKED': 'BLOQUEADO', 'BLOQUEADO': 'BLOQUEADO',
            'REJECTED': 'RECHAZADO', 'RECHAZADO': 'RECHAZADO',
            'INACTIVE': 'BLOQUEADO'
        }
        if raw_status not in status_map:
            return jsonify({'message': f'Estado inválido. Opciones: ACTIVO, PENDIENTE, BLOQUEADO, RECHAZADO'}), 400

        new_status = status_map[raw_status]

        # REGLA CRÍTICA: Proteger al último SuperAdmin contra suspensión o desactivación
        if target_user.role == 'superadmin' and new_status != 'ACTIVO':
            active_superadmins = User.query.filter(User.role == 'superadmin', User.status.in_(['ACTIVO', 'ACTIVE'])).count()
            if active_superadmins <= 1:
                return jsonify({'message': 'No es posible suspender ni desactivar al único SuperAdmin activo en EquilibrIA.'}), 400

        if target_user.status != new_status:
            audit_changes.append(f"Estado de cuenta cambiado de '{target_user.status}' a '{new_status}'")
            target_user.status = new_status

    # 3.3 Cambio de Departamento
    if 'department' in data or 'department_id' in data:
        new_dept_name = data.get('department')
        new_dept_id = data.get('department_id')
        
        # Buscar departamento en la institución del usuario
        if new_dept_id:
            dept_obj = Department.query.filter_by(id=new_dept_id, institution_id=target_user.institution_id).first()
            if dept_obj:
                new_dept_name = dept_obj.name
                target_user.department_id = dept_obj.id
        elif new_dept_name:
            dept_obj = Department.query.filter_by(name=new_dept_name, institution_id=target_user.institution_id).first()
            if dept_obj:
                target_user.department_id = dept_obj.id
                
        if new_dept_name and target_user.department != new_dept_name:
            audit_changes.append(f"Departamento cambiado de '{target_user.department}' a '{new_dept_name}'")
            target_user.department = new_dept_name

    # 3.4 Datos Básicos
    if 'first_name' in data and data['first_name'].strip():
        target_user.first_name = data['first_name'].strip()
    if 'last_name' in data and data['last_name'].strip():
        target_user.last_name = data['last_name'].strip()

    db.session.commit()

    # 4. Registrar en Auditoría
    if audit_changes:
        AuditService.log_action(
            user_id=current_user.id,
            action="USER_UPDATED",
            details=f"Usuario '{target_user.first_name} {target_user.last_name}' ({target_user.email}) modificado: {'; '.join(audit_changes)}.",
            ip_address=_get_client_ip()
        )

    return jsonify({
        'message': f'Usuario {target_user.first_name} {target_user.last_name} actualizado exitosamente.',
        'user': target_user.to_dict()
    }), 200

@institutions_bp.route('/members/<uuid:user_id>/status-action', methods=['POST'])
@token_required
@permission_required('members')
def handle_member_status_action(current_user, user_id):
    """
    Ejecuta acciones administrativas directas sobre el estado de la cuenta:
    'approve' -> ACTIVO (Auditoría: APROBACION_DE_USUARIO)
    'reject' -> RECHAZADO (Auditoría: RECHAZO_DE_USUARIO)
    'block' -> BLOQUEADO (Auditoría: BLOQUEO_DE_USUARIO)
    'reactivate' -> ACTIVO (Auditoría: REACTIVACION_DE_USUARIO)
    """
    if not can_manage_roles(current_user.role):
        return jsonify({'message': 'Acceso denegado: No tiene permisos administrativos para cambiar estados.'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404

    if current_user.role != 'superadmin' and str(target_user.institution_id) != str(current_user.institution_id):
        return jsonify({'message': 'No puede modificar usuarios de otra institución.'}), 403

    if str(current_user.id) == str(target_user.id):
        return jsonify({'message': 'No puede modificar el estado de su propia cuenta.'}), 403

    data = request.get_json(silent=True) or {}
    action = (data.get('action') or '').strip().lower()

    if action == 'approve':
        target_user.status = 'ACTIVO'
        target_user.email_verified = True
        audit_action = "APROBACION_DE_USUARIO"
        msg = f"Usuario {target_user.first_name} {target_user.last_name} aprobado exitosamente. Ahora tiene acceso ACTIVO."
    elif action == 'reject':
        target_user.status = 'RECHAZADO'
        audit_action = "RECHAZO_DE_USUARIO"
        msg = f"Solicitud del usuario {target_user.first_name} {target_user.last_name} rechazada."
    elif action == 'block':
        # Proteger SuperAdmin
        if target_user.role == 'superadmin':
            active_superadmins = User.query.filter(User.role == 'superadmin', User.status.in_(['ACTIVO', 'ACTIVE'])).count()
            if active_superadmins <= 1:
                return jsonify({'message': 'No es posible bloquear al único SuperAdmin activo.'}), 400
        target_user.status = 'BLOQUEADO'
        audit_action = "BLOQUEO_DE_USUARIO"
        msg = f"Usuario {target_user.first_name} {target_user.last_name} bloqueado temporalmente."
    elif action == 'reactivate':
        target_user.status = 'ACTIVO'
        audit_action = "REACTIVACION_DE_USUARIO"
        msg = f"Usuario {target_user.first_name} {target_user.last_name} reactivado exitosamente."
    else:
        return jsonify({'message': 'Acción inválida. Opciones: approve, reject, block, reactivate'}), 400

    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action=audit_action,
        details=f"Acción '{action.upper()}' ejecutada sobre '{target_user.email}' por {current_user.first_name} {current_user.last_name}.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': msg,
        'user': target_user.to_dict()
    }), 200

@institutions_bp.route('/members/<uuid:user_id>/reset-password', methods=['POST'])
@token_required
@permission_required('members')
def request_password_reset(current_user, user_id):
    """
    Genera una solicitud segura de restablecimiento de contraseña.
    Nunca expone contraseñas en texto plano ni en auditoría.
    """
    if not can_manage_roles(current_user.role):
        return jsonify({'message': 'Acceso denegado: No tiene permisos para gestionar restablecimientos de contraseña.'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404

    if current_user.role != 'superadmin' and str(target_user.institution_id) != str(current_user.institution_id):
        return jsonify({'message': 'No puede restablecer la contraseña de usuarios de otra institución.'}), 403

    # Generar token temporal de reseteo (un solo uso, 24h)
    temp_token = secrets.token_urlsafe(32)
    token_obj = EmailVerificationToken(
        user_id=target_user.id,
        token_hash=EmailVerificationToken.hash_token(temp_token),
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.session.add(token_obj)
    db.session.commit()
    
    # Registrar en auditoría de forma segura (sin secretos)
    AuditService.log_action(
        user_id=current_user.id,
        action="PASSWORD_RESET_REQUESTED",
        details=f"Solicitud de restablecimiento de contraseña generada para '{target_user.email}' por {current_user.first_name} {current_user.last_name}.",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Enlace de restablecimiento de contraseña generado para {target_user.email}.',
        'reset_link': f"/restablecer-contrasena/{temp_token}"
    }), 200

@institutions_bp.route('/members/<uuid:user_id>/transfer', methods=['PATCH'])
@token_required
def transfer_user_institution(current_user, user_id):
    """
    Transfiere a un usuario entre instituciones.
    RESTRICCIÓN CRÍTICA: Exclusivo para SuperAdmin.
    """
    if current_user.role != 'superadmin':
        return jsonify({'message': 'Acceso denegado: Únicamente el SuperAdmin puede transferir usuarios entre instituciones.'}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'Usuario no encontrado.'}), 404

    data = request.get_json() or {}
    dest_institution_id = data.get('institution_id')
    dest_department_id = data.get('department_id')

    dest_inst = Institution.query.get(dest_institution_id)
    if not dest_inst:
        return jsonify({'message': 'Institución de destino no encontrada.'}), 404

    dest_dept = None
    if dest_department_id:
        dest_dept = Department.query.filter_by(id=dest_department_id, institution_id=dest_inst.id).first()

    old_inst_name = target_user.institution.name if target_user.institution else 'Ninguna'
    target_user.institution_id = dest_inst.id
    target_user.department_id = dest_dept.id if dest_dept else None
    target_user.department = dest_dept.name if dest_dept else 'General'

    db.session.commit()

    AuditService.log_action(
        user_id=current_user.id,
        action="USER_INSTITUTION_CHANGED",
        details=f"Usuario '{target_user.email}' transferido de '{old_inst_name}' a '{dest_inst.name}' (Depto: {target_user.department}).",
        ip_address=_get_client_ip()
    )

    return jsonify({
        'message': f'Usuario transferido exitosamente a "{dest_inst.name}".',
        'user': target_user.to_dict()
    }), 200

# ==============================================================================
# 5. DASHBOARD DE BIENESTAR Y SUGERENCIAS IA (CON AISLAMIENTO INSTITUCIONAL)
# ==============================================================================

@institutions_bp.route('/dashboard', methods=['GET'])
@token_required
@permission_required('analytics')
def get_dashboard_data(current_user):
    """
    Obtiene datos agregados e históricos del bienestar emocional con aislamiento estricto.
    """
    institution_id = current_user.institution_id
    if current_user.role == 'superadmin':
        inst_param = request.args.get('institution_id')
        institution_id = inst_param if inst_param else None
            
    if current_user.role != 'superadmin' and not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400

    dept_user_ids = None
    if current_user.role == 'lider_depto':
        user_dept = current_user.department or 'General'
        dept_user_ids = [u.id for u in User.query.filter(
            User.institution_id == institution_id,
            or_(User.department == user_dept, User.department_id == current_user.department_id)
        ).all()]

    # 1. Métricas Generales (Promedios)
    averages_query = db.session.query(
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('total_reflections')
    )
    if institution_id:
        averages_query = averages_query.filter(Reflection.institution_id == institution_id)
    if dept_user_ids is not None:
        averages_query = averages_query.filter(Reflection.user_id.in_(dept_user_ids))
    averages = averages_query.first()
    
    # 2. Distribución de Sentimientos
    sentiment_query = db.session.query(
        Reflection.dominant_sentiment,
        func.count(Reflection.id).label('count')
    )
    if institution_id:
        sentiment_query = sentiment_query.filter(Reflection.institution_id == institution_id)
    if dept_user_ids is not None:
        sentiment_query = sentiment_query.filter(Reflection.user_id.in_(dept_user_ids))
    sentiment_distribution = sentiment_query.group_by(Reflection.dominant_sentiment).all()
    
    sentiment_data = {'Positivo': 0, 'Neutro': 0, 'Negativo': 0}
    for item in sentiment_distribution:
        if item.dominant_sentiment in sentiment_data:
            sentiment_data[item.dominant_sentiment] = item.count
        
    # 3. Tendencia Histórica
    trends_query = db.session.query(
        func.date(Reflection.created_at).label('date'),
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('reflections_count')
    )
    if institution_id:
        trends_query = trends_query.filter(Reflection.institution_id == institution_id)
    if dept_user_ids is not None:
        trends_query = trends_query.filter(Reflection.user_id.in_(dept_user_ids))
    historical_trends = trends_query.group_by(func.date(Reflection.created_at))\
        .order_by(func.date(Reflection.created_at).asc()).all()
     
    trends_list = [{
        'date': str(trend.date),
        'stress': round(float(trend.avg_stress), 1) if trend.avg_stress else 0,
        'motivation': round(float(trend.avg_motivation), 1) if trend.avg_motivation else 0,
        'burnout': round(float(trend.avg_burnout), 1) if trend.avg_burnout else 0,
        'count': trend.reflections_count
    } for trend in historical_trends]
        
    # 4. Total de Miembros
    members_query = User.query.filter_by(role='miembro')
    if institution_id:
        members_query = members_query.filter_by(institution_id=institution_id)
    if current_user.role == 'lider_depto':
        members_query = members_query.filter(or_(User.department == current_user.department, User.department_id == current_user.department_id))
    total_members = members_query.count()
    
    return jsonify({
        'averages': {
            'stress': round(float(averages.avg_stress), 1) if averages.avg_stress else 0,
            'motivation': round(float(averages.avg_motivation), 1) if averages.avg_motivation else 0,
            'burnout': round(float(averages.avg_burnout), 1) if averages.avg_burnout else 0,
            'total_reflections': averages.total_reflections or 0
        },
        'sentiment_distribution': sentiment_data,
        'historical_trends': trends_list,
        'total_members': total_members
    }), 200

@institutions_bp.route('/suggestions', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin', 'profesional_apoyo', 'lider_depto')
def get_suggestions(current_user):
    """
    Retorna el listado de sugerencias de IA con aislamiento institucional.
    """
    institution_id = current_user.institution_id
    if current_user.role == 'superadmin':
        inst_param = request.args.get('institution_id')
        institution_id = inst_param if inst_param else None
            
    if current_user.role != 'superadmin' and not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400
        
    reflections_query = Reflection.query.filter(
        Reflection.institution_suggestion.isnot(None),
        Reflection.institution_suggestion != ''
    )
    if institution_id:
        reflections_query = reflections_query.filter(Reflection.institution_id == institution_id)
    reflections = reflections_query.order_by(Reflection.created_at.desc()).limit(30).all()
    
    suggestions = [{
        'id': str(ref.id),
        'suggestion': ref.institution_suggestion,
        'created_at': ref.created_at.isoformat()
    } for ref in reflections]
    
    return jsonify(suggestions), 200
