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
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return 'Hello World from SQL Server!'

if __name__ == '__main__':
    app.run(debug=True)
