from flask import Flask
from flask_cors import CORS
from config import config
from database import db

# IMPORT ROUTES
from routes.auth_routes import auth_bp
from routes.incident_routes import incident_bp
from routes.team_routes import team_bp
from routes.vehicle_routes import vehicle_bp
from routes.user_routes import user_bp
from routes.firefighter_routes import firefighter_bp
from routes.assignments_routes import assignments_bp
from routes.task_routes import task_bp
from routes.notification_routes import notification_bp


def create_app(config_name='development'):
    app = Flask(__name__)

    # LOAD CONFIG
    app.config.from_object(config[config_name])

    # ENABLE CORS
    CORS(app)

    # INIT DATABASE
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # REGISTER ROUTES
    app.register_blueprint(auth_bp)
    app.register_blueprint(incident_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(vehicle_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(firefighter_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(notification_bp)

    @app.route('/')
    def index():
        return 'Backend is running!', 200

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
