import json
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
    print("Iniciando siembra de base de datos - Tests Precargados y Análisis Multimodal...")
    
    # 1. Crear / Validar tablas
    db.create_all()
    print("[Tablas] Creadas o validadas correctamente.")
    
    # 1.1 Ejecutar migración automática de columnas en PostgreSQL para 'evaluations' y 'reflections'
    try:
        with db.engine.connect() as conn:
            conn.execute(db.text("ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Bienestar Integral'"))
            conn.execute(db.text("ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS questions_json TEXT"))
            conn.execute(db.text("ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE"))
            conn.execute(db.text("ALTER TABLE evaluations ALTER COLUMN institution_id DROP NOT NULL"))
            conn.execute(db.text("ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS assigned_type VARCHAR(50) DEFAULT 'all'"))
            conn.execute(db.text("ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS assigned_target VARCHAR(150)"))
            conn.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(80) DEFAULT 'General'"))
            conn.execute(db.text("ALTER TABLE reflections ADD COLUMN IF NOT EXISTS evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL"))
            conn.commit()
        print("[Migración SQL] Columnas de category, questions_json, is_template, assigned_type, department y evaluation_id agregadas correctamente.")
    except Exception as e:
        print(f"[Migración Warning] {e}")

    # 2. Instituciones demo
    inst_edu = Institution.query.filter_by(name="Universidad Nacional (Demo)").first()
    if not inst_edu:
        inst_edu = Institution(name="Universidad Nacional (Demo)", type="educativa")
        db.session.add(inst_edu)
        db.session.commit()
        
    inst_lab = Institution.query.filter_by(name="Tecnologías del Futuro S.A.").first()
    if not inst_lab:
        inst_lab = Institution(name="Tecnologías del Futuro S.A.", type="laboral")
        db.session.add(inst_lab)
        db.session.commit()

    # 3. Superadmin
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

    # 4. Profesional de Apoyo
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

    # 5. Plantillas Precargadas de Tests Estandarizados (Módulo 4 Multimodal)
    existing_templates = Evaluation.query.filter_by(is_template=True).all()
    if len(existing_templates) == 0:
        # Template 1: Clima Laboral
        q_clima = [
            {"id": "q1", "question": "¿Cómo evalúas el apoyo y colaboración entre tus compañeros de equipo?", "type": "scale_1_5"},
            {"id": "q2", "question": "¿Sientes que la exigencia de las tareas es razonable respecto al tiempo?", "type": "scale_1_5"},
            {"id": "q3", "question": "¿Qué tan valorado(a) te sientes dentro del ambiente de la institución?", "type": "scale_1_5"},
            {"id": "q4", "question": "Redacta tus sugerencias o vivencias sobre el clima laboral/académico actual.", "type": "text"}
        ]
        t1 = Evaluation(
            title="[Plantilla] Test de Clima Laboral y Entorno Institucional",
            description="Evaluación estándar para medir exigencias emocionales, relaciones de equipo y reconocimiento.",
            category="Clima Laboral",
            questions_json=json.dumps(q_clima),
            is_active=True,
            is_template=True,
            institution_id=inst_edu.id
        )

        # Template 2: Ánimo Personal
        q_animo = [
            {"id": "q1", "question": "¿Con qué frecuencia has sentido tensión o nerviosismo en los últimos días?", "type": "scale_1_5"},
            {"id": "q2", "question": "¿Cómo calificarías la calidad de tu descanso y ritmo de sueño?", "type": "scale_1_5"},
            {"id": "q3", "question": "¿Qué tan optimista te sientes respecto a tu energía y vitalidad diaria?", "type": "scale_1_5"},
            {"id": "q4", "question": "Describe cualquier preocupación recurrente que haya afectado tu tranquilidad.", "type": "text"}
        ]
        t2 = Evaluation(
            title="[Plantilla] Chequeo de Estado de Ánimo y Ansiedad Personal",
            description="Cuestionario enfocado en la salud mental individual, hábitos de sueño y niveles de fatiga.",
            category="Ánimo Personal",
            questions_json=json.dumps(q_animo),
            is_active=True,
            is_template=True,
            institution_id=inst_edu.id
        )

        # Template 3: Bienestar Multimodal Integral
        q_integral = [
            {"id": "q1", "question": "En una escala de 1 a 5, ¿cuál es tu nivel general de satisfacción actual?", "type": "scale_1_5"},
            {"id": "q2", "question": "¿Qué tan equilibrado percibes tu balance entre actividades y tiempo libre?", "type": "scale_1_5"},
            {"id": "q3", "question": "¿Qué tan preparado(a) te sientes para resolver los retos de la próxima semana?", "type": "scale_1_5"},
            {"id": "q4", "question": "Redacción Multimodal Libre: Describe abiertamente tu sentir para el análisis de IA.", "type": "text"}
        ]
        t3 = Evaluation(
            title="[Plantilla] Evaluación Multimodal de Bienestar Integral",
            description="Mapeo completo de adaptación, resiliencia y satisfacción con análisis por Gemini AI.",
            category="Bienestar Integral",
            questions_json=json.dumps(q_integral),
            is_active=True,
            is_template=True,
            institution_id=inst_edu.id
        )

        db.session.add(t1)
        db.session.add(t2)
        db.session.add(t3)
        db.session.commit()
        print("[Tests Precargados] 3 plantillas estandarizadas sembradas correctamente.")

    # 6. Miembro demo
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

        # Alerta demo
        ref = Reflection(
            user_id=member_user.id,
            institution_id=inst_edu.id,
            original_text="Me siento sumamente agotado y presionado por los parciales. Siento que la sobrecarga del entorno laboral y académico es insoportable esta semana.",
            stress_score=88,
            motivation_score=15,
            burnout_score=92,
            dominant_sentiment="Negativo",
            institution_suggestion="Canalizar al estudiante para brindar orientación en manejo del tiempo y descansos."
        )
        db.session.add(ref)
        db.session.commit()

        alert = Alert(
            user_id=member_user.id,
            reflection_id=ref.id,
            institution_id=inst_edu.id,
            priority="Alta",
            status="pendiente"
        )
        db.session.add(alert)
        db.session.commit()

    print("[ÉXITO] ¡Siembra de base de datos con Tests Precargados finalizada!")
