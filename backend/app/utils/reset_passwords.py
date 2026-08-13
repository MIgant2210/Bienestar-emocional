import sys
import os

# Permitir importaciones del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app import create_app, db
from app.models.user import User
from app.models.institution import Institution

def seed_and_reset_users():
  app = create_app()
  with app.app_context():
    print("Inicializando esquemas de tablas en Supabase con db.create_all()...")
    db.create_all()
    print("Verificando / Restableciendo cuentas por defecto para pruebas...")
    
    # 1. Asegurar Institución por defecto
    inst = Institution.query.filter_by(name="Institución Central EquilibrIA").first()
    if not inst:
      inst = Institution(name="Institución Central EquilibrIA", type="educativa")
      db.session.add(inst)
      db.session.commit()
      print(f"Institución creada con ID: {inst.id}")

    users_to_ensure = [
      {
        "email": "superadmin@bienestar.com",
        "first_name": "Super",
        "last_name": "Administrador",
        "role": "superadmin",
        "password": "superadmin123",
        "institution_id": inst.id
      },
      {
        "email": "admin@bienestar.com",
        "first_name": "Carlos",
        "last_name": "Mendoza (Admin)",
        "role": "admin_institucion",
        "password": "admin123",
        "institution_id": inst.id
      },
      {
        "email": "lider@bienestar.com",
        "first_name": "Laura",
        "last_name": "Gómez (Líder)",
        "role": "lider_depto",
        "password": "lider123",
        "department": "Tecnología",
        "institution_id": inst.id
      },
      {
        "email": "psicologa@bienestar.com",
        "first_name": "Dra. Sofía",
        "last_name": "Ramírez (Psicóloga)",
        "role": "profesional_apoyo",
        "password": "psico123",
        "department": "Salud",
        "institution_id": inst.id
      },
      {
        "email": "colaborador@bienestar.com",
        "first_name": "Mateo",
        "last_name": "Fernández",
        "role": "miembro",
        "password": "123456",
        "department": "Tecnología",
        "institution_id": inst.id
      }
    ]

    for u_data in users_to_ensure:
      user = User.query.filter_by(email=u_data["email"]).first()
      if not user:
        user = User(
          email=u_data["email"],
          first_name=u_data["first_name"],
          last_name=u_data["last_name"],
          role=u_data["role"],
          department=u_data.get("department", "General"),
          institution_id=u_data["institution_id"]
        )
        db.session.add(user)
      else:
        user.first_name = u_data["first_name"]
        user.last_name = u_data["last_name"]
        user.role = u_data["role"]
        user.institution_id = u_data["institution_id"]

      user.set_password(u_data["password"])
      print(f"[OK] Usuario actualizado: {u_data['email']} | Rol: {u_data['role']} | Clave: {u_data['password']}")

    db.session.commit()
    print("Todas las cuentas han sido restablecidas exitosamente.")

if __name__ == "__main__":
  seed_and_reset_users()
