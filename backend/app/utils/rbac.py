"""
Módulo Centralizado de Control de Acceso Basado en Roles (RBAC) - EquilibrIA
Fuente única de verdad para los 5 roles oficiales y los 13 módulos del sistema.
"""

ROLES = {
    'SUPERADMIN': 'superadmin',
    'ADMIN_INSTITUCION': 'admin_institucion',
    'PROFESIONAL_APOYO': 'profesional_apoyo',
    'LIDER_DEPTO': 'lider_depto',
    'MIEMBRO': 'miembro'
}

MODULE_ACCESS_MATRIX = {
    'analytics': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'tasks': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'alerts': ['superadmin', 'admin_institucion', 'profesional_apoyo'],
    'evaluations': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'clinical_appointments': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'miembro'],
    'members': ['superadmin', 'admin_institucion', 'lider_depto'],
    'institutions': ['superadmin', 'admin_institucion'],
    'progress': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'kudos': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
    'reports': ['superadmin', 'admin_institucion', 'profesional_apoyo'],
    'audit': ['superadmin', 'admin_institucion'],
    'ai_plans': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
    'chat_ia': ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro']
}

# Permisos específicos de administración de usuarios y seguridad
ROLE_MANAGEMENT_ROLES = ['superadmin', 'admin_institucion']

def has_module_access(role, module):
    """
    Verifica si un rol tiene acceso a un módulo según la matriz central RBAC.
    """
    if not role or not module:
        return False
    allowed_roles = MODULE_ACCESS_MATRIX.get(module, [])
    return role in allowed_roles

def can_manage_roles(role):
    """
    Verifica si el rol puede modificar usuarios, asignar roles o cambiar permisos de seguridad.
    """
    return role in ROLE_MANAGEMENT_ROLES

def get_allowed_modules_for_role(role):
    """
    Retorna la lista de módulos autorizados para un rol específico.
    """
    return [module for module, roles in MODULE_ACCESS_MATRIX.items() if role in roles]
