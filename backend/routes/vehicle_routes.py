# routes/vehicle_routes.py
from flask import Blueprint, request, jsonify
from models.vehicle import Vehicle
from database import db

vehicle_bp = Blueprint('vehicles', __name__, url_prefix='/vehicles')


def get_all_vehicles():
    vehicles = Vehicle.query.all()

    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "callsign": v.callsign,
            "plate_number": v.plate_number,
            "type": v.type,
            "status": v.status,
            "team_id": v.team_id,
            "team_name": v.team.name if v.team else None,
            "capacity_water": v.capacity_water,
            "capacity_foam": v.capacity_foam,
            "latitude": v.latitude,
            "longitude": v.longitude
        })

    return result


def get_vehicle_by_id(vehicle_id):
    """Get a single vehicle by ID"""
    v = Vehicle.query.get(vehicle_id)
    
    if not v:
        return None
    
    return {
        "id": v.id,
        "callsign": v.callsign,
        "plate_number": v.plate_number,
        "type": v.type,
        "status": v.status,
        "team_id": v.team_id,
        "team_name": v.team.name if v.team else None,
        "capacity_water": v.capacity_water,
        "capacity_foam": v.capacity_foam,
        "latitude": v.latitude,
        "longitude": v.longitude
    }


def create_vehicle_service(callsign, plate_number, vehicle_type, capacity_water=None, capacity_foam=None):
    existing = Vehicle.query.filter(
        (Vehicle.plate_number == plate_number) |
        (Vehicle.callsign == callsign)
    ).first()
    if existing:
        return False, "Vehicle already exists"

    new_vehicle = Vehicle(
        callsign=callsign,
        plate_number=plate_number,
        type=vehicle_type,
        capacity_water=capacity_water,
        capacity_foam=capacity_foam,
        status='AVAILABLE'
    )

    db.session.add(new_vehicle)
    db.session.commit()

    return True, "Vehicle created successfully"


@vehicle_bp.route('/create', methods=['POST'])
def create():
    data = request.json or {}

    callsign = data.get('callsign')
    plate_number = data.get('plate_number')
    vehicle_type = data.get('type')

    if not callsign or not plate_number or not vehicle_type:
        return jsonify({"error": "Missing fields"}), 400

    success, message = create_vehicle_service(callsign, plate_number, vehicle_type)

    if not success:
        return jsonify({"error": message}), 409

    return jsonify({"message": message}), 201


@vehicle_bp.route('/register', methods=['POST'])
def register():
    """Register a new vehicle (enhanced version with capacity fields)"""
    data = request.json or {}

    callsign = data.get('callsign')
    plate_number = data.get('plate_number')
    vehicle_type = data.get('type')
    capacity_water = data.get('capacity_water')
    capacity_foam = data.get('capacity_foam')

    if not callsign or not plate_number or not vehicle_type:
        return jsonify({"error": "Missing required fields"}), 400

    success, message = create_vehicle_service(
        callsign, 
        plate_number, 
        vehicle_type,
        capacity_water=capacity_water,
        capacity_foam=capacity_foam
    )

    if not success:
        return jsonify({"error": message}), 409

    return jsonify({"message": message}), 201


@vehicle_bp.route('/list', methods=['GET'])
def list_vehicles():
    result = get_all_vehicles()
    return jsonify({"vehicles": result}), 200


@vehicle_bp.route('/<int:vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    """Get a specific vehicle by ID"""
    vehicle = get_vehicle_by_id(vehicle_id)
    
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404
    
    return jsonify(vehicle), 200


@vehicle_bp.route('/<int:vehicle_id>/assign-team', methods=['PUT'])
def assign_team(vehicle_id):
    """Assign a vehicle to a team"""
    data = request.json or {}
    team_id = data.get('team_id')

    if not team_id:
        return jsonify({"error": "Team ID is required"}), 400

    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    vehicle.team_id = team_id
    db.session.commit()

    return jsonify({"message": "Vehicle assigned to team"}), 200
