from app import app, db
from flask_migrate import upgrade

with app.app_context():
    upgrade()
    print("Database tables created or updated successfully.")