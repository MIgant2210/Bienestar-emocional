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

