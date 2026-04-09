from flask import Blueprint, request, jsonify
from services.team_service import (
    create_team,
    get_all_teams,
    get_team_by_id,
    assign_vehicle_to_team
)

team_bp = Blueprint('teams', __name__, url_prefix='/teams')


@team_bp.route('/create', methods=['POST'])
def create():
    data = request.json

    name = data.get('name')
    station = data.get('station')

    if not name:
        return jsonify({"error": "Team name is required"}), 400

    success, message, team_id = create_team(name, station)

    return jsonify({"message": message}), 201


@team_bp.route('/list', methods=['GET'])
def list_teams():
    result = get_all_teams()
    return jsonify(result), 200


@team_bp.route('/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = get_team_by_id(team_id)

    if not team:
        return jsonify({"error": "Team not found"}), 404

    return jsonify(team), 200


@team_bp.route('/assign_vehicle', methods=['POST'])
def assign_vehicle():
    data = request.json

    team_id = data.get('team_id')
    vehicle_id = data.get('vehicle_id')

    if not team_id or not vehicle_id:
        return jsonify({"error": "Missing fields"}), 400

    success, message = assign_vehicle_to_team(team_id, vehicle_id)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200
