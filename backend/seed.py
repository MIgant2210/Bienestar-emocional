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
            conn.execute(db.text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_type VARCHAR(30) DEFAULT 'all'"))
            conn.execute(db.text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_target VARCHAR(150)"))
            conn.execute(db.text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Media'"))
            conn.execute(db.text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 15"))
            conn.execute(db.text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_notes TEXT"))
            conn.execute(db.text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP"))
            conn.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(80) DEFAULT 'General'"))
            conn.execute(db.text("ALTER TABLE reflections ADD COLUMN IF NOT EXISTS evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL"))
            conn.execute(db.text("ALTER TABLE reflections ADD COLUMN IF NOT EXISTS clinical_notes TEXT"))
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
        db.session.add(super_admin)
    super_admin.set_password("AdminBienestar2026*")
    db.session.commit()

    # 4. Profesional de Apoyo (Psicóloga)
    prof_email = "profesional@bienestar.com"
    prof_user = User.query.filter_by(email=prof_email).first()
    if not prof_user:
        prof_user = User(
            email=prof_email,
            first_name="Sofía",
            last_name="Gómez",
            role="profesional_apoyo",
            department="Salud",
            institution_id=inst_edu.id
        )
        db.session.add(prof_user)
    prof_user.set_password("ProfBienestar2026*")
    db.session.commit()

    # 5. Líder de Departamento
    lider_email = "lider@bienestar.com"
    lider_user = User.query.filter_by(email=lider_email).first()
    if not lider_user:
        lider_user = User(
            email=lider_email,
            first_name="Carlos",
            last_name="Mendoza",
            role="lider_depto",
            department="Tecnología",
            institution_id=inst_edu.id
        )
        db.session.add(lider_user)
    lider_user.set_password("LiderBienestar2026*")
    db.session.commit()

    # 6. Colaborador / Miembro Demo
    member_email = "miembro@bienestar.com"
    member_user = User.query.filter_by(email=member_email).first()
    if not member_user:
        member_user = User(
            email=member_email,
            first_name="Ana",
            last_name="Martínez",
            role="miembro",
            department="Tecnología",
            institution_id=inst_edu.id
        )
        db.session.add(member_user)
    member_user.set_password("MiembroBienestar2026*")
    db.session.commit()

    # 5. Plantillas Precargadas de Tests Estandarizados (Módulo 4 Multimodal)
    Evaluation.query.filter_by(is_template=True).delete()
    db.session.commit()

    # Template 1: Clima Laboral y Entorno Institucional
    q_clima = [
        {"id": "q1", "question": "¿Cómo evalúas la comunicación y apoyo de tus superiores o docentes?", "type": "scale_1_5"},
        {"id": "q2", "question": "En una escala del 1 al 10, ¿qué tan manejable percibes tu carga de trabajo actual?", "type": "scale_1_10"},
        {"id": "q3", "question": "Selecciona con emojis tu nivel de ánimo durante las reuniones de esta semana:", "type": "emoji_scale_5"},
        {"id": "q4", "question": "¿Sientes que dispones de las herramientas necesarias para desarrollar tus labores diarias?", "type": "boolean"},
        {"id": "q5", "question": "¿Qué tan satisfecho(a) te encuentras con la flexibilidad y el respeto a tu tiempo personal?", "type": "scale_1_5"},
        {"id": "q6", "question": "Dictado por Voz / Texto Libre: Expresa tus sugerencias o vivencias sobre el clima laboral actual.", "type": "text"}
    ]
    t1 = Evaluation(
        title="[Plantilla] Evaluación Exhaustiva de Clima Laboral y Entorno",
        description="Encuesta completa para medir comunicación, balance de tiempo, herramientas de trabajo y reconocimiento.",
        category="Clima Laboral",
        questions_json=json.dumps(q_clima),
        is_active=True,
        is_template=True,
        institution_id=inst_edu.id
    )

    # Template 2: Ánimo Personal y Salud Emocional
    q_animo = [
        {"id": "q1", "question": "¿Con qué frecuencia has experimentado tensión física, rigidez o nerviosismo esta semana?", "type": "scale_1_5"},
        {"id": "q2", "question": "En una escala del 1 al 10, ¿cómo calificarías tu calidad de descanso y energía matutina?", "type": "scale_1_10"},
        {"id": "q3", "question": "¿Cómo calificarías tu estado de ánimo emocional general usando los emojis?", "type": "emoji_scale_5"},
        {"id": "q4", "question": "¿Has sentido momentos de desconexión o desmotivación profunda recientemente?", "type": "boolean"},
        {"id": "q5", "question": "¿Logras mantener pausas activas durante tus jornadas diarias?", "type": "boolean"},
        {"id": "q6", "question": "Reflexión Dictada / Escrita: Describe libremente cualquier inquietud o emoción relevante de tu semana.", "type": "text"}
    ]
    t2 = Evaluation(
        title="[Plantilla] Chequeo Integral de Salud Emocional y Ritmo de Vida",
        description="Diagnóstico estandarizado de niveles de fatiga, calidad del sueño, ansiedad y resiliencia.",
        category="Ánimo Personal",
        questions_json=json.dumps(q_animo),
        is_active=True,
        is_template=True,
        institution_id=inst_edu.id
    )

    # Template 3: Bienestar Multimodal Integral
    q_integral = [
        {"id": "q1", "question": "En una escala del 1 al 5, ¿cuál es tu índice general de bienestar y equilibrio personal?", "type": "scale_1_5"},
        {"id": "q2", "question": "Del 1 al 10, ¿qué tan integrado y valorado te sientes en la comunidad de la institución?", "type": "scale_1_10"},
        {"id": "q3", "question": "Selecciona el emoji de WhatsApp que mejor represente tu nivel de paz interna:", "type": "emoji_scale_5"},
        {"id": "q4", "question": "¿Recomendarías a un colega o compañero formar parte de este equipo?", "type": "boolean"},
        {"id": "q5", "question": "¿Sientes que tus opiniones y sugerencias son escuchadas con seriedad?", "type": "boolean"},
        {"id": "q6", "question": "Espacio Multimodal Libre: Graba tu voz o redacta tus comentarios para el análisis con IA.", "type": "text"}
    ]
    t3 = Evaluation(
        title="[Plantilla] Diagnóstico Multimodal de Bienestar Institucional 360°",
        description="Cuestionario amplio de adaptación cultural, pertenencia y salud integral procesado por Gemini AI.",
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
    print("[Tests Precargados] 3 plantillas estandarizadas ampliadas sembradas correctamente.")

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
