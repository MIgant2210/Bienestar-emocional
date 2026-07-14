import psycopg2
import itertools

host = "bzfa2i7alorrrdbmyc3b-postgresql.services.clever-cloud.com"
port = 50013
dbname = "bzfa2i7alorrrdbmyc3b"

# Username template: up4eaytxfdk[U1]9yqtpz[U2]q
# Password template: CSQLTzAv[P1]H[P2]TCf[P3]MyDpxmHjLBU[P4]nXf

options_lI1 = ['l', 'I', '1']
options_O0 = ['O', '0']

combinations = list(itertools.product(
    options_lI1, # U1
    options_lI1, # U2
    options_O0,  # P1 (first O/0)
    options_O0,  # P2 (second O/0)
    options_lI1, # P3 (first l/I/1)
    options_lI1  # P4 (second l/I/1)
))

print(f"Probando {len(combinations)} combinaciones cruzadas de usuario y contraseña...")

found = False
for u1, u2, p1, p2, p3, p4 in combinations:
    user = f"up4eaytxfdk{u1}9yqtpz{u2}q"
    pwd = f"CSQLTzAv{p1}H{p2}TCf{p3}MyDpxmHjLBU{p4}nXf"
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=pwd,
            dbname=dbname,
            connect_timeout=1
        )
        print(f"\n[ÉXITO TOTAL] ¡Conexión establecida!")
        print(f"Usuario correcto: {user} (U1={u1}, U2={u2})")
        print(f"Contraseña correcta: {pwd} (P1={p1}, P2={p2}, P3={p3}, P4={p4})")
        conn.close()
        found = True
        break
    except Exception as e:
        # Solo omitimos el error común de auth failed para no llenar la consola,
        # pero si hay otro tipo de error lo mostramos.
        err = str(e).strip()
        if "authentication failed" not in err:
            print(f"U={user}, P={pwd} | Error diferente: {err}")

if not found:
    print("\n[FALLA] Ninguna combinación funcionó. Verifique si la base de datos está activa o si las credenciales en la imagen tienen algún otro carácter.")
