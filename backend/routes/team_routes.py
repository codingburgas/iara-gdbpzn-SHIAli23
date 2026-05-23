# routes/team_routes.py
from flask import Blueprint, request, jsonify
from services.team_service import (
    create_team,
    get_all_teams,
    get_team_by_id,
    get_team_members,
    assign_vehicle_to_team,
    update_team,
    delete_team
)
from services.notification_service import create_team_assignment_notifications

team_bp = Blueprint('teams', __name__, url_prefix='/teams')


@team_bp.route('/create', methods=['POST'])
def create():
    data = request.json or {}

    name = data.get('name')
    station = data.get('station')
    team_type = data.get('type')
    commander_id = data.get('commander_id')
    member_ids = data.get('member_ids', [])
    vehicle_id = data.get('vehicle_id')

    if not name:
        return jsonify({"error": "Team name is required"}), 400

    success, message, team_id = create_team(
        name=name,
        station=station,
        team_type=team_type,
        commander_id=commander_id,
        member_ids=member_ids,
        vehicle_id=vehicle_id
    )

    if not success:
        return jsonify({"error": message}), 400

    # Create notifications for assigned firefighters
    try:
        creator_id = request.headers.get('user-id')
        # convert member_ids may be in data
        create_team_assignment_notifications(team_id, name, member_ids, creator_id)
    except Exception:
        # best-effort; don't block team creation on notification errors
        pass

    return jsonify({"message": message, "team_id": team_id}), 201


@team_bp.route('/list', methods=['GET'])
def list_teams():
    result = get_all_teams()
    return jsonify({"teams": result}), 200


@team_bp.route('/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = get_team_by_id(team_id)

    if not team:
        return jsonify({"error": "Team not found"}), 404

    return jsonify(team), 200


@team_bp.route('/<int:team_id>/members', methods=['GET'])
def get_members(team_id):
    """Get all members of a specific team"""
    members_data = get_team_members(team_id)

    if not members_data:
        return jsonify({"error": "Team not found"}), 404

    return jsonify(members_data), 200


@team_bp.route('/<int:team_id>', methods=['PUT'])
def update(team_id):
    """Update team details"""
    data = request.json or {}

    name = data.get('name')
    station = data.get('station')
    status = data.get('status')
    team_type = data.get('type')

    success, message = update_team(team_id, name=name, station=station, status=status, team_type=team_type)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200


@team_bp.route('/<int:team_id>', methods=['DELETE'])
def delete(team_id):
    """Delete a team"""
    success, message = delete_team(team_id)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200


@team_bp.route('/assign_vehicle', methods=['POST'])
def assign_vehicle():
    data = request.json or {}

    team_id = data.get('team_id')
    vehicle_id = data.get('vehicle_id')

    if not team_id or not vehicle_id:
        return jsonify({"error": "Missing fields"}), 400

    success, message = assign_vehicle_to_team(team_id, vehicle_id)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200
