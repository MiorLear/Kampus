"""Modules API blueprint."""

from flask import Blueprint, jsonify

from app.services.modules_service import ModulesService

modules_bp = Blueprint("modules", __name__)


@modules_bp.get("/courses/<course_id>/modules")
def list_modules(course_id: str):
    """List all modules for a course."""
    service = ModulesService()
    try:
        modules = service.list_modules(course_id)
        # Ensure we always return an array, even if empty
        if modules is None:
            modules = []
        if not isinstance(modules, list):
            print(f"Warning: modules service returned non-list type: {type(modules)}")
            modules = []
        print(f"DEBUG: Returning {len(modules)} modules for course {course_id}")
        return jsonify(modules), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching modules for course {course_id}: {exc}")
        import traceback
        traceback.print_exc()
        # Return empty array instead of error to prevent frontend crashes
        return jsonify([]), 200


@modules_bp.post("/courses/<course_id>/modules")
def create_module(course_id: str):
    """Create a new module for a course."""
    from flask import request
    service = ModulesService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No module data provided"}), 400

    try:
        module_id = service.create_module(course_id, payload)
        return jsonify({"message": "Module created successfully", "id": module_id}), 201
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error creating module: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to create module"}), 500


@modules_bp.get("/<module_id>")
def get_module(module_id: str):
    """Get a module by ID."""
    service = ModulesService()
    try:
        module = service.get_module(module_id)
        if not module:
            return jsonify({"error": "Module not found"}), 404
        return jsonify(module), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching module: {exc}")
        return jsonify({"error": "Failed to fetch module"}), 500


@modules_bp.put("/<module_id>")
def update_module(module_id: str):
    """Update a module."""
    from flask import request
    service = ModulesService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_module(module_id, payload)
        return jsonify({"message": "Module updated successfully"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error updating module: {exc}")
        return jsonify({"error": "Failed to update module"}), 500


@modules_bp.delete("/<module_id>")
def delete_module(module_id: str):
    """Delete a module."""
    service = ModulesService()
    try:
        service.delete_module(module_id)
        return jsonify({"message": "Module deleted successfully"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error deleting module: {exc}")
        return jsonify({"error": "Failed to delete module"}), 500
