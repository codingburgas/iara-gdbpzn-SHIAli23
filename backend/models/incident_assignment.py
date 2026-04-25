from database import db
from datetime import datetime


class IncidentAssignment(db.Model):
    __tablename__ = 'incident_assignments'

    id = db.Column(db.Integer, primary_key=True)

    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)

    accepted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    status = db.Column(db.String(20), default='assigned')  

    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_at = db.Column(db.DateTime, nullable=True)

    incident = db.relationship('Incident', backref='assignments')
    team = db.relationship('Team', backref='assignments')
    accepter = db.relationship('User', backref='accepted_assignments')

    def __repr__(self):
        return f'<IncidentAssignment {self.id}>'
