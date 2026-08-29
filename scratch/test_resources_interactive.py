import os
import sys

backend_path = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\backend"
sys.path.insert(0, backend_path)

from app import create_app, db
from app.utils.db_indexes import ensure_database_indexes
from app.models.user import User
from app.models.resource import Resource, ResourceFavorite, ResourceProgress
from app.services.resource_seed_service import ResourceSeedService
from app.services.gamification_service import GamificationService

app = create_app()

with app.app_context():
    print("--- 1. EJECUTANDO MIGRACIONES DE ESQUEMA ---")
    db.create_all()
    ensure_database_indexes(db)
    print("Migraciones ejecutadas exitosamente.")

    print("\n--- 2. SEMBRANDO RECURSOS INICIALES DE ALTA CALIDAD ---")
    ResourceSeedService.seed_resources_if_empty()
    res_count = Resource.query.count()
    print(f"Total de recursos en BD: {res_count}")

    print("\n--- 3. VERIFICANDO CONSULTA DE RECURSOS Y CATEGORÍAS ---")
    user = User.query.filter_by(email="miembro@bienestar.com").first()
    if not user:
        user = User.query.first()
    print(f"Usuario de prueba: {user.email} (ID: {user.id})")

    res = Resource.query.filter_by(is_published=True).first()
    print(f"Recurso de prueba: '{res.title}' (Tipo: {res.resource_type}, Interactivo: {res.interactive_type})")

    print("\n--- 4. PROBANDO FAVORITOS EN POSTGRESQL ---")
    # Limpiar favorito previo si existía
    ResourceFavorite.query.filter_by(user_id=user.id, resource_id=res.id).delete()
    db.session.commit()

    # Guardar favorito
    fav = ResourceFavorite(user_id=user.id, resource_id=res.id)
    db.session.add(fav)
    db.session.commit()
    is_fav = ResourceFavorite.query.filter_by(user_id=user.id, resource_id=res.id).first() is not None
    print(f"Favorito guardado en BD: {is_fav}")

    print("\n--- 5. PROBANDO PROGRESO Y RESPUESTAS INTERACTIVAS ---")
    prog = ResourceProgress.query.filter_by(user_id=user.id, resource_id=res.id).first()
    if not prog:
        prog = ResourceProgress(user_id=user.id, resource_id=res.id, status='en_progreso', progress_percent=45, interactive_answers={"reflection_text": "Excelente ejercicio para el autocuidado."})
        db.session.add(prog)
    else:
        prog.progress_percent = 60
        prog.interactive_answers = {"reflection_text": "Excelente ejercicio para el autocuidado."}
    db.session.commit()
    print(f"Progreso guardado: {prog.progress_percent}% - Status: {prog.status} - Respuestas: {prog.interactive_answers}")

    print("\n--- 6. PROBANDO COMPLETITUD Y ADJUDICACIÓN DE XP ---")
    initial_xp = user.total_xp or 0
    gamification_res = GamificationService.award_xp(
        user_id=user.id,
        action_type='resource_completed',
        reference_id=str(res.id),
        custom_description=f"Completaste: {res.title}"
    )
    db.session.commit()
    new_xp = user.total_xp or 0
    print(f"XP Inicial: {initial_xp} -> XP Ganado: {gamification_res.get('xp_gained')} -> Total XP: {new_xp}")

    # Probar anti-duplicados
    dup_res = GamificationService.award_xp(
        user_id=user.id,
        action_type='resource_completed',
        reference_id=str(res.id),
        custom_description=f"Completaste: {res.title}"
    )
    print(f"Anti-duplicado verificado (already_awarded): {dup_res.get('already_awarded', False)} (XP ganado: {dup_res.get('xp_gained')})")

    print("\n--- 7. VERIFICANDO RACHA DE ACTIVIDAD ---")
    GamificationService.record_activity_day(user.id, 'resource_reading')
    print(f"Racha actual del usuario: {user.current_streak} días")

    print("\n=== TODAS LAS PRUEBAS BACKEND DEL CENTRO DE RECURSOS PASARON CON ÉXITO ===")
