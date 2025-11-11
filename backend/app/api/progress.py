"""Progress API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.progress_service import ProgressService

progress_bp = Blueprint("progress", __name__)


@progress_bp.post("/access")
def save_access():
    payload = request.get_json(force=True)
    user_id = payload.get("user_id")
    course_id = payload.get("course_id")
    module_id = payload.get("module_id")
    progress_percentage = payload.get("progress_percentage")

    if not all([user_id, course_id, module_id]):
        return jsonify({"error": "user_id, course_id and module_id are required"}), 400

    service = ProgressService()
    try:
        service.save_module_access(user_id, course_id, module_id, progress_percentage)
        return jsonify({"message": "Module access saved"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error saving module access:", exc)
        return jsonify({"error": "Failed to save module access"}), 500


@progress_bp.post("/")
def save_progress():
    payload = request.get_json(force=True)
    user_id = payload.get("user_id")
    course_id = payload.get("course_id")
    module_id = payload.get("module_id")
    progress_data = payload.get("progressData", {})

    if not all([user_id, course_id, module_id]):
        return jsonify({"error": "user_id, course_id and module_id are required"}), 400

    service = ProgressService()
    try:
        service.save_module_progress(user_id, course_id, module_id, progress_data)
        return jsonify({"message": "Module progress saved"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error saving module progress:", exc)
        return jsonify({"error": "Failed to save module progress"}), 500


@progress_bp.post("/complete")
def mark_complete():
    payload = request.get_json(force=True)
    user_id = payload.get("user_id")
    course_id = payload.get("course_id")
    module_id = payload.get("module_id")

    if not all([user_id, course_id, module_id]):
        return jsonify({"error": "user_id, course_id and module_id are required"}), 400

    service = ProgressService()
    try:
        service.mark_module_complete(user_id, course_id, module_id)
        return jsonify({"message": "Module marked complete"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error marking module complete:", exc)
        return jsonify({"error": "Failed to mark module complete"}), 500


@progress_bp.get("/module/<user_id>/<course_id>/<module_id>")
def get_module_progress(user_id: str, course_id: str, module_id: str):
    service = ProgressService()
    progress = service.get_module_progress(user_id, course_id, module_id)
    if progress is None:
        return jsonify({"error": "Progress not found"}), 404
    return jsonify(progress), 200


@progress_bp.get("/course/<user_id>/<course_id>")
def list_course_progress(user_id: str, course_id: str):
    service = ProgressService()
    progress = service.list_course_module_progress(user_id, course_id)
    return jsonify(progress), 200


@progress_bp.get("/course/<user_id>/<course_id>/summary")
def get_course_summary(user_id: str, course_id: str):
    service = ProgressService()
    summary = service.get_course_progress(user_id, course_id)
    if summary is None:
        return jsonify({"user_id": user_id, "course_id": course_id, "total_modules": 0, "completed_modules": 0, "progress_percentage": 0}), 200
    return jsonify(summary), 200
