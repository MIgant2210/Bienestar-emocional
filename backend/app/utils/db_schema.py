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
    if 'resource_id' not in existing_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN resource_id UUID REFERENCES resources(id) ON DELETE SET NULL")

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
        from app.services.resource_seed_service import ResourceSeedService
        ResourceSeedService.seed_resources_if_empty()
        return True
    except Exception as e:
        print(f"Error ensuring wellbeing & consents schema: {e}")
        return False


def ensure_ai_knowledge_and_culture_schema(db):
    """Crea las tablas cultural_expressions y knowledge_documents, agrega columnas a users y siembra los datos iniciales."""
    try:
        db.create_all()
        inspector = inspect(db.engine)

        # 1. Agregar columnas a la tabla users si no existen
        if inspector.has_table('users'):
            existing_columns = {column['name'] for column in inspector.get_columns('users')}
            statements = []
            if 'ai_communication_style' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN ai_communication_style VARCHAR(30) DEFAULT 'guatemalteco' NOT NULL")
            if 'use_guatemalan_expressions' not in existing_columns:
                statements.append("ALTER TABLE users ADD COLUMN use_guatemalan_expressions BOOLEAN DEFAULT TRUE NOT NULL")

            if statements:
                with db.engine.begin() as conn:
                    for statement in statements:
                        conn.execute(text(statement))

        # 2. Sembrar Diccionario Cultural Guatemalteco
        from app.services.cultural_dictionary_service import CulturalDictionaryService
        CulturalDictionaryService.seed_initial_expressions()

        # 3. Sembrar Base de Conocimiento RAG
        from app.services.knowledge_base_service import KnowledgeBaseService
        KnowledgeBaseService.seed_initial_knowledge()

        return True
    except Exception as e:
        print(f"Error ensuring AI knowledge and culture schema: {e}")
        return False


