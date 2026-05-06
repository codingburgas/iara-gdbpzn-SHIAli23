# routes/assignments_routes.py
from flask import Blueprint, request, jsonify
from services.assignment_service import (
    assign_team_to_incident,
    get_assignments_for_incident,
    update_assignment_status
)

assignments_bp = Blueprint('assignments', __name__, url_prefix='/assignments')


@assignments_bp.route('/assign', methods=['POST'])
def assign_team():
    data = request.json or {}

    incident_id = data.get('incident_id')
    team_id = data.get('team_id')

    if not incident_id or not team_id:
        return jsonify({"error": "incident_id and team_id are required"}), 400

    success, message, assignment_id = assign_team_to_incident(incident_id, team_id)

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({
        "message": message,
        "assignment_id": assignment_id
    }), 201


@assignments_bp.route('/incident/<int:incident_id>', methods=['GET'])
def list_assignments(incident_id):
    result = get_assignments_for_incident(incident_id)
    return jsonify({"assignments": result}), 200


@assignments_bp.route('/<int:assignment_id>/status', methods=['PUT'])
def update_status(assignment_id):
    data = request.json or {}

    new_status = data.get('status')
    user_id = data.get('user_id')

    if not new_status:
        return jsonify({"error": "status is required"}), 400

    success, message = update_assignment_status(assignment_id, new_status, user_id)

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"message": message}), 200
