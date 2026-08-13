import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

db_url = os.environ.get("DATABASE_URL")
if db_url:
    # Ocultar contraseña en el print
    try:
        connection_part = db_url.split('@')[1]
        print(f"Intentando conectar a: {connection_part}")
    except IndexError:
        print("Intentando conectar a base de datos...")
else:
    print("ERROR: DATABASE_URL no encontrada en el entorno.")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    db_version = cur.fetchone()
    print("\n[ÉXITO] ¡Conexión a la base de datos de Supabase establecida correctamente!")
    print(f"Versión de PostgreSQL: {db_version[0]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"\n[ERROR] No se pudo conectar a la base de datos: {str(e)}")
