# services/team_service.py
from models.team import Team
from models.vehicle import Vehicle
from database import db


def create_team(name, station=None):
    new_team = Team(
        name=name,
        station=station
    )

    db.session.add(new_team)
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
            "vehicle_id": t.vehicle.id if t.vehicle else None
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
        "vehicle_id": team.vehicle.id if team.vehicle else None
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
