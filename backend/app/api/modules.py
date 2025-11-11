"""Modules API blueprint."""

from flask import Blueprint, jsonify

from app.services.modules_service import ModulesService

modules_bp = Blueprint("modules", __name__)


@modules_bp.get("/courses/<course_id>/modules")
def list_modules(course_id: str):
    service = ModulesService()
    try:
        modules = service.list_modules(course_id)
        return jsonify(modules), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching modules:", exc)
        return jsonify({"error": "Failed to fetch modules"}), 500
