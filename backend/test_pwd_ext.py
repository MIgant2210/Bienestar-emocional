import psycopg2
import itertools

host = "bzfa2i7alorrrdbmyc3b-postgresql.services.clever-cloud.com"
port = 50013
user = "up4eaytxfdkl9yqtpzlq"
dbname = "bzfa2i7alorrrdbmyc3b"

# CSQLTzAv[P1]H[P2]TCf[P3]MyDpxmHjLBU[P4]nXf
options_O0 = ['O', '0']
options_lI1 = ['l', 'I', '1']

combinations = list(itertools.product(options_O0, options_O0, options_lI1, options_lI1))

print(f"Probando {len(combinations)} combinaciones extendidas...")

for p1, p2, p3, p4 in combinations:
    pwd = f"CSQLTzAv{p1}H{p2}TCf{p3}MyDpxmHjLBU{p4}nXf"
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=pwd,
            dbname=dbname,
            connect_timeout=2
        )
        print(f"\n[ÉXITO] ¡Conectado! La combinación correcta es:")
        print(f"P1 (O/0): {p1}, P2 (O/0): {p2}, P3 (l/I/1): {p3}, P4 (l/I/1): {p4}")
        print(f"Contraseña: {pwd}")
        conn.close()
        break
    except Exception as e:
        # Imprimir para ver si hay algún error diferente de auth failed
        err_msg = str(e).strip().replace('\n', ' ')
        if "authentication failed" not in err_msg:
            print(f"P1={p1}, P2={p2}, P3={p3}, P4={p4} | Otro Error: {err_msg}")
        # Descomentar la siguiente línea si queremos depurar todas las fallas
        # print(f"Falló: P1={p1}, P2={p2}, P3={p3}, P4={p4}")
