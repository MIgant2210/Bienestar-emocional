import json, urllib.request, time
payload = json.dumps({'email':'superadmin@bienestar.com','password':'AdminBienestar2026*'}).encode()
req = urllib.request.Request('http://localhost:5000/api/auth/login', data=payload, headers={'Content-Type':'application/json'}, method='POST')
t = time.time()
with urllib.request.urlopen(req, timeout=15) as r:
    body = r.read().decode()
    print(r.status)
    print(body)
    print('elapsed', round(time.time()-t, 3))
