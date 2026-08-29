from sqlalchemy import text, inspect

def ensure_database_indexes(db):
    """
    Crea tablas y columnas requeridas si no existen, así como índices B-Tree específicos en PostgreSQL
    para llaves foráneas y columnas frecuentemente consultadas en WHERE, JOIN, ORDER BY y GROUP BY.
    Utiliza inspection previa para evitar bloqueos innecesarios (ACCESS EXCLUSIVE) y CREATE INDEX IF NOT EXISTS.
    """
    try:
        inspector = inspect(db.engine)

        # 1. Migración segura de columnas en resources (Solo si faltan)
        if inspector.has_table('resources'):
            existing_cols = {c['name'] for c in inspector.get_columns('resources')}
            col_definitions = {
                'level': "VARCHAR(30) DEFAULT 'principiante'",
                'tags': "VARCHAR(250) DEFAULT ''",
                'source_url': "VARCHAR(300)",
                'source_institution': "VARCHAR(150)",
                'xp_reward': "INTEGER DEFAULT 15",
                'counts_for_streak': "BOOLEAN DEFAULT TRUE",
                'allow_ai_recommendation': "BOOLEAN DEFAULT TRUE",
                'interactive_type': "VARCHAR(50) DEFAULT 'none'",
                'interactive_data': "JSON",
                'media_url': "VARCHAR(400)",
                'updated_at': "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            }
            missing_statements = [
                f"ALTER TABLE resources ADD COLUMN {col} {col_def}"
                for col, col_def in col_definitions.items()
                if col not in existing_cols
            ]
            if missing_statements:
                with db.engine.begin() as conn:
                    conn.execute(text("SET lock_timeout = '3s'"))
                    for stmt in missing_statements:
                        conn.execute(text(stmt))

        # 2. Creación de tablas de favoritos y progreso si no existen
        with db.engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS resource_favorites (
                    id UUID PRIMARY KEY,
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uq_user_resource_favorite UNIQUE (user_id, resource_id)
                );
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS resource_progress (
                    id UUID PRIMARY KEY,
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                    status VARCHAR(30) NOT NULL DEFAULT 'no_iniciado',
                    progress_percent INTEGER NOT NULL DEFAULT 0,
                    interactive_answers JSON,
                    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    CONSTRAINT uq_user_resource_progress UNIQUE (user_id, resource_id)
                );
            """))

        # 3. Índices optimizados B-Tree
        index_statements = [
            "CREATE INDEX IF NOT EXISTS ix_users_institution_id ON users (institution_id)",
            "CREATE INDEX IF NOT EXISTS ix_users_department_id ON users (department_id)",
            "CREATE INDEX IF NOT EXISTS ix_users_role_status ON users (role, status)",
            "CREATE INDEX IF NOT EXISTS ix_users_inst_role ON users (institution_id, role)",
            "CREATE INDEX IF NOT EXISTS ix_alerts_institution_status_created ON alerts (institution_id, status, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_alerts_user_id ON alerts (user_id)",
            "CREATE INDEX IF NOT EXISTS ix_alerts_reflection_id ON alerts (reflection_id)",
            "CREATE INDEX IF NOT EXISTS ix_alerts_resolved_by ON alerts (resolved_by)",
            "CREATE INDEX IF NOT EXISTS ix_reflections_user_created ON reflections (user_id, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_reflections_inst_created ON reflections (institution_id, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_reflections_evaluation_id ON reflections (evaluation_id)",
            "CREATE INDEX IF NOT EXISTS ix_tasks_user_status ON tasks (user_id, status)",
            "CREATE INDEX IF NOT EXISTS ix_tasks_inst_column ON tasks (institution_id, board_column)",
            "CREATE INDEX IF NOT EXISTS ix_tasks_created_by ON tasks (created_by)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_user_created ON audit_logs (user_id, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs (created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs (action)",
            "CREATE INDEX IF NOT EXISTS ix_notifications_user_unread ON notifications (user_id, is_read, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_notifications_inst_id ON notifications (institution_id)",
            "CREATE INDEX IF NOT EXISTS ix_consents_user_type ON consents (user_id, consent_type, status)",
            "CREATE INDEX IF NOT EXISTS ix_appointments_user_date ON appointments (user_id, date_time)",
            "CREATE INDEX IF NOT EXISTS ix_appointments_inst_date ON appointments (institution_id, date_time)",
            "CREATE INDEX IF NOT EXISTS ix_kudos_inst_created ON kudos (institution_id, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_kudos_sender_id ON kudos (sender_id)",
            "CREATE INDEX IF NOT EXISTS ix_evaluations_inst_active ON evaluations (institution_id, is_active)",
            "CREATE INDEX IF NOT EXISTS ix_resources_category_published ON resources (category, is_published)",
            "CREATE INDEX IF NOT EXISTS ix_resources_type_published ON resources (resource_type, is_published)",
            "CREATE INDEX IF NOT EXISTS ix_resources_level ON resources (level)",
            "CREATE INDEX IF NOT EXISTS ix_reward_redemptions_user ON reward_redemptions (user_id, redeemed_at DESC)",
            "CREATE INDEX IF NOT EXISTS ix_resource_favorites_user ON resource_favorites (user_id)",
            "CREATE INDEX IF NOT EXISTS ix_resource_favorites_resource ON resource_favorites (resource_id)",
            "CREATE INDEX IF NOT EXISTS ix_resource_progress_user ON resource_progress (user_id, status)",
            "CREATE INDEX IF NOT EXISTS ix_resource_progress_resource ON resource_progress (resource_id)"
        ]

        with db.engine.begin() as conn:
            for sql in index_statements:
                conn.execute(text(sql))

        print("[PERFORMANCE] Índices y esquema verificados exitosamente en PostgreSQL.")
        return True
    except Exception as e:
        print(f"[PERFORMANCE Warning] No se pudieron verificar algunos índices: {e}")
        return False
