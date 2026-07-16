from app import create_app, db
from app.models.institution import Institution
from app.models.user import User
from app.models.task_model import Task
from app.models.evaluation import Evaluation
from app.models.reflection import Reflection
from app.models.alert import Alert
from app.models.audit_log import AuditLog
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Iniciando siembra de base de datos (Database Seeding) - Fase 3...")
    
    # 1. Crear tablas si no existen (incluyendo todas las nuevas tablas)
    db.create_all()
    print("[Tablas] Creadas o validadas correctamente.")
    
    # 2. Obtener o crear instituciones de demostración
    inst_edu = Institution.query.filter_by(name="Universidad Nacional (Demo)").first()
    if not inst_edu:
        inst_edu = Institution(name="Universidad Nacional (Demo)", type="educativa")
        db.session.add(inst_edu)
        db.session.commit()
        print("[Institución] Creada: Universidad Nacional (Demo)")
        
    inst_lab = Institution.query.filter_by(name="Tecnologías del Futuro S.A.").first()
    if not inst_lab:
        inst_lab = Institution(name="Tecnologías del Futuro S.A.", type="laboral")
        db.session.add(inst_lab)
        db.session.commit()
        print("[Institución] Creada: Tecnologías del Futuro S.A.")
        
    # 3. Obtener o crear Super Administrador
    admin_email = "superadmin@bienestar.com"
    super_admin = User.query.filter_by(email=admin_email).first()
    if not super_admin:
        super_admin = User(
            email=admin_email,
            first_name="Administrador",
            last_name="General",
            role="superadmin",
            institution_id=inst_edu.id
        )
        super_admin.set_password("AdminBienestar2026*")
        db.session.add(super_admin)
        db.session.commit()
        print(f"[Usuario] Superadmin creado exitosamente.")
    else:
        if not super_admin.institution_id:
            super_admin.institution_id = inst_edu.id
            db.session.commit()
        print("[Usuario] El Superadmin ya existe.")

    # 4. Crear Profesional de Apoyo
    prof_email = "profesional@bienestar.com"
    prof_user = User.query.filter_by(email=prof_email).first()
    if not prof_user:
        prof_user = User(
            email=prof_email,
            first_name="Sofía",
            last_name="Gómez",
            role="profesional_apoyo",
            institution_id=inst_edu.id
        )
        prof_user.set_password("ProfBienestar2026*")
        db.session.add(prof_user)
        db.session.commit()
        print(f"[Usuario] Profesional de Apoyo creado exitosamente (Sofía Gómez).")
    else:
        print("[Usuario] El Profesional de Apoyo ya existe.")

    # 5. Crear Cuestionarios / Evaluaciones iniciales
    if Evaluation.query.count() == 0:
        eval1 = Evaluation(
            title="Encuesta de Bienestar Inicial (Ciclo 2026)",
            description="Cuestionario obligatorio para diagnosticar los niveles generales de adaptación académica.",
            is_active=True,
            scheduled_date=datetime.utcnow() + timedelta(days=2),
            institution_id=inst_edu.id
        )
        eval2 = Evaluation(
            title="Test de Sobrecarga Mental y Estrés",
            description="Medición periódica recomendada durante la época de exámenes parciales.",
            is_active=True,
            scheduled_date=datetime.utcnow() + timedelta(days=15),
            institution_id=inst_edu.id
        )
        db.session.add(eval1)
        db.session.add(eval2)
        db.session.commit()
        print("[Evaluaciones] Cuestionarios iniciales creados exitosamente.")
    else:
        print("[Evaluaciones] Ya existen cuestionarios.")

    # 6. Crear algunas tareas si la tabla está vacía
    if Task.query.count() == 0:
        demo_tasks = [
            Task(
                title="Pausa activa de respiración consciente",
                description="Tómate 5 minutos para sentarte erguido, respirar profundo inhalando en 4 tiempos y exhalando en 4 tiempos.",
                category="Bienestar",
                due_date=datetime.utcnow() + timedelta(days=1),
                institution_id=inst_edu.id,
                created_by=super_admin.id
            ),
            Task(
                title="Completar autoevaluación semanal de avance",
                description="Entrega un pequeño resumen de las actividades académicas completadas y los bloqueos experimentados.",
                category="Académica",
                due_date=datetime.utcnow() + timedelta(days=3),
                institution_id=inst_edu.id,
                created_by=super_admin.id
            )
        ]
        for task in demo_tasks:
            db.session.add(task)
        db.session.commit()
        print("[Tareas] Tareas demo creadas.")

    # 7. Crear un miembro demo, una reflexión con riesgo alto y una alerta para el profesional de apoyo
    member_email = "miembro@bienestar.com"
    member_user = User.query.filter_by(email=member_email).first()
    if not member_user:
        member_user = User(
            email=member_email,
            first_name="Juan",
            last_name="Pérez",
            role="miembro",
            institution_id=inst_edu.id
        )
        member_user.set_password("Miembro123*")
        db.session.add(member_user)
        db.session.commit()
        print("[Usuario] Miembro demo creado (Juan Pérez).")
        
        # Guardar reflexión con alta carga de estrés
        ref = Reflection(
            user_id=member_user.id,
            institution_id=inst_edu.id,
            original_text="Me siento sumamente deprimido y agotado, la presión de entregar el proyecto final esta semana es insoportable y siento que ya no puedo con nada más. No puedo dormir y me siento muy solo.",
            stress_score=90,
            motivation_score=10,
            burnout_score=95,
            dominant_sentiment="Negativo",
            institution_suggestion="Canalizar urgentemente al miembro con un especialista para soporte emocional individual."
        )
        db.session.add(ref)
        db.session.commit()
        
        # Crear la alerta de riesgo para el profesional de apoyo
        alert = Alert(
            user_id=member_user.id,
            reflection_id=ref.id,
            institution_id=inst_edu.id,
            priority="Alta",
            status="pendiente"
        )
        db.session.add(alert)
        db.session.commit()
        print("[Alertas] Alerta demo de riesgo alto registrada exitosamente.")
    else:
        print("[Usuario] El Miembro demo ya existe.")

    # 8. Guardar registros de auditoría iniciales
    if AuditLog.query.count() == 0:
        logs = [
            AuditLog(action="SYSTEM_INIT", details="Inicialización global del sistema SOMA MindTech", ip_address="127.0.0.1"),
            AuditLog(action="SEED_DB", details="Siembra inicial de base de datos completada exitosamente", ip_address="127.0.0.1")
        ]
        for log in logs:
            db.session.add(log)
        db.session.commit()
        print("[Auditoría] Logs iniciales guardados.")

    print("\n[ÉXITO] ¡Siembra e inicialización completa de la Fase 3 finalizada!")
