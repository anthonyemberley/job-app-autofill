from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.dialects.sqlite import JSON

from flask_migrate import Migrate

from werkzeug.security import generate_password_hash, check_password_hash
import logging
import os
import sys
from datetime import timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
app.logger.setLevel(logging.DEBUG)

app.logger.handlers = []
for handler in logging.getLogger().handlers:
    app.logger.addHandler(handler)

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'job_application_autofill.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'fallback-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=365)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

app.logger.debug("This is a test log message")
print("This is a print statement in the app.py file")


jwt = JWTManager(app)




class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    
    # Personal Information
    personal_info = db.Column(JSON)
    
    # Work Experience
    work_experience = db.Column(JSON)
    
    # Education
    education = db.Column(JSON)
    
    # Skills
    skills = db.Column(JSON)
    
    # Work Authorization
    authorized_to_work = db.Column(db.Boolean)
    require_sponsorship = db.Column(db.Boolean)
    
    # Political Exposure
    is_pep = db.Column(db.Boolean)
    related_to_pep = db.Column(db.Boolean)
    related_to_paypal_employee = db.Column(db.Boolean)
    
    # Other Information
    how_heard_about_us = db.Column(db.String(255))
    
    # Consent Settings
    auto_consent = db.Column(db.Boolean)
    
    linkedin_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    other_website_url = db.Column(db.String(255))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# # Drop all tables and recreate
# with app.app_context():
#     db.drop_all()
#     db.create_all()

# Create tables
# with app.app_context():
#     db.create_all()
    
from flask import request

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

@app.route('/')
def home():
    app.logger.debug("Home route accessed")
    return "Hello, World!"

@app.route('/test')
def test():
    app.logger.debug("Test route accessed")
    return jsonify({"message": "Server is running"}), 200


@app.route('/register', methods=['POST'])
def register():
    app.logger.debug("Received registration request")
    app.logger.debug(f"Request headers: {request.headers}")
    app.logger.debug(f"Request data: {request.get_data(as_text=True)}")
    
    try:
        data = request.get_json(force=True)
        app.logger.debug(f"Parsed JSON data: {data}")
        
        email = data.get('email')
        password = data.get('password')
        
        app.logger.debug(f"Extracted email: {email}, password: {'*' * len(password) if password else None}")
        
        if not email or not password:
            app.logger.warning("Email or password missing")
            return jsonify({"message": "Email and password are required"}), 400
        
        user = User.query.filter_by(email=email).first()
        if user:
            app.logger.warning(f"User already exists: {email}")
            return jsonify({"message": "User already exists"}), 400
        
        new_user = User(email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        # Add this line to verify the user was created
        created_user = User.query.filter_by(email=email).first()
        app.logger.info(f"User created successfully: {email}, ID: {created_user.id if created_user else 'Not found'}")
        
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        app.logger.error(f"Error during registration: {str(e)}", exc_info=True)
        return jsonify({"message": f"An error occurred during registration: {str(e)}"}), 500
    
    
@app.route('/update_user_data', methods=['POST'])
@jwt_required()
def update_user_data():
    app.logger.debug("Received update_user_data request")
    user_id = get_jwt_identity()
    app.logger.debug(f"User ID: {user_id}")
    user = db.session.get(User, user_id)
    app.logger.debug(f"User: {user}")
    if not user:
        return jsonify({"message": "User not found"}), 404

    try:
        user_data = request.get_json()
        app.logger.debug(f"Received user data: {user_data}")

        # Update personal_info
        user.personal_info = user_data.get('personalInfo', {})

        # Update work_experience
        user.work_experience = user_data.get('workExperience', [])

        # Update education
        user.education = user_data.get('education', [])

        # Update skills
        user.skills = user_data.get('skills', [])
        
        # Update URLs
        user.linkedin_url = user.personal_info.get('linkedinUrl', '')
        user.github_url = user.personal_info.get('githubUrl', '')
        user.other_website_url = user.personal_info.get('otherWebsiteUrl', '')


        # Update work authorization
        user.authorized_to_work = user_data.get('authorizedToWork', False)
        user.require_sponsorship = user_data.get('requireSponsorship', False)

        # Update political exposure
        user.is_pep = user_data.get('isPEP', False)
        user.related_to_pep = user_data.get('relatedToPEP', False)
        user.related_to_paypal_employee = user_data.get('relatedToPayPalEmployee', False)

        # Update other information
        user.how_heard_about_us = user_data.get('howHeardAboutUs', '')

        # Update consent settings
        user.auto_consent = user_data.get('autoConsent', False)

        db.session.commit()
        app.logger.debug(f"Updated user data: {user_data}")
        return jsonify({"message": "User data updated successfully", "success": True}), 200
    except Exception as e:
        app.logger.error(f"Error updating user data: {str(e)}", exc_info=True)
        return jsonify({"message": f"An error occurred while updating user data: {str(e)}", "success": False}), 500

@app.route('/get_user_data', methods=['GET'])
@jwt_required()
def get_user_data():
    user_id = get_jwt_identity()
    app.logger.debug(f"Get user data request received. User ID: {user_id}")
    user = User.query.get(user_id)
    
    # Add this line to check all users in the database
    all_users = User.query.all()
    app.logger.debug(f"All users in database: {[u.id for u in all_users]}")
    
    if not user:
        app.logger.warning(f"User not found for ID: {user_id}")
        return jsonify({"message": "User not found"}), 404
    
    user_data = {
        'personalInfo': user.personal_info or {},
        'workExperience': user.work_experience or [],
        'education': user.education or [],
        'skills': user.skills or [],
        'authorizedToWork': user.authorized_to_work or False,
        'requireSponsorship': user.require_sponsorship or False,
        'isPEP': user.is_pep or False,
        'relatedToPEP': user.related_to_pep or False,
        'relatedToPayPalEmployee': user.related_to_paypal_employee or False,
        'howHeardAboutUs': user.how_heard_about_us or '',
        'autoConsent': user.auto_consent or False,
        'linkedinUrl': user.linkedin_url or '',
        'githubUrl': user.github_url or '',
        'otherWebsiteUrl': user.other_website_url or '',
    }
    
    app.logger.debug(f"Returning user data: {user_data}")
    return jsonify(user_data), 200


@app.route('/login', methods=['POST'])
def login():
    app.logger.debug("Login attempt received")
    data = request.json
    app.logger.debug(f"Login data: {data}")
    
    if not data:
        app.logger.error("No JSON data received in login request")
        return jsonify({"message": "No data provided"}), 400
    
    if 'email' not in data or 'password' not in data:
        app.logger.error("Missing email or password in login request")
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    app.logger.debug(f"all users: {User.query.all()}")
    app.logger.debug(f"User found: {user}")
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        app.logger.info(f"User {data['email']} logged in successfully")
        return jsonify(access_token=access_token), 200
    
    app.logger.warning(f"Failed login attempt for email: {data.get('email')}")
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/update_info', methods=['POST'])
@jwt_required()
def update_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.personal_info = request.json
    db.session.commit()
    return jsonify({"message": "Information updated successfully"}), 200

@app.route('/get_info', methods=['GET'])
@jwt_required()
def get_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.personal_info), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)