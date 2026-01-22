from flask import Blueprint, jsonify
from app.models.account import Account, UserType


users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('', methods=['GET'])
def list_users():
    """
    Returns all users with minimal fields needed by frontend:
    - user_id: Account.id
    - name: Account.full_name
    - role: Account.user_type (enum value)

    Example response item:
    { "user_id": 1, "name": "Jan Kowalski", "role": "STUDENT" }
    """
    accounts = Account.query.all()

    def serialize(account: Account):
        return {
            'user_id': account.id,
            'name': account.full_name,
            'role': account.user_type.value if isinstance(account.user_type, UserType) else str(account.user_type)
        }

    return jsonify([serialize(a) for a in accounts])
