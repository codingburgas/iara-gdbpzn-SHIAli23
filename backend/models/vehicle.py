from database import db


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)

    callsign = db.Column(db.String(20), unique=True, nullable=False)  

    plate_number = db.Column(db.String(20), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    # FIRE_TRUCK, CISTERN, SUPPORT

    status = db.Column(db.String(20), default='AVAILABLE')
    # AVAILABLE, ON_MISSION, MAINTENANCE

    capacity_water = db.Column(db.Integer, nullable=True)
    capacity_foam = db.Column(db.Integer, nullable=True)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)

    def __repr__(self):
        return f'<Vehicle {self.callsign}>'
