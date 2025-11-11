"""Progress API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.progress_service import ProgressService

progress_bp = Blueprint("progress", __name__)


@progress_bp.post("/access")
def save_access():
    payload = request.get_json(force=True) or {}
    # Accept both formats: user_id/course_id/module_id or userId/courseId/moduleId
    user_id = payload.get("user_id") or payload.get("userId")
    course_id = payload.get("course_id") or payload.get("courseId")
    module_id = payload.get("module_id") or payload.get("moduleId")
    progress_percentage = payload.get("progress_percentage") or payload.get("progressPercentage")

    if not all([user_id, course_id, module_id]):
        return jsonify({"error": "user_id (or userId), course_id (or courseId) and module_id (or moduleId) are required"}), 400

    service = ProgressService()
    try:
        service.save_module_access(user_id, course_id, module_id, progress_percentage)
        return jsonify({"message": "Module access saved"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error saving module access:", exc)
        return jsonify({"error": "Failed to save module access"}), 500


@progress_bp.post("/")
def save_progress():
    payload = request.get_json(force=True) or {}
    # Accept both formats: user_id/course_id/module_id or userId/courseId/moduleId
    user_id = payload.get("user_id") or payload.get("userId")
    course_id = payload.get("course_id") or payload.get("courseId")
    module_id = payload.get("module_id") or payload.get("moduleId")
    progress_data = payload.get("progressData") or payload.get("progress_data") or {}

    if not all([user_id, course_id, module_id]):
        return jsonify({"error": "user_id (or userId), course_id (or courseId) and module_id (or moduleId) are required"}), 400

    service = ProgressService()
    try:
        service.save_module_progress(user_id, course_id, module_id, progress_data)
        return jsonify({"message": "Module progress saved"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error saving module progress:", exc)
        return jsonify({"error": "Failed to save module progress"}), 500


@progress_bp.post("/complete")
def mark_complete():
    payload = request.get_json(force=True) or {}
    # Accept both formats: user_id/course_id/module_id or userId/courseId/moduleId
    user_id = payload.get("user_id") or payload.get("userId")
    course_id = payload.get("course_id") or payload.get("courseId")
    module_id = payload.get("module_id") or payload.get("moduleId")

    if not all([user_id, course_id, module_id]):
        return jsonify({"error": "user_id (or userId), course_id (or courseId) and module_id (or moduleId) are required"}), 400

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


@progress_bp.get("/module/<course_id>/<module_id>")
def get_module_progress_without_user(course_id: str, module_id: str):
    """Get module progress - userId from query parameter."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "userId query parameter is required"}), 400
    
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


@progress_bp.get("/course/<course_id>")
def list_course_progress_without_user(course_id: str):
    """Get course progress - userId from query parameter."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "userId query parameter is required"}), 400
    
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


@progress_bp.get("/course/<course_id>/summary")
def get_course_summary_without_user(course_id: str):
    """Get course summary - userId from query parameter."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "userId query parameter is required"}), 400
    
    service = ProgressService()
    summary = service.get_course_progress(user_id, course_id)
    if summary is None:
        return jsonify({"user_id": user_id, "course_id": course_id, "total_modules": 0, "completed_modules": 0, "progress_percentage": 0}), 200
    return jsonify(summary), 200
