from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import hashlib

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True)
