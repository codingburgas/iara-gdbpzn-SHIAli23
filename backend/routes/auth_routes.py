from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    full_name = data.get('full_name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not full_name or not username or not password or not role:
        return jsonify({"error": "Missing fields"}), 400

    success, message, user_id = register_user(full_name, username, password, role)

    if not success:
        return jsonify({"error": message}), 409

    return jsonify({"message": message}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400

    success, user, message = login_user(username, password)

    if not success:
        if message == "User not found":
            return jsonify({"error": message}), 404
        else:
            return jsonify({"error": message}), 401

    return jsonify({
        "message": message,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "role": user.role
        }
    }), 200
