from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).fetchall()
    print('Tables:', [t[0] for t in tables])
    try:
        count = conn.execute(text('SELECT COUNT(*) FROM users')).scalar()
        print('Users count:', count)
    except Exception as e:
        print('Users count error:', e)
    try:
        version = conn.execute(text('SELECT version_num FROM alembic_version')).fetchone()
        print('Alembic version:', version[0] if version else None)
    except Exception as e:
        print('Alembic version error:', e)
