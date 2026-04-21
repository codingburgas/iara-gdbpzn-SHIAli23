from database import db


class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    station = db.Column(db.String(100), nullable=True)
    type = db.Column(db.String(50), default='operational')  # operational/logistics/volunteer

    members = db.relationship('User', backref='team')

    def __repr__(self):
        return f'<Team {self.name}>'
