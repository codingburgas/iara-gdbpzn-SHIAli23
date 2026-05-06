# models/user.py
from database import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)

    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    role = db.Column(db.String(20), nullable=False)  # 'admin', 'firefighter', 'operator', etc.

    phone = db.Column(db.String(20), nullable=True)

    status = db.Column(db.String(20), default='off_duty')
    # off_duty, on_duty, on_mission, vacation, sick_leave

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    push_token = db.Column(db.String(255), nullable=True)

    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __repr__(self):
        return f'<User {self.username}>'
