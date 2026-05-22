from models.notification import Notification
from database import db
from datetime import datetime, timedelta


def create_notification(user_id, sender_id, notification_type, title, content=None):
    """Create a new notification for a user"""
    try:
        notification = Notification(
            user_id=user_id,
            sender_id=sender_id,
            type=notification_type,
            title=title,
            content=content
        )
        db.session.add(notification)
        db.session.commit()
        return True, "Notification created", notification.id
    except Exception as e:
        db.session.rollback()
        return False, str(e), None


def get_user_notifications(user_id, limit=20, offset=0):
    """Get notifications for a user, ordered by newest first"""
    try:
        notifications = Notification.query.filter_by(user_id=user_id).order_by(
            Notification.created_at.desc()
        ).limit(limit).offset(offset).all()
        
        return {
            'notifications': [n.to_dict() for n in notifications],
            'count': len(notifications)
        }
    except Exception as e:
        return {'notifications': [], 'count': 0, 'error': str(e)}


def get_unread_notifications(user_id):
    """Get unread notifications for a user"""
    try:
        notifications = Notification.query.filter_by(
            user_id=user_id, 
            is_read=False
        ).order_by(Notification.created_at.desc()).all()
        
        return {
            'notifications': [n.to_dict() for n in notifications],
            'count': len(notifications)
        }
    except Exception as e:
        return {'notifications': [], 'count': 0, 'error': str(e)}


def get_unread_count(user_id):
    """Get count of unread notifications"""
    try:
        count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return count
    except Exception as e:
        return 0


def mark_notification_read(notification_id):
    """Mark a single notification as read"""
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return False, "Notification not found"
        
        notification.is_read = True
        db.session.commit()
        return True, "Notification marked as read"
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def mark_all_notifications_read(user_id):
    """Mark all notifications for a user as read"""
    try:
        Notification.query.filter_by(user_id=user_id, is_read=False).update(
            {'is_read': True}
        )
        db.session.commit()
        return True, "All notifications marked as read"
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def delete_notification(notification_id):
    """Delete a single notification"""
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return False, "Notification not found"
        
        db.session.delete(notification)
        db.session.commit()
        return True, "Notification deleted"
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def delete_old_notifications(days=30):
    """Delete notifications older than specified days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        Notification.query.filter(Notification.created_at < cutoff_date).delete()
        db.session.commit()
        return True, "Old notifications deleted"
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def create_firefighter_status_notification(firefighter_id, firefighter_name, new_status):
    """Create notifications for all admins about firefighter status change"""
    try:
        from models.user import User
        admins = User.query.filter_by(role='admin', is_active=True).all()
        
        title = f"Пожарникар {firefighter_name} променил статус"
        content = f"Статус: {new_status}"
        
        for admin in admins:
            create_notification(
                user_id=admin.id,
                sender_id=firefighter_id,
                notification_type='firefighter_status_changed',
                title=title,
                content=content
            )
        
        return True, f"Notifications sent to {len(admins)} admins"
    except Exception as e:
        return False, str(e)


def create_new_task_notification(task_id, task_title, incident_id):
    """Create notifications for all firefighters about new task"""
    try:
        from models.user import User
        firefighters = User.query.filter_by(role='firefighter', is_active=True).all()
        
        title = f"Нова задача: {task_title}"
        content = f"Произшествие ID: {incident_id}"
        
        for firefighter in firefighters:
            create_notification(
                user_id=firefighter.id,
                sender_id=None,  # System notification
                notification_type='new_task',
                title=title,
                content=content
            )
        
        return True, f"Notifications sent to {len(firefighters)} firefighters"
    except Exception as e:
        return False, str(e)


def create_new_incident_notification(incident_id, incident_title, incident_location):
    """Create notifications for all firefighters about new incident"""
    try:
        from models.user import User
        firefighters = User.query.filter_by(role='firefighter', is_active=True).all()
        
        title = f"Ново произшествие: {incident_title}"
        content = f"Локация: {incident_location}"
        
        for firefighter in firefighters:
            create_notification(
                user_id=firefighter.id,
                sender_id=None,  # System notification
                notification_type='new_incident',
                title=title,
                content=content
            )
        
        return True, f"Notifications sent to {len(firefighters)} firefighters"
    except Exception as e:
        return False, str(e)
