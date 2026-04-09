import hashlib
from models.user import User
from database import db


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def register_user(full_name, username, password, role):
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return False, "Username already exists", None

    hashed_password = hash_password(password)

    new_user = User(
        full_name=full_name,
        username=username,
        password=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return True, "User registered successfully", new_user.id


def login_user(username, password):
    user = User.query.filter_by(username=username).first()

    if not user:
        return False, None, "User not found"

    hashed_password = hash_password(password)

    if user.password != hashed_password:
        return False, None, "Invalid password"

    return True, user, "Login successful"
