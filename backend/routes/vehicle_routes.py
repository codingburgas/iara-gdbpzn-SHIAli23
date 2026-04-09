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
            "plate_number": v.plate_number,
            "type": v.type,
            "team_id": v.team_id
        })

    return result


def create_vehicle_service(plate_number, vehicle_type):
    existing = Vehicle.query.filter_by(plate_number=plate_number).first()
    if existing:
        return False, "Vehicle already exists"

    new_vehicle = Vehicle(
        plate_number=plate_number,
        type=vehicle_type
    )

    db.session.add(new_vehicle)
    db.session.commit()

    return True, "Vehicle created successfully"


@vehicle_bp.route('/create', methods=['POST'])
def create():
    data = request.json

    plate_number = data.get('plate_number')
    vehicle_type = data.get('type')

    if not plate_number or not vehicle_type:
        return jsonify({"error": "Missing fields"}), 400

    success, message = create_vehicle_service(plate_number, vehicle_type)

    if not success:
        return jsonify({"error": message}), 409

    return jsonify({"message": message}), 201


@vehicle_bp.route('/list', methods=['GET'])
def list_vehicles():
    result = get_all_vehicles()
    return jsonify(result), 200
