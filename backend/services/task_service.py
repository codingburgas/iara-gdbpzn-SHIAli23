from database import db
from models.task import Task
from datetime import datetime


def create_task(incident_id, title, description=None):
    """Create a new task for an incident"""
    try:
        task = Task(
            incident_id=incident_id,
            title=title,
            description=description,
            status='pending'
        )
        db.session.add(task)
        db.session.commit()
        return True, "Task created successfully", task.id
    except Exception as e:
        db.session.rollback()
        return False, f"Error creating task: {str(e)}", None


def get_tasks_by_incident(incident_id):
    """Get all tasks for an incident"""
    try:
        tasks = Task.query.filter_by(incident_id=incident_id).order_by(Task.created_at.desc()).all()
        return {
            'tasks': [task.to_dict() for task in tasks],
            'count': len(tasks)
        }
    except Exception as e:
        return {
            'tasks': [],
            'count': 0,
            'error': str(e)
        }


def get_task_by_id(task_id):
    """Get a task by ID"""
    try:
        task = Task.query.get(task_id)
        if task:
            return task.to_dict()
        return None
    except Exception as e:
        return None


def update_task_status(task_id, status):
    """Update task status"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return False, "Task not found"
        
        if status not in ['pending', 'done']:
            return False, "Invalid status"
        
        task.status = status
        task.updated_at = datetime.utcnow()
        db.session.commit()
        return True, "Task status updated successfully"
    except Exception as e:
        db.session.rollback()
        return False, f"Error updating task: {str(e)}"


def delete_task(task_id):
    """Delete a task"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return False, "Task not found"
        
        db.session.delete(task)
        db.session.commit()
        return True, "Task deleted successfully"
    except Exception as e:
        db.session.rollback()
        return False, f"Error deleting task: {str(e)}"


def delete_tasks_by_incident(incident_id):
    """Delete all tasks for an incident"""
    try:
        Task.query.filter_by(incident_id=incident_id).delete()
        db.session.commit()
        return True, "Tasks deleted successfully"
    except Exception as e:
        db.session.rollback()
        return False, f"Error deleting tasks: {str(e)}"
