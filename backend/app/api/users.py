"""Users API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.users_service import UsersService

users_bp = Blueprint("users", __name__)


@users_bp.get("/")
def list_users():
    """Return all users or filter by role."""
    role = request.args.get("role")
    service = UsersService()

    try:
        users = service.list_users(role)
        return jsonify(users), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching users:", exc)
        return jsonify({"error": "Failed to fetch users"}), 500


@users_bp.get("/<user_id>")
def get_user(user_id: str):
    """Get a user by ID."""
    service = UsersService()

    try:
        user = service.get_user(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching user:", exc)
        return jsonify({"error": "Failed to fetch user"}), 500


@users_bp.put("/<user_id>")
def update_user(user_id: str):
    """Update a user."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_user(user_id, payload)
        return jsonify({"message": "User updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating user:", exc)
        return jsonify({"error": "Failed to update user"}), 500


@users_bp.delete("/<user_id>")
def delete_user(user_id: str):
    """Delete a user."""
    service = UsersService()

    try:
        service.delete_user(user_id)
        return jsonify({"message": "User deleted successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error deleting user:", exc)
        return jsonify({"error": "Failed to delete user"}), 500


@users_bp.get("/stats")
def get_user_stats():
    """Get user statistics."""
    service = UsersService()

    try:
        stats = service.get_user_stats()
        return jsonify(stats), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching user stats:", exc)
        return jsonify({"error": "Failed to fetch user stats"}), 500

