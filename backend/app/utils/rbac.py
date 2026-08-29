"""
Módulo Centralizado de Control de Acceso Basado en Roles (RBAC) - EquilibrIA
Fuente única de verdad para los 5 roles oficiales, los 13 módulos del sistema
y los permisos granulares administrativos y de seguridad.
"""

ROLES = {
    'SUPERADMIN': 'superadmin',
    'ADMIN_INSTITUCION': 'admin_institucion',
    'PROFESIONAL_APOYO': 'profesional_apoyo',
    'LIDER_DEPTO': 'lider_depto',
    'MIEMBRO': 'miembro'
}

# Matriz de acceso a los 13 módulos funcionales de EquilibrIA
MODULE_ACCESS_MATRIX = {
    'analytics': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'tasks': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'alerts': ['superadmin', 'admin_institucion', 'profesional_apoyo'],
    'evaluations': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'clinical_appointments': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'miembro'],
    'members': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'institutions': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'progress': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'kudos': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'reports': ['superadmin', 'admin_institucion', 'profesional_apoyo'],
    'audit': ['superadmin', 'admin_institucion'],
    'ai_plans': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'chat_ia': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro']
}

# Permisos granulares de administración y seguridad en backend
GRANULAR_PERMISSIONS = {
    # Instituciones
    'institutions.view': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'institutions.create': ['superadmin'],
    'institutions.update': ['superadmin', 'admin_institucion'],
    'institutions.suspend': ['superadmin'],
    'institutions.transfer_user': ['superadmin'],
    
    # Departamentos
    'departments.view': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'departments.create': ['superadmin', 'admin_institucion'],
    'departments.update': ['superadmin', 'admin_institucion'],
    'departments.deactivate': ['superadmin', 'admin_institucion'],
    
    # Usuarios y Roles (RBAC)
    'users.view': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'users.create': ['superadmin', 'admin_institucion'],
    'users.edit_profile': ['superadmin', 'admin_institucion'],
    'users.change_role': ['superadmin', 'admin_institucion'],
    'users.suspend': ['superadmin', 'admin_institucion'],
    'users.reactivate': ['superadmin', 'admin_institucion'],
    'users.reset_password': ['superadmin', 'admin_institucion'],
    
    # Invitaciones Institucionales
    'invitations.view': ['superadmin', 'admin_institucion'],
    'invitations.create': ['superadmin', 'admin_institucion'],
    'invitations.revoke': ['superadmin', 'admin_institucion'],
    
    # Auditoría
    'audit.view': ['superadmin', 'admin_institucion']
}

# Roles con facultades de administración general
ROLE_MANAGEMENT_ROLES = ['superadmin', 'admin_institucion']

def has_module_access(role, module):
    """Verifica si un rol tiene acceso a un módulo según la matriz central RBAC."""
    if not role or not module:
        return False
    allowed_roles = MODULE_ACCESS_MATRIX.get(module, [])
    return role in allowed_roles

def has_permission(role, action):
    """Verifica si un rol cuenta con un permiso granular específico."""
    if not role or not action:
        return False
    allowed_roles = GRANULAR_PERMISSIONS.get(action, [])
    return role in allowed_roles

def can_manage_roles(role):
    """Verifica si el rol puede modificar usuarios, asignar roles o cambiar permisos de seguridad."""
    return role in ROLE_MANAGEMENT_ROLES

def can_manage_institutions(role):
    """Verifica si el rol puede crear o suspender instituciones (exclusivo SuperAdmin)."""
    return role == 'superadmin'

def can_manage_departments(role):
    """Verifica si el rol puede crear o editar departamentos."""
    return role in ['superadmin', 'admin_institucion']

def get_allowed_modules_for_role(role):
    """Retorna la lista de módulos autorizados para un rol específico."""
    return [module for module, roles in MODULE_ACCESS_MATRIX.items() if role in roles]
