from database import db


class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(50), nullable=False)
    station = db.Column(db.String(100), nullable=True)

    type = db.Column(db.String(50), default='OPERATIONAL')
    status = db.Column(db.String(20), default='AVAILABLE')

    commander_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    commander = db.relationship('User', foreign_keys=[commander_id])

    members = db.relationship(
        'User',
        backref='team',
        foreign_keys='User.team_id'
    )

    vehicle = db.relationship('Vehicle', backref='team', uselist=False)

    def __repr__(self):
        return f'<Team {self.name}>'
