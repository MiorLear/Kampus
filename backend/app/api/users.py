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


@users_bp.post("/<user_id>/profile")
def create_user_profile(user_id: str):
    """Create a new user profile."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No profile data provided"}), 400

    try:
        profile = service.create_user_profile(user_id, payload)
        return jsonify(profile), 201
    except Exception as exc:  # pylint: disable=broad-except
        print("Error creating user profile:", exc)
        return jsonify({"error": "Failed to create user profile"}), 500


@users_bp.put("/<user_id>/profile/student")
def update_student_profile(user_id: str):
    """Update a student profile."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_student_profile(user_id, payload)
        return jsonify({"message": "Student profile updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating student profile:", exc)
        return jsonify({"error": "Failed to update student profile"}), 500


@users_bp.put("/<user_id>/profile/teacher")
def update_teacher_profile(user_id: str):
    """Update a teacher profile."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_teacher_profile(user_id, payload)
        return jsonify({"message": "Teacher profile updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating teacher profile:", exc)
        return jsonify({"error": "Failed to update teacher profile"}), 500


@users_bp.put("/<user_id>/profile/admin")
def update_admin_profile(user_id: str):
    """Update an admin profile."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_admin_profile(user_id, payload)
        return jsonify({"message": "Admin profile updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating admin profile:", exc)
        return jsonify({"error": "Failed to update admin profile"}), 500


@users_bp.put("/<user_id>/stats/student")
def update_student_stats(user_id: str):
    """Update student statistics."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No stats data provided"}), 400

    try:
        service.update_student_stats(user_id, payload)
        return jsonify({"message": "Student stats updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating student stats:", exc)
        return jsonify({"error": "Failed to update student stats"}), 500


@users_bp.put("/<user_id>/stats/teacher")
def update_teacher_stats(user_id: str):
    """Update teacher statistics."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No stats data provided"}), 400

    try:
        service.update_teacher_stats(user_id, payload)
        return jsonify({"message": "Teacher stats updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating teacher stats:", exc)
        return jsonify({"error": "Failed to update teacher stats"}), 500


@users_bp.put("/<user_id>/stats/admin")
def update_admin_stats(user_id: str):
    """Update admin statistics."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No stats data provided"}), 400

    try:
        service.update_admin_stats(user_id, payload)
        return jsonify({"message": "Admin stats updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating admin stats:", exc)
        return jsonify({"error": "Failed to update admin stats"}), 500


@users_bp.put("/<user_id>/permissions")
def update_admin_permissions(user_id: str):
    """Update admin permissions."""
    service = UsersService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No permissions data provided"}), 400

    try:
        service.update_admin_permissions(user_id, payload)
        return jsonify({"message": "Admin permissions updated successfully", "id": user_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print("Error updating admin permissions:", exc)
        return jsonify({"error": "Failed to update admin permissions"}), 500
