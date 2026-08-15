from sqlalchemy import inspect, text


def ensure_task_schema(db):
    """Asegura que la tabla tasks tenga las columnas usadas por el módulo de tareas."""
    inspector = inspect(db.engine)
    if not inspector.has_table('tasks'):
        return False

    existing_columns = {column['name'] for column in inspector.get_columns('tasks')}

    statements = []
    if 'assigned_type' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN assigned_type VARCHAR(30) DEFAULT 'all'")
    if 'assigned_target' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN assigned_target VARCHAR(150)")
    if 'priority' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'Media'")
    if 'estimated_minutes' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER DEFAULT 15")
    if 'submission_notes' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN submission_notes TEXT")
    if 'completed_at' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP")
    if 'review_status' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN review_status VARCHAR(30) DEFAULT 'pendiente'")
    if 'feedback_notes' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN feedback_notes TEXT")
    if 'board_column' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN board_column VARCHAR(30) DEFAULT 'todo'")

    if not statements:
        return True

    with db.engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))

    return True


def ensure_gamification_schema(db):
    """Asegura que la tabla users tenga columnas de gamificación y crea las tablas de gamificación en PostgreSQL."""
    try:
        db.create_all()
        inspector = inspect(db.engine)
        if inspector.has_table('users'):
            existing_columns = {column['name'] for column in inspector.get_columns('users')}
            statements = []
            if 'total_xp' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0 NOT NULL")
            if 'current_level' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN current_level INTEGER DEFAULT 1 NOT NULL")
            if 'current_streak' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0 NOT NULL")
            if 'longest_streak' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0 NOT NULL")
            if 'last_activity_date' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN last_activity_date DATE")
                
            if statements:
                with db.engine.begin() as conn:
                    for statement in statements:
                        conn.execute(text(statement))
                        
        from app.services.gamification_service import GamificationService
        GamificationService.seed_initial_config()
        return True
    except Exception as e:
        print(f"Error ensuring gamification schema: {e}")
        return False


def ensure_wellbeing_and_consents_schema(db):
    """Crea las tablas de bienestar, consentimientos y notificaciones, y siembra el centro de recursos."""
    try:
        db.create_all()
        from app.models.resource import Resource
        if Resource.query.count() == 0:
            seed_resources = [
                {
                    "title": "Técnica de Respiración 4-7-8 para Momentos de Alta Presión",
                    "description": "Un ejercicio práctico de respiración diafragmática para reducir la sobrecarga y recuperar la serenidad.",
                    "category": "Manejo del estrés",
                    "resource_type": "ejercicio",
                    "target_indicator": "estres",
                    "reading_time_minutes": 4,
                    "author": "Dra. Sofía Ramírez • Psicología Institucional",
                    "content": "La técnica 4-7-8 consiste en inhalar en 4 segundos, retener el aire 7 segundos y exhalar suavemente por la boca durante 8 segundos. Realizar 4 ciclos consecutivos activa el sistema parasimpático disminuyendo la tensión muscular y la fatiga."
                },
                {
                    "title": "Guía de Desconexión Digital y Descanso Restaurador",
                    "description": "Estrategias para crear límites claros entre la jornada laboral/académica y el tiempo de recuperación personal.",
                    "category": "Descanso",
                    "resource_type": "guia",
                    "target_indicator": "agotamiento",
                    "reading_time_minutes": 6,
                    "author": "Comité de Salud y Bienestar EquilibrIA",
                    "content": "Estudios demuestran que mantener notificaciones activas fuera de horario eleva el agotamiento acumulado. Establece una ventana de 60 minutos previa a dormir libre de pantallas y define una rutina de cierre diario de pendientes."
                },
                {
                    "title": "Técnica Pomodoro y Bloques de Enfoque Sostenible",
                    "description": "Organiza tus actividades en bloques de 25 minutos con pausas conscientes para mantener la motivación.",
                    "category": "Organización del tiempo",
                    "resource_type": "articulo",
                    "target_indicator": "motivacion",
                    "reading_time_minutes": 5,
                    "author": "Equipo de Acompañamiento EquilibrIA",
                    "content": "Trabajar en intervalos definidos previene la dispersión cognitiva. Combina 25 minutos de concentración focalizada con 5 minutos de estiramiento o hidratación para optimizar tu rendimiento sin llegar a la fatiga."
                },
                {
                    "title": "Reconociendo Señales Tempranas de Sobrecarga",
                    "description": "Infografía y pautas para identificar indicadores de tensión prolongada antes de llegar a la saturación.",
                    "category": "Prevención del agotamiento",
                    "resource_type": "infografia",
                    "target_indicator": "agotamiento",
                    "reading_time_minutes": 7,
                    "author": "Área de Orientación Preventiva",
                    "content": "La irritabilidad recurrente, la falta de concentración matutina y la sensación de esfuerzo desmedido son señales para ajustar el ritmo. Comunicar oportunamente tus prioridades con tu equipo es un paso fundamental."
                },
                {
                    "title": "Comunicación Asertiva y Establecimiento de Límites Saludables",
                    "description": "Aprende a expresar tus necesidades y disponibilidad de manera empática y profesional.",
                    "category": "Relaciones interpersonales",
                    "resource_type": "articulo",
                    "target_indicator": "general",
                    "reading_time_minutes": 5,
                    "author": "Dra. Sofía Ramírez",
                    "content": "Decir 'no' o negociar plazos de forma constructiva protege tu energía y fortalece la confianza en el equipo. Utiliza fórmulas basadas en hechos y propuestas de solución compartida."
                },
                {
                    "title": "Pausas Activas: Rutina de Estiramiento de 3 Minutos",
                    "description": "Movimientos suaves de cuello, hombros y muñecas para liberar la tensión física de la jornada.",
                    "category": "Hábitos saludables",
                    "resource_type": "actividad",
                    "target_indicator": "estres",
                    "reading_time_minutes": 3,
                    "author": "Comité de Ergonomía y Salud",
                    "content": "1. Rotación suave de hombros hacia atrás (10 repeticiones). 2. Inclinación lateral de cuello sosteniendo 10 segundos por lado. 3. Extensión de brazos y respiración profunda. Realizar cada 2 horas."
                },
                {
                    "title": "Desarrollo de la Inteligencia Emocional en el Día a Día",
                    "description": "Herramientas para identificar, validar y canalizar las emociones complejas en el entorno cotidiano.",
                    "category": "Inteligencia emocional",
                    "resource_type": "guia",
                    "target_indicator": "general",
                    "reading_time_minutes": 8,
                    "author": "Equipo de Bienestar EquilibrIA",
                    "content": "Aceptar las emociones sin juzgarlas permite comprender la causa raíz de la frustración o la ansiedad y responder con mayor claridad en lugar de reaccionar de manera impulsiva."
                },
                {
                    "title": "Práctica de Micro-Meditación y Atención Plena (Mindfulness)",
                    "description": "Ejercicio guiado de 2 minutos para anclarte en el presente cuando surjan pensamientos rumiantes.",
                    "category": "Ansiedad y preocupación",
                    "resource_type": "ejercicio",
                    "target_indicator": "estres",
                    "reading_time_minutes": 3,
                    "author": "Área de Orientación Preventiva",
                    "content": "Cierra los ojos, concéntrate en los puntos de contacto de tus pies con el suelo y observa el flujo de tu respiración sin intentar cambiarla. Notar los sonidos ambientales te ayuda a reducir la hiperactivación mental."
                }
            ]
            
            for item in seed_resources:
                res = Resource(
                    title=item['title'],
                    description=item['description'],
                    category=item['category'],
                    resource_type=item['resource_type'],
                    target_indicator=item['target_indicator'],
                    reading_time_minutes=item['reading_time_minutes'],
                    author=item['author'],
                    content=item['content'],
                    is_published=True
                )
                db.session.add(res)
            db.session.commit()
            print("Centro de Recursos inicial sembrado exitosamente en PostgreSQL.")
        return True
    except Exception as e:
        print(f"Error ensuring wellbeing & consents schema: {e}")
        return False


