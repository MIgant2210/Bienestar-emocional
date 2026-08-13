import json
from app import create_app, db
from app.models.institution import Institution
from app.models.user import User
from app.models.task_model import Task
from app.models.evaluation import Evaluation
from app.models.reflection import Reflection
from app.models.alert import Alert
from app.models.audit_log import AuditLog
from app.models.reward import Reward
from app.models.kudos import Kudos
from app.utils.db_schema import ensure_task_schema
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Iniciando siembra de base de datos - Tests Precargados y Análisis Multimodal...")
    
    # 1. Crear / Validar tablas
    db.create_all()
    ensure_task_schema(db)
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

    # 5. Plantillas Precargadas de Tests Estandarizados (Módulo 4 Multimodal - 10 Preguntas Completa)
    Evaluation.query.filter_by(is_template=True).delete()
    db.session.commit()

    # Template 1: Clima Laboral y Entorno Institucional (10 Preguntas)
    q_clima = [
        {"id": "q1", "question": "¿Cómo evalúas la comunicación y apertura con tus superiores o líderes directos?", "type": "scale_1_5"},
        {"id": "q2", "question": "En una escala del 1 al 10, ¿qué tan manejable y equilibrada percibes tu carga de trabajo actual?", "type": "scale_1_10"},
        {"id": "q3", "question": "Selecciona con un emoji tu nivel general de motivación y entusiasmo durante la jornada:", "type": "emoji_scale_5"},
        {"id": "q4", "question": "¿Sientes que dispones de los recursos físicos, tecnológicos y de capacitación necesarios para tus labores?", "type": "boolean"},
        {"id": "q5", "question": "¿Qué tan satisfecho(a) te encuentras con el respeto a tus horarios de descanso y tiempo personal?", "type": "scale_1_5"},
        {"id": "q6", "question": "¿Consideras que tus opiniones y aportes son tomados en cuenta de forma justa en las decisiones de equipo?", "type": "boolean"},
        {"id": "q7", "question": "En una escala del 1 al 10, ¿qué tan seguro(a) y respaldado(a) te sientes en tu entorno de trabajo?", "type": "scale_1_10"},
        {"id": "q8", "question": "Selecciona con un emoji la calidad del clima y camaradería que percibes entre compañeros:", "type": "emoji_scale_5"},
        {"id": "q9", "question": "¿Recomendarías a un profesional o estudiante incorporarse a esta institución?", "type": "boolean"},
        {"id": "q10", "question": "Dictado por Voz / Texto Libre: Expresa cualquier sugerencia o vivencia sobre el clima laboral actual.", "type": "text"}
    ]
    t1 = Evaluation(
        title="[Plantilla] Evaluación Exhaustiva de Clima Laboral y Entorno (10 Preguntas)",
        description="Encuesta estandarizada de 10 preguntas para medir comunicación, balance de tiempo, herramientas y cultura de equipo.",
        category="Clima Laboral",
        questions_json=json.dumps(q_clima),
        is_active=True,
        is_template=True,
        institution_id=inst_edu.id
    )

    # Template 2: Ánimo Personal y Salud Emocional (10 Preguntas)
    q_animo = [
        {"id": "q1", "question": "¿Con qué frecuencia has experimentado tensión muscular, dolores de cabeza o fatiga esta semana?", "type": "scale_1_5"},
        {"id": "q2", "question": "En una escala del 1 al 10, ¿cómo calificarías la calidad de tu sueño y descanso nocturno?", "type": "scale_1_10"},
        {"id": "q3", "question": "Selecciona el emoji que mejor describa tu nivel promedio de energía matutina:", "type": "emoji_scale_5"},
        {"id": "q4", "question": "¿Logras realizar pausas activas o desconexiones breves durante tus jornadas diarias?", "type": "boolean"},
        {"id": "q5", "question": "¿Qué tan fácil te resulta concentrarte y mantener la atención en tus tareas cotidianas?", "type": "scale_1_5"},
        {"id": "q6", "question": "¿Has sentido momentos de desmotivación profunda o aislamiento en los últimos días?", "type": "boolean"},
        {"id": "q7", "question": "En una escala del 1 al 10, ¿qué tan efectivo consideras tu manejo del estrés ante imprevistos?", "type": "scale_1_10"},
        {"id": "q8", "question": "Selecciona el emoji que represente tu paz mental e interior hoy:", "type": "emoji_scale_5"},
        {"id": "q9", "question": "¿Dedicas tiempo suficiente en la semana a actividades recreativas, deportivas o familiares?", "type": "boolean"},
        {"id": "q10", "question": "Reflexión Dictada / Escrita: Describe libremente tus sensaciones, pensamientos o necesidades emocionales de hoy.", "type": "text"}
    ]
    t2 = Evaluation(
        title="[Plantilla] Chequeo Integral de Salud Emocional y Ritmo de Vida (10 Preguntas)",
        description="Diagnóstico estandarizado de 10 preguntas sobre fatiga, calidad del sueño, manejo del estrés y resiliencia.",
        category="Ánimo Personal",
        questions_json=json.dumps(q_animo),
        is_active=True,
        is_template=True,
        institution_id=inst_edu.id
    )

    # Template 3: Bienestar Multimodal Integral (10 Preguntas)
    q_integral = [
        {"id": "q1", "question": "En una escala del 1 al 5, ¿cuál es tu nivel global de satisfacción con la vida e institución actual?", "type": "scale_1_5"},
        {"id": "q2", "question": "Del 1 al 10, ¿qué tan integrado, respetado y valorado te sientes en la comunidad institucional?", "type": "scale_1_10"},
        {"id": "q3", "question": "Selecciona el emoji que mejor represente tu estado emocional general en esta semana:", "type": "emoji_scale_5"},
        {"id": "q4", "question": "¿Sientes que la institución promueve activamente la salud mental y el bienestar integral?", "type": "boolean"},
        {"id": "q5", "question": "¿Qué tan alineado(a) te encuentras con los valores, misión y metas de la organización?", "type": "scale_1_5"},
        {"id": "q6", "question": "¿Recibes retroalimentación constructiva y reconocimientos oportunos por tus logros?", "type": "boolean"},
        {"id": "q7", "question": "Del 1 al 10, ¿qué tan clara consideras la distribución de funciones y expectativas en tu puesto?", "type": "scale_1_10"},
        {"id": "q8", "question": "Selecciona con un emoji cómo visualizas tus oportunidades de crecimiento profesional en el equipo:", "type": "emoji_scale_5"},
        {"id": "q9", "question": "¿Sientes que puedes acudir con confianza a los profesionales de apoyo o psicólogos si lo requieres?", "type": "boolean"},
        {"id": "q10", "question": "Espacio Multimodal Libre: Graba tu voz o redacta tus comentarios finales para el análisis con Gemini AI.", "type": "text"}
    ]
    t3 = Evaluation(
        title="[Plantilla] Diagnóstico Multimodal de Bienestar Institucional 360° (10 Preguntas)",
        description="Cuestionario amplio de 10 preguntas sobre pertenencia, cultura institucional y salud emocional procesado por IA.",
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
    print("[Tests Precargados] 3 plantillas estandarizadas ampliadas a 10 preguntas sembradas correctamente.")

    # 5b. Crear Evaluaciones Activas Habilitadas en la Institución
    active_eval1 = Evaluation.query.filter_by(title="Chequeo Mensual de Clima y Salud Emocional", institution_id=inst_edu.id).first()
    if not active_eval1:
        active_eval1 = Evaluation(
            title="Chequeo Mensual de Clima y Salud Emocional",
            description="Evaluación periódica de 10 preguntas sobre niveles de estrés, comunicación y apoyo de equipo.",
            category="Clima Laboral",
            questions_json=json.dumps(q_clima),
            is_active=True,
            is_template=False,
            institution_id=inst_edu.id
        )
        db.session.add(active_eval1)
        db.session.commit()

    # 5c. Reflexiones e Indicadores Demo para la Psicóloga y Dashboard
    if Reflection.query.filter_by(institution_id=inst_edu.id).count() == 0:
        ref1 = Reflection(
            user_id=member_user.id,
            institution_id=inst_edu.id,
            evaluation_id=active_eval1.id,
            original_text="Me he sentido presionado por los plazos del proyecto esta semana, pero la dinámica de pausas activas me ayudó a recuperar la tranquilidad.",
            stress_score=68,
            motivation_score=72,
            burnout_score=54,
            dominant_sentiment="Neutro",
            institution_suggestion="Fomentar talleres de gestión de carga de trabajo y priorización semanal."
        )
        ref2 = Reflection(
            user_id=member_user.id,
            institution_id=inst_edu.id,
            evaluation_id=active_eval1.id,
            original_text="Excelente ambiente de colaboración en el departamento. Me siento motivado y con energía renovada.",
            stress_score=25,
            motivation_score=90,
            burnout_score=18,
            dominant_sentiment="Positivo",
            institution_suggestion="Reconocer públicamente el esfuerzo y liderazgo positivo del colaborador."
        )
        db.session.add_all([ref1, ref2])
        db.session.commit()

        # Alerta Demo de Prueba
        alert1 = Alert(
            user_id=member_user.id,
            reflection_id=ref1.id,
            institution_id=inst_edu.id,
            priority="Media",
            status="pendiente"
        )
        db.session.add(alert1)
        db.session.commit()

    # 6. Recompensas Demo en la Tienda XP
    if Reward.query.filter_by(institution_id=inst_edu.id).count() == 0:
        r1 = Reward(title="Medalla Virtual de Resiliencia", description="Reconocimiento especial visible en tu perfil institucional.", cost_xp=50, category="Reconocimiento", icon="🏅", institution_id=inst_edu.id)
        r2 = Reward(title="Pase de Salida Temprana (1 Hora)", description="Permiso de flexibilidad laboral u horaria autorizado por tu líder.", cost_xp=250, category="Flexibilidad", icon="⏰", institution_id=inst_edu.id)
        r3 = Reward(title="Sesión Privada de Masaje Ergonométrico", description="Sesión de relajación física y postura de 20 minutos en la institución.", cost_xp=400, category="Bienestar", icon="💆‍♂️", institution_id=inst_edu.id)
        r4 = Reward(title="Insignia de Embajador del Equilibrio", description="Reconocimiento público a colaboradores con alta racha de salud.", cost_xp=150, category="Comunidad", icon="⭐", institution_id=inst_edu.id)
        db.session.add_all([r1, r2, r3, r4])
        db.session.commit()

    # 7. Kudos y Muro de Gratitud Demo
    if Kudos.query.filter_by(institution_id=inst_edu.id).count() == 0:
        k1 = Kudos(sender_id=super_admin.id, institution_id=inst_edu.id, receiver_name="Ana Martínez", receiver_department="Tecnología", message="¡Muchas gracias por apoyar con la organización del taller de respiración!", badge_type="Compañerismo", is_anonymous=False, likes_count=4)
        k2 = Kudos(sender_id=prof_user.id, institution_id=inst_edu.id, receiver_name="Equipo de Salud", receiver_department="Salud", message="Excelente actitud y empatía demostrada durante los chequeos semanales.", badge_type="Resiliencia", is_anonymous=True, likes_count=7)
        db.session.add_all([k1, k2])
        db.session.commit()

    # 8. Tareas Demostrativas para Colaboradores
    if Task.query.count() == 0:
        tk1 = Task(
            title="Pausa Activa de Respiración Consciente",
            description="Tómate 10 minutos para practicar ejercicios de respiración diafragmática guiada en tu puesto.",
            category="Bienestar",
            priority="Alta",
            status="pendiente",
            assigned_type="all",
            institution_id=inst_edu.id,
            estimated_minutes=10,
            created_by=lider_user.id
        )
        tk2 = Task(
            title="Revisión de Informe de Clima y Salud Emocional",
            description="Analizar las métricas generales de estrés y retroalimentación institucional del equipo.",
            category="Laboral",
            priority="Media",
            status="en_progreso",
            assigned_type="department",
            assigned_target="Tecnología",
            institution_id=inst_edu.id,
            estimated_minutes=25,
            created_by=lider_user.id
        )
        tk3 = Task(
            title="Taller Virtual de Ergonometría y Descanso",
            description="Participar en la sesión interactiva sobre postura corporal y prevención de fatiga física.",
            category="Bienestar",
            priority="Baja",
            status="pendiente",
            assigned_type="all",
            institution_id=inst_edu.id,
            estimated_minutes=15,
            created_by=prof_user.id
        )
        tk4 = Task(
            title="Cuestionario de Evaluación Mensual",
            description="Completar la encuesta estandarizada sobre clima y entorno laboral.",
            category="Académica",
            priority="Media",
            status="completada",
            assigned_type="all",
            institution_id=inst_edu.id,
            estimated_minutes=15,
            completed_at=datetime.utcnow(),
            created_by=super_admin.id
        )
        db.session.add_all([tk1, tk2, tk3, tk4])
        db.session.commit()
        print("[Tareas Demo] 4 tareas demostrativas agregadas correctamente.")

    print("[ÉXITO] ¡Siembra de base de datos finalizada!")
