from datetime import datetime
from models.incident import Incident
from database import db
from sqlalchemy import text


def create_incident(incident_type, address, latitude=None, longitude=None, description=None, team_id=None):
    new_incident = Incident(
        type=incident_type,
        address=address,
        latitude=latitude,
        longitude=longitude,
        description=description,
        team_id=team_id,
        created_at=datetime.now()
    )

    db.session.add(new_incident)
    db.session.commit()

    return True, "Incident created successfully", new_incident.id


def get_all_incidents():
    incidents = Incident.query.all()

    result = []
    for inc in incidents:
        result.append({
            "id": inc.id,
            "type": inc.type,
            "address": inc.address,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "description": inc.description,
            "team_id": inc.team_id,
            "status": inc.status,
            "date_time": inc.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "created_at": inc.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return {"incidents": result}


def get_incident_by_id(incident_id):
    incident = Incident.query.get(incident_id)

    if not incident:
        return None

    return {
        "id": incident.id,
        "type": incident.type,
        "address": incident.address,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "description": incident.description,
        "team_id": incident.team_id,
        "status": incident.status,
        "created_at": incident.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }


def update_incident_status(incident_id, new_status):
    incident = Incident.query.get(incident_id)

    if not incident:
        return False, "Incident not found"

    incident.status = new_status
    db.session.commit()

    return True, "Incident status updated successfully"


def delete_incident(incident_id):
    incident = Incident.query.get(incident_id)

    if not incident:
        return False, "Incident not found"

    db.session.delete(incident)
    db.session.commit()
    
    # Reset identity if this was the last incident
    try:
        remaining_count = db.session.query(Incident).count()
        if remaining_count == 0:
            db.session.execute(text('DBCC CHECKIDENT (incidents, RESEED, 0)'))
            db.session.commit()
    except Exception as e:
        pass  # Silently fail if DBCC doesn't work

    return True, "Incident deleted successfully"


def delete_all_incidents():
    try:
        db.session.query(Incident).delete()
        db.session.commit()
        
        # Reset identity after deleting all
        db.session.execute(text('DBCC CHECKIDENT (incidents, RESEED, 0)'))
        db.session.commit()
        
        return True, "All incidents deleted successfully"
    except Exception as e:
        return False, str(e)
