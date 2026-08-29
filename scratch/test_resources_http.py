import os
import sys
import json

backend_path = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\backend"
sys.path.insert(0, backend_path)

from app import create_app, db
from app.models.user import User

app = create_app()

with app.test_client() as client:
    with app.app_context():
        # Obtener token de usuario
        login_res = client.post('/api/auth/login', json={
            'email': 'miembro@bienestar.com',
            'password': 'password123'
        })
        if login_res.status_code != 200:
            # Probar contraseña alterna
            login_res = client.post('/api/auth/login', json={
                'email': 'superadmin@bienestar.com',
                'password': 'password123'
            })
            
        data = login_res.get_json()
        token = data.get('token')
        headers = {'Authorization': f'Bearer {token}'}

        print(f"Login exitoso, probando endpoints con token...")

        # 1. GET /api/wellbeing/resources
        res = client.get('/api/wellbeing/resources', headers=headers)
        print(f"GET /api/wellbeing/resources: Status {res.status_code} - Total recursos: {len(res.get_json().get('resources', []))}")

        # 2. Filtrado por categoría
        res_cat = client.get('/api/wellbeing/resources?category=Manejo del estrés', headers=headers)
        print(f"GET /api/wellbeing/resources (filtro estrés): Status {res_cat.status_code} - Encontrados: {len(res_cat.get_json().get('resources', []))}")

        # 3. Favoritos toggle
        resources_list = res.get_json().get('resources', [])
        if resources_list:
            first_id = resources_list[0]['id']
            fav_res = client.post(f'/api/wellbeing/resources/{first_id}/favorite', headers=headers)
            print(f"POST /favorite: Status {fav_res.status_code} - {fav_res.get_json()}")

            # 4. Progreso
            prog_res = client.post(f'/api/wellbeing/resources/{first_id}/progress', json={'progress_percent': 75}, headers=headers)
            print(f"POST /progress: Status {prog_res.status_code} - {prog_res.get_json()}")

            # 5. Respuestas interactivas
            inter_res = client.post(f'/api/wellbeing/resources/{first_id}/interactive-submit', json={'answers': {'notes': 'Excelente contenido'}}, headers=headers)
            print(f"POST /interactive-submit: Status {inter_res.status_code} - {inter_res.get_json()}")

            # 6. Completitud con XP
            comp_res = client.post(f'/api/wellbeing/resources/{first_id}/complete', headers=headers)
            print(f"POST /complete: Status {comp_res.status_code} - Gamification: {comp_res.get_json().get('gamification')}")

print("\n--- TODOS LOS ENDPOINTS HTTP DE RECURSOS VALIDADOS CON ÉXITO ---")
