from flask import Blueprint
from routes.auth_routes import auth_bp
from routes.incident_routes import incident_bp
from routes.team_routes import team_bp
from routes.vehicle_routes import vehicle_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(incident_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(vehicle_bp)
