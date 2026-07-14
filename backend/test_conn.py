import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()
db_url = os.environ.get("DATABASE_URL")
print(f"URL de conexión cargada: {db_url}")

try:
    print("\nIntentando conexión estándar sin parámetros SSL...")
    conn = psycopg2.connect(db_url, connect_timeout=3)
    print("[ÉXITO] Conexión estándar exitosa.")
    conn.close()
except Exception as e:
    print(f"[FALLA] Conexión estándar falló: {e}")
    
try:
    print("\nIntentando conexión con sslmode='require'...")
    conn = psycopg2.connect(db_url, sslmode='require', connect_timeout=3)
    print("[ÉXITO] Conexión con sslmode='require' exitosa.")
    conn.close()
except Exception as e:
    print(f"[FALLA] Conexión con sslmode='require' falló: {e}")
    
try:
    print("\nIntentando conexión con sslmode='prefer'...")
    conn = psycopg2.connect(db_url, sslmode='prefer', connect_timeout=3)
    print("[ÉXITO] Conexión con sslmode='prefer' exitosa.")
    conn.close()
except Exception as e:
    print(f"[FALLA] Conexión con sslmode='prefer' falló: {e}")
