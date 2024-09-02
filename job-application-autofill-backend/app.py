from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import logging
import os
import sys
from datetime import timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["chrome-extension://*", "http://localhost:*", "https://localhost:*", "http://127.0.0.1:*", "https://127.0.0.1:*"]}}, supports_credentials=True)

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
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)

app.logger.debug("This is a test log message")
print("This is a print statement in the app.py file")


jwt = JWTManager(app)



# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    personal_info = db.Column(db.JSON)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Create tables
with app.app_context():
    db.create_all()
    
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
    
    print("This is a print statement in the register route")

    
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
        
        app.logger.info(f"User created successfully: {email}")
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        app.logger.error(f"Error during registration: {str(e)}", exc_info=True)
        return jsonify({"message": f"An error occurred during registration: {str(e)}"}), 500
    
    
@app.route('/update_user_data', methods=['POST'])
@jwt_required()
def update_user_data():
    app.logger.debug("Received update_user_data request")
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    try:
        user_data = request.get_json()
        app.logger.debug(f"Received user data: {user_data}")
        app.logger.debug(f"Current user data: {user.personal_info}")
        user.personal_info = user_data
        db.session.commit()
        app.logger.debug(f"Updated user data: {user.personal_info}")
        return jsonify({"message": "User data updated successfully", "success": True}), 200
    except Exception as e:
        app.logger.error(f"Error updating user data: {str(e)}", exc_info=True)
        return jsonify({"message": f"An error occurred while updating user data: {str(e)}", "success": False}), 500

@app.route('/get_user_data', methods=['GET'])
@jwt_required()
def get_user_data():
    user_id = get_jwt_identity()
    print("getting user data")
    app.logger.debug(f"User ID: {user_id}")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    app.logger.debug(f"Returning user data: {user.personal_info}")
    print(f"Returning user data: {user.personal_info}")
    return jsonify(user.personal_info), 200


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