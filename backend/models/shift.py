from database import db
from datetime import datetime


class Shift(db.Model):
    __tablename__ = 'shifts'

    id = db.Column(db.Integer, primary_key=True)

    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    shift_type = db.Column(db.String(20), default='DAY')
    # DAY, NIGHT

    status = db.Column(db.String(20), default='ACTIVE')
    # ACTIVE, COMPLETED

    def __repr__(self):
        return f'<Shift {self.id}>'
