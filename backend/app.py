from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request, jsonify
from datetime import datetime
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    "mssql+pyodbc://SHENIZ\\SQLEXPRESS01/GDBPZNData"
    "?driver=ODBC+Driver+18+for+SQL+Server"
    "&trusted_connection=yes"
    "&Encrypt=no"
    "&TrustServerCertificate=yes"
)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, operator, firefighter
    phone = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True)

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    station = db.Column(db.String(100), nullable=True)  

class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(20), unique=True, nullable=False) 
    type = db.Column(db.String(50), nullable=False) 
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)

    team = db.relationship('Team', backref='vehicles')

class Shift(db.Model):
    __tablename__ = 'shifts'

    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)

    team = db.relationship('Team', backref='shifts')

class Incident(db.Model):
    __tablename__ = 'incidents'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False) 
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='new')  # new, in_progress, resolved
    created_at = db.Column(db.DateTime, nullable=False)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return 'Hello World from SQL Server!'

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json

    full_name = data.get('full_name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not full_name or not username or not password or not role:
        return jsonify({"error": "Missing fields"}), 400

    #Check if the user exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already exists"}), 409

    hashed_password = hash_password(password)

    new_user = User(
        full_name=full_name,
        username=username,
        password=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    hashed_password = hash_password(password)

    if user.password != hashed_password:
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "role": user.role
        }
    }), 200

@app.route('/incidents/create', methods=['POST'])
def create_incident():
    data = request.json

    incident_type = data.get('type')
    address = data.get('address')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not incident_type or not address:
        return jsonify({"error": "Missing required fields"}), 400

    new_incident = Incident(
        type=incident_type,
        address=address,
        latitude=latitude,
        longitude=longitude,
        created_at=datetime.now()
    )

    db.session.add(new_incident)
    db.session.commit()

    return jsonify({"message": "Incident created successfully"}), 201

@app.route('/incidents/list', methods=['GET'])
def list_incidents():
    incidents = Incident.query.all()

    result = []
    for inc in incidents:
        result.append({
            "id": inc.id,
            "type": inc.type,
            "address": inc.address,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "status": inc.status,
            "created_at": inc.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(result), 200

@app.route('/teams/create', methods=['POST'])
def create_team():
    data = request.json

    name = data.get('name')
    station = data.get('station')

    if not name:
        return jsonify({"error": "Team name is required"}), 400

    new_team = Team(
        name=name,
        station=station
    )

    db.session.add(new_team)
    db.session.commit()

    return jsonify({"message": "Team created successfully"}), 201

@app.route('/teams/list', methods=['GET'])
def list_teams():
    teams = Team.query.all()

    result = []
    for t in teams:
        result.append({
            "id": t.id,
            "name": t.name,
            "station": t.station
        })

    return jsonify(result), 200

@app.route('/teams/assign_vehicle', methods=['POST'])
def assign_vehicle():
    data = request.json

    team_id = data.get('team_id')
    vehicle_id = data.get('vehicle_id')

    if not team_id or not vehicle_id:
        return jsonify({"error": "Missing fields"}), 400

    team = Team.query.get(team_id)
    vehicle = Vehicle.query.get(vehicle_id)

    if not team:
        return jsonify({"error": "Team not found"}), 404

    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    vehicle.team_id = team_id
    db.session.commit()

    return jsonify({"message": "Vehicle assigned to team"}), 200

@app.route('/vehicles/create', methods=['POST'])
def create_vehicle():
    data = request.json

    plate_number = data.get('plate_number')
    vehicle_type = data.get('type')

    if not plate_number or not vehicle_type:
        return jsonify({"error": "Missing fields"}), 400

    existing = Vehicle.query.filter_by(plate_number=plate_number).first()
    if existing:
        return jsonify({"error": "Vehicle already exists"}), 409

    new_vehicle = Vehicle(
        plate_number=plate_number,
        type=vehicle_type
    )

    db.session.add(new_vehicle)
    db.session.commit()

    return jsonify({"message": "Vehicle created successfully"}), 201

@app.route('/vehicles/list', methods=['GET'])
def list_vehicles():
    vehicles = Vehicle.query.all()

    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "plate_number": v.plate_number,
            "type": v.type,
            "team_id": v.team_id
        })

    return jsonify(result), 200


if __name__ == '__main__':
    app.run(debug=True)
