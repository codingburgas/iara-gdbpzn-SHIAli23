from flask import Blueprint, request, jsonify
from services.notification_service import (
    get_user_notifications,
    get_unread_notifications,
    get_unread_count,
    mark_notification_read,
    mark_all_notifications_read,
    delete_notification
)

notification_bp = Blueprint('notifications', __name__, url_prefix='/notifications')


@notification_bp.route('', methods=['GET'])
def get_notifications():
    """Get all notifications for current user"""
    try:
        user_id = request.headers.get('user-id')
        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400
        
        user_id = int(user_id)
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        result = get_user_notifications(user_id, limit, offset)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notification_bp.route('/unread', methods=['GET'])
def get_unread():
    """Get unread notifications for current user"""
    try:
        user_id = request.headers.get('user-id')
        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400
        
        user_id = int(user_id)
        result = get_unread_notifications(user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notification_bp.route('/unread-count', methods=['GET'])
def unread_count():
    """Get count of unread notifications"""
    try:
        user_id = request.headers.get('user-id')
        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400
        
        user_id = int(user_id)
        count = get_unread_count(user_id)
        return jsonify({"unread_count": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
def mark_read(notification_id):
    """Mark a notification as read"""
    try:
        success, message = mark_notification_read(notification_id)
        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notification_bp.route('/mark-all-read', methods=['PUT'])
def mark_all_read():
    """Mark all notifications as read for current user"""
    try:
        user_id = request.headers.get('user-id')
        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400
        
        user_id = int(user_id)
        success, message = mark_all_notifications_read(user_id)
        
        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
def delete_notif(notification_id):
    """Delete a notification"""
    try:
        success, message = delete_notification(notification_id)
        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
