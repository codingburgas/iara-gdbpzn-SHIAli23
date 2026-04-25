from database import db
from datetime import datetime
from models.incident import Incident
from models.team import Team
from models.incident_assignment import IncidentAssignment


def assign_team_to_incident(incident_id, team_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return False, "Incident not found", None

    team = Team.query.get(team_id)
    if not team:
        return False, "Team not found", None

    existing = IncidentAssignment.query.filter_by(
        incident_id=incident_id,
        team_id=team_id
    ).first()

    if existing:
        return False, "Team already assigned to this incident", None

    assignment = IncidentAssignment(
        incident_id=incident_id,
        team_id=team_id,
        status="assigned",
        assigned_at=datetime.utcnow()
    )

    db.session.add(assignment)
    db.session.commit()

    return True, "Team assigned successfully", assignment.id


def get_assignments_for_incident(incident_id):
    assignments = IncidentAssignment.query.filter_by(incident_id=incident_id).all()

    result = []
    for a in assignments:
        result.append({
            "id": a.id,
            "incident_id": a.incident_id,
            "team_id": a.team_id,
            "status": a.status,
            "assigned_at": a.assigned_at.strftime("%Y-%m-%d %H:%M:%S"),
            "accepted_by": a.accepted_by,
            "accepted_at": a.accepted_at.strftime("%Y-%m-%d %H:%M:%S") if a.accepted_at else None
        })

    return result


def update_assignment_status(assignment_id, new_status, user_id=None):
    assignment = IncidentAssignment.query.get(assignment_id)

    if not assignment:
        return False, "Assignment not found"

    assignment.status = new_status

    if new_status == "accepted":
        assignment.accepted_by = user_id
        assignment.accepted_at = datetime.utcnow()

    db.session.commit()
    return True, "Assignment status updated successfully"
