import os
from unittest.mock import MagicMock

os.environ.setdefault('DATABASE_URL', 'sqlite:///:memory:')

from sqlalchemy import create_engine, inspect, text

from app.utils.db_schema import ensure_task_schema


def test_ensure_task_schema_adds_missing_columns():
    engine = create_engine('sqlite:///:memory:')
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE tasks (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                category VARCHAR(50) NOT NULL,
                status VARCHAR(30) NOT NULL,
                due_date DATETIME,
                user_id VARCHAR(36),
                institution_id VARCHAR(36) NOT NULL,
                created_by VARCHAR(36),
                created_at DATETIME,
                assigned_type VARCHAR(30) NOT NULL,
                assigned_target VARCHAR(150),
                priority VARCHAR(20) NOT NULL,
                estimated_minutes INTEGER NOT NULL,
                submission_notes TEXT,
                completed_at DATETIME
            )
        """))

    db = MagicMock()
    db.engine = engine

    ensure_task_schema(db)

    inspector = inspect(engine)
    columns = {column['name'] for column in inspector.get_columns('tasks')}

    assert {'review_status', 'feedback_notes', 'board_column'} <= columns
