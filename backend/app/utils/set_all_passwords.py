import sys
import os

# Permitir importaciones del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app import create_app, db
from app.models.user import User

def set_all_passwords_to_target(target_password="Miguel2210"):
    app = create_app()
    with app.app_context():
        print(f"Buscando todos los usuarios en la base de datos para establecer la clave: '{target_password}'...")
        users = User.query.all()
        if not users:
            print("No se encontraron usuarios en la base de datos.")
            return

        count = 0
        for u in users:
            u.set_password(target_password)
            count += 1
            print(f"[OK] Contraseña actualizada para: {u.email} (Rol: {u.role})")

        db.session.commit()
        print(f"\n¡ÉXITO! Se actualizaron las contraseñas de los {count} usuarios a '{target_password}'.")

if __name__ == "__main__":
    set_all_passwords_to_target("Miguel2210")
