# routes/task_routes.py
from flask import Blueprint, request, jsonify
from services.task_service import (
    get_task_by_id,
    update_task_status,
    delete_task
)

task_bp = Blueprint('tasks', __name__, url_prefix='/tasks')


@task_bp.route('/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a task by ID"""
    task = get_task_by_id(task_id)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    return jsonify(task), 200


@task_bp.route('/<int:task_id>/status', methods=['PUT'])
def update_status(task_id):
    """Update task status"""
    data = request.json or {}
    status = data.get('status')

    if not status:
        return jsonify({"error": "Status is required"}), 400

    success, message = update_task_status(task_id, status)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200


@task_bp.route('/<int:task_id>', methods=['DELETE'])
def delete(task_id):
    """Delete a task"""
    success, message = delete_task(task_id)

    if not success:
        return jsonify({"error": message}), 404

    return jsonify({"message": message}), 200
