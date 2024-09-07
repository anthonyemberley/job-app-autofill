from app import app, db
from sqlalchemy.exc import OperationalError

with app.app_context():
    try:
        # Check if the table already exists
        with db.engine.connect() as connection:
            connection.execute(db.text('SELECT 1 FROM user'))
        print("Database tables already exist. Skipping creation.")
    except OperationalError:
        # If the table doesn't exist, create all tables
        db.create_all()
        print("Database tables created successfully.")