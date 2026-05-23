# services/team_service.py
from models.team import Team
from models.user import User
from models.vehicle import Vehicle
from database import db


def create_team(name, station=None, team_type=None, commander_id=None, member_ids=None, vehicle_id=None):
    """Create a new team with optional members and vehicle assignment"""
    new_team = Team(
        name=name,
        station=station,
        type=team_type or 'OPERATIONAL',
        commander_id=commander_id
    )

    # Persist team first so it has an id for FK assignments
    db.session.add(new_team)
    db.session.flush()  # assign new_team.id without committing

    # Assign members if provided
    if member_ids:
        for member_id in member_ids:
            user = User.query.get(member_id)
            if user:
                user.team_id = new_team.id

    # Assign vehicle if provided
    if vehicle_id:
        vehicle = Vehicle.query.get(vehicle_id)
        if vehicle:
            vehicle.team_id = new_team.id

    db.session.commit()

    return True, "Team created successfully", new_team.id


def get_all_teams():
    teams = Team.query.all()

    result = []
    for t in teams:
        result.append({
            "id": t.id,
            "name": t.name,
            "station": t.station,
            "type": t.type,
            "status": t.status,
            "commander_id": t.commander_id,
            "commander_name": t.commander.full_name if t.commander else None,
            "vehicle_id": t.vehicle.id if t.vehicle else None,
            "member_count": len(t.members)
        })

    return result


def get_team_by_id(team_id):
    team = Team.query.get(team_id)

    if not team:
        return None

    return {
        "id": team.id,
        "name": team.name,
        "station": team.station,
        "type": team.type,
        "status": team.status,
        "commander_id": team.commander_id,
        "commander_name": team.commander.full_name if team.commander else None,
        "vehicle_id": team.vehicle.id if team.vehicle else None
    }


def get_team_members(team_id):
    """Get all members of a team"""
    team = Team.query.get(team_id)

    if not team:
        return None

    members = []
    for member in team.members:
        members.append({
            "id": member.id,
            "name": member.full_name,
            "username": member.username,
            "role": member.role,
            "status": member.status
        })

    return {
        "members": members,
        "count": len(members)
    }


def assign_vehicle_to_team(team_id, vehicle_id):
    team = Team.query.get(team_id)
    vehicle = Vehicle.query.get(vehicle_id)

    if not team:
        return False, "Team not found"

    if not vehicle:
        return False, "Vehicle not found"

    vehicle.team_id = team_id
    db.session.commit()

    return True, "Vehicle assigned to team"


def update_team(team_id, name=None, station=None, status=None, team_type=None):
    """Update team details"""
    team = Team.query.get(team_id)

    if not team:
        return False, "Team not found"

    if name:
        team.name = name
    if station is not None:
        team.station = station
    if status:
        team.status = status
    if team_type:
        team.type = team_type

    db.session.commit()
    return True, "Team updated successfully"


def delete_team(team_id):
    """Delete a team and unassign its members and vehicle"""
    team = Team.query.get(team_id)

    if not team:
        return False, "Team not found"

    # Unassign all members
    for member in team.members:
        member.team_id = None

    # Unassign vehicle
    if team.vehicle:
        team.vehicle.team_id = None

    db.session.delete(team)
    db.session.commit()

    return True, "Team deleted successfully"
