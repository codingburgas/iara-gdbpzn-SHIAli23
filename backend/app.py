from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/')
def index():
    return 'Hello World!'

@app.route('/user')
def user():
    return 'Hello User!'

if __name__ == '__main__':
    app.run(debug=True)
