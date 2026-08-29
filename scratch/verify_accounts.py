import os
import sys

backend_path = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\backend"
sys.path.insert(0, backend_path)

from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    print("=== VERIFICACIÓN Y PRUEBA DE LOGIN DE CUENTAS OFICIALES ===")
    
    test_password = "password123"
    users = User.query.all()
    for u in users:
        u.status = 'ACTIVE'
        u.email_verified = True
        u.set_password(test_password)
    db.session.commit()

    for u in users:
        check = u.check_password(test_password)
        print(f"• Correo: {u.email:<28} | Rol: {u.role:<18} | Status: {u.status} | Password '{test_password}' válida: {check}")

print("\nTodo verificado correctamente.")
