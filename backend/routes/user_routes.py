from flask import Blueprint, request, jsonify
from models.user import User
from database import db
from services.auth_service import hash_password


user_bp = Blueprint('users', __name__, url_prefix='/users')


def _get_current_user():
    user_id = request.headers.get('user-id')
    if not user_id:
        return None, (jsonify({"error": "Missing user-id header"}), 401)

    try:
        user_id_int = int(user_id)
    except ValueError:
        return None, (jsonify({"error": "Invalid user-id header"}), 400)

    user = User.query.filter_by(id=user_id_int, is_active=True).first()
    if not user:
        return None, (jsonify({"error": "User not found"}), 404)

    return user, None


@user_bp.route('/me', methods=['GET'])
def get_me():
    user, error_response = _get_current_user()
    if error_response:
        return error_response

    return jsonify({
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "role": user.role,
            "phone": user.phone or ""
        }
    }), 200


@user_bp.route('/me', methods=['PUT'])
def update_me():
    user, error_response = _get_current_user()
    if error_response:
        return error_response

    data = request.json or {}

    new_full_name = data.get('full_name')
    new_username = data.get('username')
    new_phone = data.get('phone')
    new_password = data.get('new_password')

    try:
        if new_full_name is not None:
            new_full_name = str(new_full_name).strip()
            if not new_full_name:
                return jsonify({"error": "Full name cannot be empty"}), 400
            user.full_name = new_full_name

        if new_username is not None:
            new_username = str(new_username).strip()
            if not new_username:
                return jsonify({"error": "Username cannot be empty"}), 400

            existing_user = User.query.filter(User.username == new_username, User.id != user.id).first()
            if existing_user:
                return jsonify({"error": "Username already exists"}), 409

            user.username = new_username

        if new_phone is not None:
            new_phone = str(new_phone).strip()
            user.phone = new_phone if new_phone else None

        if new_password is not None and str(new_password).strip():
            user.password = hash_password(str(new_password))

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "username": user.username,
                "role": user.role,
                "phone": user.phone or ""
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

