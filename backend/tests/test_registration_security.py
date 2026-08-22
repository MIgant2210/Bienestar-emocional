import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import uuid
import time
import requests
import datetime
from app import create_app, db
from app.models.user import User
from app.models.institution import Institution
from app.models.invitation import InvitationCode
from app.models.verification_token import EmailVerificationToken
from app.models.consent import Consent
from app.models.audit_log import AuditLog

BASE_URL = "http://127.0.0.1:5000/api/auth"

def run_all_tests():
    app = create_app()
    results = []

    def log_test(num, name, passed, details=""):
        status = "[OK]  PASSED" if passed else "[X]   FAILED"
        results.append((num, name, passed, details))
        print(f"[{num:02d}] {name.ljust(48)}: {status} {details}")

    print("\n" + "="*80)
    print("EJECUCIÓN DE BATERÍA DE 25 PRUEBAS DE SEGURIDAD DEL REGISTRO DE USUARIOS")
    print("="*80 + "\n")

    try:
        requests.post(f"{BASE_URL}/reset-rate-limit")
    except Exception:
        pass

    unique_suffix = str(int(time.time()))

    with app.app_context():
        # Setup: Obtener institución y código válido
        inst = Institution.query.filter_by(name="Institución Central EquilibrIA").first()
        if not inst:
            inst = Institution.query.first()

        inv_code = "EQUILIBRIA-2026"
        inv = InvitationCode.query.filter_by(code=inv_code).first()
        if not inv:
            inv = InvitationCode(code=inv_code, institution_id=inst.id, department="General", is_active=True)
            db.session.add(inv)
            db.session.commit()

        # 1. Registro Válido Completo
        email_valid = f"test_valido_{unique_suffix}@bienestar.com"
        payload_valid = {
            "first_name": "Carlos",
            "last_name": "Mendoza",
            "email": email_valid,
            "password": "PasswordSeguro2026!",
            "password_confirm": "PasswordSeguro2026!",
            "invitation_code": inv_code,
            "terms_accepted": True
        }
        r1 = requests.post(f"{BASE_URL}/register", json=payload_valid)
        raw_token = r1.json().get('verification_token')
        p1 = r1.status_code == 201 and r1.json().get('status') == 'PENDING' and raw_token is not None
        log_test(1, "Registro válido (Status PENDING sin JWT)", p1, f"Code: {r1.status_code}")

        # 2. Nombre Inválido (Números y Símbolos)
        r2 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t2_{unique_suffix}@bienestar.com", "first_name": "Juan123"})
        p2 = r2.status_code == 400
        log_test(2, "Nombre inválido con números ('Juan123')", p2, f"Code: {r2.status_code}")

        # 3. Apellido Inválido (Menor a 2 caracteres)
        r3 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t3_{unique_suffix}@bienestar.com", "last_name": "A"})
        p3 = r3.status_code == 400
        log_test(3, "Apellido inválido menor a 2 caracteres", p3, f"Code: {r3.status_code}")

        # 4. Correo Inválido
        r4 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": "correo-no-valido-sin-arroba"})
        p4 = r4.status_code == 400
        log_test(4, "Correo inválido sin formato RFC", p4, f"Code: {r4.status_code}")

        # 5. Correo Duplicado (Ignora mayúsculas/minúsculas)
        r5 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": email_valid.upper()})
        p5 = r5.status_code == 400 and "ya está registrado" in r5.json().get('message', '').lower()
        log_test(5, "Correo duplicado en mayúsculas", p5, f"Code: {r5.status_code}")

        # 6. Contraseña Débil (Sin caracteres especiales ni mayúsculas)
        r6 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t6_{unique_suffix}@bienestar.com", "password": "password123", "password_confirm": "password123"})
        p6 = r6.status_code == 400
        log_test(6, "Contraseña débil sin mayúsculas/símbolos", p6, f"Code: {r6.status_code}")

        # 7. Contraseñas no coincidentes
        r7 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t7_{unique_suffix}@bienestar.com", "password_confirm": "OtraPassword2026!"})
        p7 = r7.status_code == 400
        log_test(7, "Contraseñas no coincidentes", p7, f"Code: {r7.status_code}")

        # 8. Código de Institución Inválido
        r8 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t8_{unique_suffix}@bienestar.com", "invitation_code": "CODIGO-INEXISTENTE-999"})
        p8 = r8.status_code == 400
        log_test(8, "Código de invitación inexistente", p8, f"Code: {r8.status_code}")

        # 9. Código de Institución Inactivo o Expirado
        expired_code_str = f"EXPIRADO-{unique_suffix}"
        exp_inv = InvitationCode(code=expired_code_str, institution_id=inst.id, is_active=False)
        db.session.add(exp_inv)
        db.session.commit()
        r9 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t9_{unique_suffix}@bienestar.com", "invitation_code": expired_code_str})
        p9 = r9.status_code == 400
        log_test(9, "Código de invitación desactivado", p9, f"Code: {r9.status_code}")

        # 10. Intento de manipular institution_id directamente
        bogus_inst_id = str(uuid.uuid4())
        r10 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t10_{unique_suffix}@bienestar.com", "institution_id": bogus_inst_id})
        user10 = User.query.filter_by(email=f"t10_{unique_suffix}@bienestar.com").first()
        p10 = r10.status_code == 201 and str(user10.institution_id) == str(inst.id)
        log_test(10, "Ignora institution_id manipulado y usa código", p10, f"Inst asignada: {user10.institution_id}")

        # 11. Intento de registrarse como SUPERADMIN
        r11 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t11_{unique_suffix}@bienestar.com", "role": "superadmin", "is_superadmin": True})
        user11 = User.query.filter_by(email=f"t11_{unique_suffix}@bienestar.com").first()
        p11 = user11 and user11.role == "miembro"
        log_test(11, "Intento de escalamiento a superadmin forzado a miembro", p11, f"Rol real: {user11.role if user11 else 'None'}")

        # 12. Intento de registrarse como ADMIN
        r12 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t12_{unique_suffix}@bienestar.com", "role": "admin_institucion"})
        user12 = User.query.filter_by(email=f"t12_{unique_suffix}@bienestar.com").first()
        p12 = user12 and user12.role == "miembro"
        log_test(12, "Intento de rol admin_institucion forzado a miembro", p12, f"Rol real: {user12.role if user12 else 'None'}")

        # 13. Cuenta PENDING intentando iniciar sesión
        r13 = requests.post(f"{BASE_URL}/login", json={"email": email_valid, "password": "PasswordSeguro2026!"})
        p13 = r13.status_code == 403 and "pendiente" in r13.json().get('message', '').lower()
        log_test(13, "Cuenta PENDING bloqueada en Login (403)", p13, f"Code: {r13.status_code}")

        # 14. Cuenta SUSPENDED intentando iniciar sesión
        user11.status = 'SUSPENDED'
        db.session.commit()
        r14 = requests.post(f"{BASE_URL}/login", json={"email": user11.email, "password": "PasswordSeguro2026!"})
        p14 = r14.status_code == 403 and "suspend" in r14.json().get('message', '').lower()
        log_test(14, "Cuenta SUSPENDED bloqueada en Login (403)", p14, f"Code: {r14.status_code}")

        # 15. Verificación de correo con token válido (Test 16 ejecutado antes para probar 15)
        r16 = requests.post(f"{BASE_URL}/verify-email", json={"token": raw_token})
        user_valid_db = User.query.filter_by(email=email_valid).first()
        p16 = r16.status_code == 200 and user_valid_db.email_verified is True and user_valid_db.status == 'ACTIVE'
        log_test(16, "Verificación de correo con token válido", p16, f"Status: {user_valid_db.status}")

        # 15. Cuenta ACTIVE iniciando sesión exitosamente
        r15 = requests.post(f"{BASE_URL}/login", json={"email": email_valid, "password": "PasswordSeguro2026!"})
        p15 = r15.status_code == 200 and 'token' in r15.json()
        log_test(15, "Cuenta ACTIVE inicia sesión y recibe JWT", p15, f"Code: {r15.status_code}")

        # 17. Token de verificación expirado
        expired_token_raw = f"expired_raw_token_{unique_suffix}_{uuid.uuid4()}"
        expired_token_record = EmailVerificationToken(
            user_id=user12.id,
            token_hash=EmailVerificationToken.hash_token(expired_token_raw),
            expires_at=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(hours=1)
        )
        db.session.add(expired_token_record)
        db.session.commit()
        r17 = requests.post(f"{BASE_URL}/verify-email", json={"token": expired_token_raw})
        p17 = r17.status_code == 400 and "expirado" in r17.json().get('message', '').lower()
        log_test(17, "Token de verificación expirado rechazado (400)", p17, f"Code: {r17.status_code}")

        # 18. Token de verificación reutilizado
        r18 = requests.post(f"{BASE_URL}/verify-email", json={"token": raw_token})
        p18 = r18.status_code == 400 and "utilizado" in r18.json().get('message', '').lower()
        log_test(18, "Token de verificación reutilizado rechazado (400)", p18, f"Code: {r18.status_code}")

        # 19. Múltiples envíos / Concurrencia de correo idéntico
        r19_1 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t19_{unique_suffix}@bienestar.com"})
        r19_2 = requests.post(f"{BASE_URL}/register", json={**payload_valid, "email": f"t19_{unique_suffix}@bienestar.com"})
        p19 = r19_1.status_code == 201 and r19_2.status_code == 400
        log_test(19, "Manejo de registros concurrentes duplicados", p19, f"1st: {r19_1.status_code}, 2nd: {r19_2.status_code}")

        # 21. Intentos de SQL Injection en inputs
        r21 = requests.post(f"{BASE_URL}/register", json={
            **payload_valid,
            "email": f"sqli_{unique_suffix}@bienestar.com",
            "first_name": "Juan' OR '1'='1",
            "last_name": "Perez; DROP TABLE users;--"
        })
        p21 = r21.status_code == 400
        log_test(21, "Intento de SQL Injection rechazado en validación", p21, f"Code: {r21.status_code}")

        # 22. Intentos de Mass Assignment (inyección de total_xp, permissions, status)
        r22 = requests.post(f"{BASE_URL}/register", json={
            **payload_valid,
            "email": f"mass_{unique_suffix}@bienestar.com",
            "total_xp": 99999,
            "current_level": 50,
            "status": "ACTIVE",
            "email_verified": True
        })
        user22 = User.query.filter_by(email=f"mass_{unique_suffix}@bienestar.com").first()
        p22 = user22 and user22.total_xp == 0 and user22.status == 'PENDING' and user22.email_verified is False
        log_test(22, "Prevención de Mass Assignment (XP y Status)", p22, f"XP: {user22.total_xp if user22 else 'N/A'}, Status: {user22.status if user22 else 'N/A'}")

        # 23. Nombres con caracteres especiales válidos en español (tildes, diéresis, apóstrofe, guión)
        r23 = requests.post(f"{BASE_URL}/register", json={
            **payload_valid,
            "email": f"esp_{unique_suffix}@bienestar.com",
            "first_name": "María José",
            "last_name": "O'Connor-Gómez"
        })
        p23 = r23.status_code == 201
        log_test(23, "Nombres en español válidos (María José, O'Connor-Gómez)", p23, f"Code: {r23.status_code}")

        # 24. Persistencia en PostgreSQL con FK y relaciones
        user_persisted = User.query.filter_by(email=f"esp_{unique_suffix}@bienestar.com").first()
        consents_persisted = Consent.query.filter_by(user_id=user_persisted.id).all() if user_persisted else []
        p24 = user_persisted is not None and user_persisted.institution_id == inst.id and len(consents_persisted) >= 2
        log_test(24, "Persistencia completa en DB (Usuario + FK + Consentimientos)", p24, f"Consentimientos guardados: {len(consents_persisted)}")

        # 25. Registro en bitácora de Auditoría
        audit_registered = AuditLog.query.filter_by(user_id=user_valid_db.id, action="USER_REGISTERED").first()
        audit_verified = AuditLog.query.filter_by(user_id=user_valid_db.id, action="EMAIL_VERIFIED").first()
        audit_activated = AuditLog.query.filter_by(user_id=user_valid_db.id, action="ACCOUNT_ACTIVATED").first()
        p25 = audit_registered is not None and audit_verified is not None and audit_activated is not None
        log_test(25, "Trazabilidad completa en Bitácora de Auditoría", p25, f"Logs encontrados: {[a.action for a in [audit_registered, audit_verified, audit_activated] if a]}")

        # 20. Rate Limiting por exceso de solicitudes (ejecutado al final para no afectar otros tests)
        rate_limited = False
        with requests.Session() as s:
            for i in range(50):
                try:
                    res_rl = s.post(f"{BASE_URL}/register", json={"email": f"flood_{i}@bienestar.com"})
                    if res_rl.status_code == 429:
                        rate_limited = True
                        break
                except Exception:
                    pass
                time.sleep(0.01)
        log_test(20, "Rate Limiting por exceso de registros (429)", rate_limited, "429 Too Many Requests recibido")

    print("\n" + "="*80)
    passed_count = sum(1 for _, _, p, _ in results if p)
    print(f"RESUMEN FINAL: {passed_count} de {len(results)} PRUEBAS PASARON SATISFACTORIAMENTE ({passed_count/len(results)*100:.1f}%)")
    print("="*80 + "\n")

if __name__ == '__main__':
    run_all_tests()
