# services/auth_service.py
import hashlib
from models.user import User
from database import db


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def register_user(first_name: str, last_name: str, username: str, password: str, role: str):
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return False, "Username already exists", None

    hashed_password = hash_password(password)

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password_hash=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return True, "User registered successfully", new_user.id


def login_user(username: str, password: str):
    user = User.query.filter_by(username=username, is_active=True).first()

    if not user:
        return False, None, "User not found"

    hashed_password = hash_password(password)

    if user.password_hash != hashed_password:
        return False, None, "Invalid password"

    return True, user, "Login successful"
