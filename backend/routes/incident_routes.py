# routes/incident_routes.py
from flask import Blueprint, request, jsonify
from services.incident_service import (
    create_incident,
    get_all_incidents,
    get_incident_by_id,
    update_incident_status,
    delete_incident,
    delete_all_incidents
)

incident_bp = Blueprint('incidents', __name__, url_prefix='/incidents')


@incident_bp.route('/create', methods=['POST'])
def create():
    data = request.json or {}

    incident_type = data.get('type')
    address = data.get('address')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    description = data.get('description')
    source = data.get('source', 'MANUAL')

    if not incident_type or not address:
        return jsonify({"error": "Missing required fields"}), 400

    success, message, incident_id = create_incident(
        incident_type=incident_type,
        address=address,
        latitude=latitude,
        longitude=longitude,
        description=description,
        source=source
    )

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"message": message, "incident_id": incident_id}), 201


@incident_bp.route('/list', methods=['GET'])
def list_incidents():
    result = get_all_incidents()
    return jsonify(result), 200


@incident_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    incident = get_incident_by_id(incident_id)

    if not incident:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify(incident), 200


@incident_bp.route('/<int:incident_id>/status', methods=['PUT'])
def update_status(incident_id):
    data = request.json or {}
    user_role = data.get('user_role')
    new_status = data.get('status')

    if not user_role or user_role.lower() != 'admin':
        return jsonify({"error": "Only administrators can change incident status"}), 403

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    success, message = update_incident_status(incident_id, new_status)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200


@incident_bp.route('/<int:incident_id>', methods=['DELETE'])
def delete(incident_id):
    user_role = request.headers.get('user-role', '').lower()

    if user_role != 'admin':
        return jsonify({"error": "Only administrators can delete incidents"}), 403

    success, message = delete_incident(incident_id)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200


@incident_bp.route('/delete-all', methods=['DELETE'])
def delete_all():
    user_role = request.headers.get('user-role', '').lower()

    if user_role != 'admin':
        return jsonify({"error": "Only administrators can delete all incidents"}), 403

    success, message = delete_all_incidents()

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"message": message}), 200
