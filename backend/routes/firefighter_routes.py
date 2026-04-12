from flask import Blueprint, request, jsonify
from models.user import User
from database import db

firefighter_bp = Blueprint('firefighters', __name__, url_prefix='/firefighters')


@firefighter_bp.route('/list', methods=['GET'])
def list_firefighters():
    try:
        # Check if user is admin
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
                'status': 'Активен',
                'phone': firefighter.phone or '',
                'email': firefighter.username + '@firebrigade.bg'
            })
        
        return jsonify({'firefighters': firefighter_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@firefighter_bp.route('/<int:firefighter_id>', methods=['GET'])
def get_firefighter(firefighter_id):
    try:
        # Check if user is admin
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
            'status': 'Активен',
            'phone': firefighter.phone or '',
            'email': firefighter.username + '@firebrigade.bg'
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@firefighter_bp.route('/update/<int:firefighter_id>', methods=['PUT'])
def update_firefighter(firefighter_id):
    try:
        # Check if user is admin
        user_role = request.headers.get('user-role', '').lower()
        if user_role != 'admin':
            return jsonify({"error": "Only admins can update firefighters"}), 403

        firefighter = User.query.filter_by(id=firefighter_id, role='firefighter').first()
        
        if not firefighter:
            return jsonify({"error": "Firefighter not found"}), 404
        
        data = request.json
        
        if 'full_name' in data:
            firefighter.full_name = data['full_name']
        if 'phone' in data:
            firefighter.phone = data['phone']
        if 'is_active' in data:
            firefighter.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({"message": "Firefighter updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@firefighter_bp.route('/delete/<int:firefighter_id>', methods=['DELETE'])
def delete_firefighter(firefighter_id):
    try:
        # Check if user is admin
        user_role = request.headers.get('user-role', '').lower()
        if user_role != 'admin':
            return jsonify({"error": "Only admins can delete firefighters"}), 403

        firefighter = User.query.filter_by(id=firefighter_id, role='firefighter').first()
        
        if not firefighter:
            return jsonify({"error": "Firefighter not found"}), 404
        
        # Soft delete - deactivate
        firefighter.is_active = False
        db.session.commit()
        
        return jsonify({"message": "Firefighter deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
