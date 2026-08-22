from sqlalchemy import text

def ensure_database_indexes(db):
    """
    Crea índices B-Tree específicos en PostgreSQL para llaves foráneas y columnas
    frecuentemente consultadas en WHERE, JOIN, ORDER BY y GROUP BY.
    Utiliza 'CREATE INDEX IF NOT EXISTS' para máxima seguridad y cero impacto destructivo.
    """
    index_statements = [
        # 1. Tabla users
        "CREATE INDEX IF NOT EXISTS ix_users_institution_id ON users (institution_id)",
        "CREATE INDEX IF NOT EXISTS ix_users_department_id ON users (department_id)",
        "CREATE INDEX IF NOT EXISTS ix_users_role_status ON users (role, status)",
        "CREATE INDEX IF NOT EXISTS ix_users_inst_role ON users (institution_id, role)",

        # 2. Tabla alerts (Elimina full table scans en alertas)
        "CREATE INDEX IF NOT EXISTS ix_alerts_institution_status_created ON alerts (institution_id, status, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_alerts_user_id ON alerts (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_alerts_reflection_id ON alerts (reflection_id)",
        "CREATE INDEX IF NOT EXISTS ix_alerts_resolved_by ON alerts (resolved_by)",

        # 3. Tabla reflections (Acelera historial y métricas analíticas)
        "CREATE INDEX IF NOT EXISTS ix_reflections_user_created ON reflections (user_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_reflections_inst_created ON reflections (institution_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_reflections_evaluation_id ON reflections (evaluation_id)",

        # 4. Tabla tasks
        "CREATE INDEX IF NOT EXISTS ix_tasks_user_status ON tasks (user_id, status)",
        "CREATE INDEX IF NOT EXISTS ix_tasks_inst_column ON tasks (institution_id, board_column)",
        "CREATE INDEX IF NOT EXISTS ix_tasks_created_by ON tasks (created_by)",

        # 5. Tabla audit_logs (Acelera bitácora y ordenamiento)
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_user_created ON audit_logs (user_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs (created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs (action)",

        # 6. Tabla notifications (Acelera campana y notificaciones no leídas)
        "CREATE INDEX IF NOT EXISTS ix_notifications_user_unread ON notifications (user_id, is_read, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_notifications_inst_id ON notifications (institution_id)",

        # 7. Tabla consents
        "CREATE INDEX IF NOT EXISTS ix_consents_user_type ON consents (user_id, consent_type, status)",

        # 8. Tabla appointments (Acelera agenda clínica)
        "CREATE INDEX IF NOT EXISTS ix_appointments_user_date ON appointments (user_id, date_time)",
        "CREATE INDEX IF NOT EXISTS ix_appointments_inst_date ON appointments (institution_id, date_time)",

        # 9. Tabla kudos
        "CREATE INDEX IF NOT EXISTS ix_kudos_inst_created ON kudos (institution_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_kudos_sender_id ON kudos (sender_id)",

        # 10. Tabla evaluations
        "CREATE INDEX IF NOT EXISTS ix_evaluations_inst_active ON evaluations (institution_id, is_active)",

        # 11. Tabla resources
        "CREATE INDEX IF NOT EXISTS ix_resources_category_published ON resources (category, is_published)",

        # 12. Tabla reward_redemptions
        "CREATE INDEX IF NOT EXISTS ix_reward_redemptions_user ON reward_redemptions (user_id, redeemed_at DESC)"
    ]

    try:
        with db.engine.begin() as conn:
            for sql in index_statements:
                conn.execute(text(sql))
        print(f"[PERFORMANCE] Verificados e indexados {len(index_statements)} índices optimizados en PostgreSQL.")
        return True
    except Exception as e:
        print(f"[PERFORMANCE] Error al verificar índices de base de datos: {e}")
        return False
