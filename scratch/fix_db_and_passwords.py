import os
import sys

backend_path = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\backend"
sys.path.insert(0, backend_path)

from app import create_app, db
from app.models.user import User
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    # 1. Terminar conexiones bloqueadas o en espera en PostgreSQL
    try:
        with db.engine.begin() as conn:
            conn.execute(text("""
                SELECT pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE pid <> pg_backend_pid() 
                  AND datname = current_database() 
                  AND (state = 'idle in transaction' OR wait_event_type = 'Lock');
            """))
            print("[DB] Conexiones bloqueadas finalizadas.")
    except Exception as e:
        print(f"[DB Warning] {e}")

    # 2. Migrar columnas de resources de forma limpia con inspection
    inspector = inspect(db.engine)
    if inspector.has_table('resources'):
        existing_cols = {c['name'] for c in inspector.get_columns('resources')}
        col_definitions = {
            'level': "VARCHAR(30) DEFAULT 'principiante'",
            'tags': "VARCHAR(250) DEFAULT ''",
            'source_url': "VARCHAR(300)",
            'source_institution': "VARCHAR(150)",
            'xp_reward': "INTEGER DEFAULT 15",
            'counts_for_streak': "BOOLEAN DEFAULT TRUE",
            'allow_ai_recommendation': "BOOLEAN DEFAULT TRUE",
            'interactive_type': "VARCHAR(50) DEFAULT 'none'",
            'interactive_data': "JSON",
            'media_url': "VARCHAR(400)",
            'updated_at': "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        }
        with db.engine.begin() as conn:
            for col, col_def in col_definitions.items():
                if col not in existing_cols:
                    conn.execute(text(f"ALTER TABLE resources ADD COLUMN {col} {col_def}"))
                    print(f"[SCHEMA] Agregada columna '{col}' a la tabla resources.")

    # 3. Crear tablas de favoritos y progreso si no existen
    db.create_all()

    # 4. Verificar usuarios y resetear credenciales oficiales a valores conocidos
    users = User.query.all()
    print(f"\n--- USUARIOS EN BASE DE DATOS ({len(users)}) ---")
    
    standard_password = "password123"
    for u in users:
        # Asegurar status ACTIVE y email verificado
        u.status = 'ACTIVE'
        u.email_verified = True
        u.set_password(standard_password)
        print(f"• {u.email} | Rol: {u.role} | Status: {u.status} | Contraseña seteada: '{standard_password}'")
    
    db.session.commit()
    print(f"\n[ÉXITO] Todas las cuentas oficiales tienen la contraseña: '{standard_password}'")
