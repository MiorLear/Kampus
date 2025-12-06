"""Activity logs API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.activity_logs_service import ActivityLogsService

activity_logs_bp = Blueprint("activity_logs", __name__)


@activity_logs_bp.get("/")
def list_activity_logs():
    """Return all activity logs or filter by user_id and limit."""
    limit = request.args.get("limit", type=int)
    user_id = request.args.get("user_id")
    service = ActivityLogsService()

    try:
        logs = service.list_logs(limit=limit, user_id=user_id)
        return jsonify(logs), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching activity logs:", exc)
        return jsonify({"error": "Failed to fetch activity logs"}), 500


@activity_logs_bp.get("/<log_id>")
def get_activity_log(log_id: str):
    """Get an activity log by ID."""
    service = ActivityLogsService()

    try:
        log = service.get_log(log_id)
        if not log:
            return jsonify({"error": "Activity log not found"}), 404
        return jsonify(log), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching activity log:", exc)
        return jsonify({"error": "Failed to fetch activity log"}), 500


@activity_logs_bp.post("/")
def create_activity_log():
    """Create a new activity log entry."""
    service = ActivityLogsService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No data provided"}), 400

    user_id = payload.get("user_id")
    action = payload.get("action")

    if not user_id or not action:
        return jsonify({"error": "user_id and action are required"}), 400

    try:
        metadata = payload.get("metadata", {})
        log_id = service.create_log(user_id, action, metadata)
        return jsonify({"message": "Activity log created successfully", "id": log_id}), 201
    except Exception as exc:  # pylint: disable=broad-except
        print("Error creating activity log:", exc)
        return jsonify({"error": "Failed to create activity log"}), 500
