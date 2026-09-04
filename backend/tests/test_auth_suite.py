import os
import sys
import uuid
import datetime
import secrets
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.user import User
from app.models.institution import Institution
from app.models.verification_token import EmailVerificationToken
from app.services.email_service import EmailService

# Global app and client for fast testing
_app = create_app()
_app.config['TESTING'] = True

@pytest.fixture(scope='session')
def app():
    return _app

@pytest.fixture(scope='session')
def client(app):
    with app.test_client() as test_client:
        with app.app_context():
            # Setup test user for migueldonis5@gmail.com
            test_email = 'migueldonis5@gmail.com'
            user = User.query.filter_by(email=test_email).first()
            if not user:
                inst = Institution.query.first()
                user = User(
                    email=test_email,
                    first_name='Miguel',
                    last_name='Donis',
                    role='miembro',
                    department='Tecnología',
                    institution_id=inst.id if inst else None,
                    status='ACTIVE',
                    email_verified=True,
                    auth_provider='local'
                )
                user.set_password('Temporal123*')
                db.session.add(user)
                db.session.commit()
            else:
                user.status = 'ACTIVE'
                user.set_password('Temporal123*')
                db.session.commit()

        yield test_client

# ── AUTH-01: Login correcto con credenciales válidas ──
def test_auth_01_login_success(client):
    res = client.post('/api/auth/login', json={
        'email': 'migueldonis5@gmail.com',
        'password': 'Temporal123*',
        'remember_me': True
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'migueldonis5@gmail.com'
    assert data['remember_me'] is True

# ── AUTH-02: Login con contraseña incorrecta ──
def test_auth_02_login_wrong_password(client):
    res = client.post('/api/auth/login', json={
        'email': 'migueldonis5@gmail.com',
        'password': 'PasswordTotalmenteIncorrecta999*'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert 'El correo o la contraseña no son correctos.' in data['message'] or 'Credenciales' in data['message']

# ── AUTH-03: Login con usuario inexistente ──
def test_auth_03_login_nonexistent_user(client):
    res = client.post('/api/auth/login', json={
        'email': 'usuario_que_no_existe_jamas_998877@dominio.com',
        'password': 'CualquierPassword123*'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert 'El correo o la contraseña no son correctos.' in data['message'] or 'Credenciales' in data['message']

# ── AUTH-04 & AUTH-05: Logout y Protección de Rutas ──
def test_auth_04_and_05_route_protection(client):
    # Sin token -> 401
    res_unauth = client.get('/api/auth/me')
    assert res_unauth.status_code == 401

    # Con token válido -> 200
    login_res = client.post('/api/auth/login', json={
        'email': 'migueldonis5@gmail.com',
        'password': 'Temporal123*'
    })
    token = login_res.get_json()['token']
    res_auth = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert res_auth.status_code == 200
    assert res_auth.get_json()['email'] == 'migueldonis5@gmail.com'

# ── AUTH-06: Solicitud de Recuperación de Contraseña ──
def test_auth_06_forgot_password_generates_token(client):
    res = client.post('/api/auth/forgot-password', json={
        'email': 'migueldonis5@gmail.com'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'message' in data

    with _app.app_context():
        user = User.query.filter_by(email='migueldonis5@gmail.com').first()
        latest_token = EmailVerificationToken.query.filter_by(user_id=user.id).order_by(EmailVerificationToken.created_at.desc()).first()
        assert latest_token is not None
        assert latest_token.used_at is None
        assert latest_token.expires_at > datetime.datetime.utcnow()

# ── AUTH-07: Validación de Token Válido ──
def test_auth_07_valid_reset_token_info(client):
    with _app.app_context():
        user = User.query.filter_by(email='migueldonis5@gmail.com').first()
        plain_token = secrets.token_urlsafe(32)
        token_hash = EmailVerificationToken.hash_token(plain_token)
        token_rec = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        )
        db.session.add(token_rec)
        db.session.commit()

    res = client.get(f'/api/auth/reset-password-info?token={plain_token}')
    assert res.status_code == 200
    data = res.get_json()
    assert data['valid'] is True
    assert data['email'] == 'migueldonis5@gmail.com'

# ── AUTH-08: Token Expirado ──
def test_auth_08_expired_reset_token(client):
    with _app.app_context():
        user = User.query.filter_by(email='migueldonis5@gmail.com').first()
        plain_token = secrets.token_urlsafe(32)
        token_hash = EmailVerificationToken.hash_token(plain_token)
        token_rec = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10) # Expirado
        )
        db.session.add(token_rec)
        db.session.commit()

    res = client.get(f'/api/auth/reset-password-info?token={plain_token}')
    assert res.status_code == 400
    data = res.get_json()
    assert data['valid'] is False
    assert 'expirado' in data['message'].lower()

# ── AUTH-09 & AUTH-10: Restablecimiento de Contraseña y Bloqueo de Reutilización ──
def test_auth_09_and_10_reset_confirm_and_single_use(client):
    with _app.app_context():
        user = User.query.filter_by(email='migueldonis5@gmail.com').first()
        plain_token = secrets.token_urlsafe(32)
        token_hash = EmailVerificationToken.hash_token(plain_token)
        token_rec = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        )
        db.session.add(token_rec)
        db.session.commit()

    # Restablecer contraseña a una nueva válida
    new_pass = 'NuevaPassword2026*'
    res = client.post('/api/auth/reset-password-confirm', json={
        'token': plain_token,
        'new_password': new_pass,
        'confirm_password': new_pass
    })
    assert res.status_code == 200

    # AUTH-10: Verificar que la nueva contraseña funciona
    login_new = client.post('/api/auth/login', json={
        'email': 'migueldonis5@gmail.com',
        'password': new_pass
    })
    assert login_new.status_code == 200

    # Verificar que la contraseña anterior ya no funciona
    login_old = client.post('/api/auth/login', json={
        'email': 'migueldonis5@gmail.com',
        'password': 'Temporal123*'
    })
    assert login_old.status_code == 401

    # AUTH-09: Intentar reutilizar el mismo token ya usado
    res_reuse = client.post('/api/auth/reset-password-confirm', json={
        'token': plain_token,
        'new_password': 'OtraPassword2026*',
        'confirm_password': 'OtraPassword2026*'
    })
    assert res_reuse.status_code == 400
    assert 'utilizado' in res_reuse.get_json()['message'].lower() or 'inválido' in res_reuse.get_json()['message'].lower()

# ── AUTH-11 & AUTH-12: Google OAuth Endpoint ──
def test_auth_11_and_12_google_oauth_endpoint(client):
    res_empty = client.post('/api/auth/google', json={})
    assert res_empty.status_code == 400

    res_invalid = client.post('/api/auth/google', json={'credential': 'token_falso_invalido_123'})
    assert res_invalid.status_code == 401

# ── AUTH-13: Finalización de Registro Google con Código Institucional ──
def test_auth_13_google_complete_registration(client):
    from app.models.institution import Institution
    from app.models.invitation import InvitationCode
    from app import db

    inst = Institution.query.first()
    if not inst:
        inst = Institution(name="Universidad Test", domain="univ.test")
        db.session.add(inst)
        db.session.commit()

    inv_code = InvitationCode.query.filter_by(code='TEST-GOOGLE-2026').first()
    if not inv_code:
        inv_code = InvitationCode(
            code='TEST-GOOGLE-2026',
            institution_id=inst.id,
            role='miembro',
            department='Ingeniería'
        )
        db.session.add(inv_code)
        db.session.commit()

    # Caso 1: Términos no aceptados
    res_no_terms = client.post('/api/auth/google/complete-registration', json={
        'email': 'nuevo.google.test@univ.test',
        'first_name': 'Carlos',
        'last_name': 'Gomez',
        'invitation_code': 'TEST-GOOGLE-2026',
        'terms_accepted': False
    })
    assert res_no_terms.status_code == 400
    assert 'términos' in res_no_terms.get_json()['message'].lower()

    # Caso 2: Código inválido
    res_invalid_code = client.post('/api/auth/google/complete-registration', json={
        'email': 'nuevo.google.test@univ.test',
        'first_name': 'Carlos',
        'last_name': 'Gomez',
        'invitation_code': 'CODIGO-TOTALMENTE-INVENTADO-999',
        'terms_accepted': True
    })
    assert res_invalid_code.status_code == 400

    # Caso 3: Registro exitoso con código válido
    res_success = client.post('/api/auth/google/complete-registration', json={
        'email': 'nuevo.google.test@univ.test',
        'first_name': 'Carlos',
        'last_name': 'Gomez',
        'invitation_code': 'TEST-GOOGLE-2026',
        'terms_accepted': True
    })
    assert res_success.status_code == 201
    data = res_success.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'nuevo.google.test@univ.test'
    assert data['user']['auth_provider'] == 'google'

# ── AUTH-15: Permisos y Roles RBAC ──
def test_auth_15_role_permissions(client):
    login_res = client.post('/api/auth/login', json={
        'email': 'migueldonis5@gmail.com',
        'password': 'NuevaPassword2026*'
    })
    member_token = login_res.get_json()['token']

    res_forbidden = client.post('/api/institutions', json={'name': 'Nueva Inst'}, headers={'Authorization': f'Bearer {member_token}'})
    assert res_forbidden.status_code in [403, 401]

# ── AUTH-16: EmailService test directo a migueldonis5@gmail.com ──
def test_auth_16_email_service_dispatch():
    success, msg = EmailService.send_password_reset_email(
        to_email='migueldonis5@gmail.com',
        user_name='Miguel Donis',
        reset_url='http://localhost:5173/restablecer-contrasena/test_token_123'
    )
    assert success is True
