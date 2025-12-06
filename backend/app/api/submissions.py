"""Submissions API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.submissions_service import SubmissionsService

submissions_bp = Blueprint("submissions", __name__)


@submissions_bp.get("/")
def list_submissions():
    """Return all submissions or filter by assignment_id or student_id."""
    assignment_id = request.args.get("assignment_id")
    student_id = request.args.get("student_id")
    service = SubmissionsService()

    try:
        submissions = service.list_submissions(assignment_id, student_id)
        return jsonify(submissions), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching submissions: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch submissions"}), 500


@submissions_bp.get("/<submission_id>")
def get_submission(submission_id: str):
    """Get a submission by ID."""
    service = SubmissionsService()

    try:
        submission = service.get_submission(submission_id)
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        return jsonify(submission), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching submission: {exc}")
        return jsonify({"error": "Failed to fetch submission"}), 500


@submissions_bp.post("/")
def create_submission():
    """Create a new submission."""
    service = SubmissionsService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No submission data provided"}), 400

    try:
        submission_id = service.create_submission(payload)
        return jsonify({"message": "Submission created successfully", "id": submission_id}), 201
    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error creating submission: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to create submission"}), 500


@submissions_bp.put("/<submission_id>")
def update_submission(submission_id: str):
    """Update a submission."""
    service = SubmissionsService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_submission(submission_id, payload)
        return jsonify({"message": "Submission updated successfully", "id": submission_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error updating submission: {exc}")
        return jsonify({"error": "Failed to update submission"}), 500


@submissions_bp.delete("/<submission_id>")
def delete_submission(submission_id: str):
    """Delete a submission."""
    service = SubmissionsService()

    try:
        service.delete_submission(submission_id)
        return jsonify({"message": "Submission deleted successfully", "id": submission_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error deleting submission: {exc}")
        return jsonify({"error": "Failed to delete submission"}), 500

