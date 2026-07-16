import os
from app import db
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def log_action(user_id, action, details=None, ip_address=None):
        """
        Registra una acción de auditoría en la base de datos de manera inmutable.
        """
        try:
            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                details=details,
                ip_address=ip_address
            )
            db.session.add(log_entry)
            db.session.commit()
            print(f"[AUDIT] Acción registrada: {action} (Usuario: {user_id or 'Sistema'})")
            return log_entry
        except Exception as e:
            db.session.rollback()
            print(f"[AUDIT ERROR] No se pudo guardar la auditoría: {str(e)}")
            return None
