import psycopg2
import itertools

host = "bzfa2i7alorrrdbmyc3b-postgresql.services.clever-cloud.com"
port = 50013
user = "up4eaytxfdkl9yqtpzlq"
dbname = "bzfa2i7alorrrdbmyc3b"

# Plantilla de contraseña con marcadores para los caracteres ambiguos
# CSQLTzAvOH0TCf[1]MyDpxmHjLBU[2]nXf
options = ['l', 'I', '1']

combinations = list(itertools.product(options, options))

print(f"Probando {len(combinations)} combinaciones de contraseñas...")

for opt1, opt2 in combinations:
    pwd = f"CSQLTzAvOH0TCf{opt1}MyDpxmHjLBU{opt2}nXf"
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=pwd,
            dbname=dbname,
            connect_timeout=3
        )
        print(f"\n[ÉXITO] ¡Conectado! La combinación correcta es:")
        print(f"Posición 1: {opt1}, Posición 2: {opt2}")
        print(f"Contraseña: {pwd}")
        conn.close()
        break
    except Exception as e:
        print(f"Falló con P1={opt1}, P2={opt2} | Error: {str(e).strip()}")
