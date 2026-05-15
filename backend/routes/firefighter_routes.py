# routes/firefighter_routes.py
from flask import Blueprint, request, jsonify
from models.user import User
from database import db

firefighter_bp = Blueprint('firefighters', __name__, url_prefix='/firefighters')


@firefighter_bp.route('/list', methods=['GET'])
def list_firefighters():
    try:
        user_role = request.headers.get('user-role', '').lower()
        if user_role != 'admin':
            return jsonify({"error": "Only admins can view firefighters"}), 403

        firefighters = User.query.filter_by(role='firefighter', is_active=True).all()

        firefighter_list = []
        for firefighter in firefighters:
            firefighter_list.append({
                'id': firefighter.id,
                'name': firefighter.full_name,
                'username': firefighter.username,
                'role_type': 'Пожарникар',
                'status': firefighter.status or 'off_duty',
                'phone': firefighter.phone or '',
                'email': firefighter.username + '@firebrigade.bg'
            })

        return jsonify({'firefighters': firefighter_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@firefighter_bp.route('/<int:firefighter_id>', methods=['GET'])
def get_firefighter(firefighter_id):
    try:
        user_role = request.headers.get('user-role', '').lower()
        if user_role != 'admin':
            return jsonify({"error": "Only admins can view firefighters"}), 403

        firefighter = User.query.filter_by(id=firefighter_id, role='firefighter', is_active=True).first()

        if not firefighter:
            return jsonify({"error": "Firefighter not found"}), 404

        return jsonify({
            'id': firefighter.id,
            'name': firefighter.full_name,
            'username': firefighter.username,
            'role_type': 'Пожарникар',
            'status': firefighter.status or 'off_duty',
            'phone': firefighter.phone or '',
            'email': firefighter.username + '@firebrigade.bg'
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Firefighter self-update status
@firefighter_bp.route('/me/status', methods=['PUT'])
def update_own_status():
    user_id = request.headers.get('user-id')
    if not user_id:
        return jsonify({"error": "Missing user-id header"}), 401
    try:
        user_id_int = int(user_id)
    except ValueError:
        return jsonify({"error": "Invalid user-id header"}), 400

    firefighter = User.query.filter_by(id=user_id_int, role='firefighter', is_active=True).first()
    if not firefighter:
        return jsonify({"error": "Firefighter not found or not active"}), 404

    data = request.json or {}
    new_status = data.get('status')
    allowed_statuses = ['on_duty', 'off_duty', 'on_mission', 'vacation', 'sick_leave']
    if new_status not in allowed_statuses:
        return jsonify({"error": f"Invalid status. Allowed: {allowed_statuses}"}), 400

    firefighter.status = new_status
    try:
        db.session.commit()
        return jsonify({"message": "Status updated successfully", "status": firefighter.status}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@firefighter_bp.route('/update/<int:firefighter_id>', methods=['PUT'])
def update_firefighter(firefighter_id):
    try:
        user_role = request.headers.get('user-role', '').lower()
        if user_role != 'admin':
            return jsonify({"error": "Only admins can update firefighters"}), 403

        firefighter = User.query.filter_by(id=firefighter_id, role='firefighter').first()

        if not firefighter:
            return jsonify({"error": "Firefighter not found"}), 404

        data = request.json or {}

        if 'full_name' in data:
            full_name = str(data['full_name']).strip()
            if full_name:
                parts = full_name.split()
                firefighter.first_name = parts[0]
                firefighter.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        if 'phone' in data:
            firefighter.phone = data['phone']

        if 'is_active' in data:
            firefighter.is_active = bool(data['is_active'])

        db.session.commit()

        return jsonify({"message": "Firefighter updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@firefighter_bp.route('/delete/<int:firefighter_id>', methods=['DELETE'])
def delete_firefighter(firefighter_id):
    try:
        user_role = request.headers.get('user-role', '').lower()
        if user_role != 'admin':
            return jsonify({"error": "Only admins can delete firefighters"}), 403

        firefighter = User.query.filter_by(id=firefighter_id, role='firefighter').first()

        if not firefighter:
            return jsonify({"error": "Firefighter not found"}), 404

        firefighter.is_active = False
        db.session.commit()

        return jsonify({"message": "Firefighter deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
