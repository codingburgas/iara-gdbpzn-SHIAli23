# routes/auth_routes.py
from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}

    full_name = data.get('full_name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not full_name or not username or not password or not role:
        return jsonify({"error": "Missing fields"}), 400

    # split full_name into first_name / last_name
    parts = full_name.strip().split()
    first_name = parts[0]
    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

    success, message, user_id = register_user(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password=password,
        role=role
    )

    if not success:
        return jsonify({"error": message}), 409

    return jsonify({"message": message, "user_id": user_id}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}

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
            "username": user.username,
            "phone": user.phone or "",
            "role": user.role,
            "team_id": user.team_id
        }
    }), 200
