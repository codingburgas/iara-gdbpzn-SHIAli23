from database import db
from datetime import datetime


class IncidentAssignment(db.Model):
    __tablename__ = 'incident_assignments'

    id = db.Column(db.Integer, primary_key=True)

    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)

    status = db.Column(db.String(20), default='ASSIGNED')
    # ASSIGNED, EN_ROUTE, ON_SCENE, COMPLETED

    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident = db.relationship('Incident', back_populates='assignments')
    team = db.relationship('Team')

    def __repr__(self):
        return f'<IncidentAssignment {self.id}>'
