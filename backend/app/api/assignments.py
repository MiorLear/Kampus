"""Assignments API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.assignments_service import AssignmentsService

assignments_bp = Blueprint("assignments", __name__)


@assignments_bp.get("/")
def list_assignments():
    """Return all assignments or filter by course_id."""
    course_id = request.args.get("course_id")
    service = AssignmentsService()

    try:
        assignments = service.list_assignments(course_id)
        return jsonify(assignments), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching assignments: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch assignments"}), 500


@assignments_bp.get("/<assignment_id>")
def get_assignment(assignment_id: str):
    """Get an assignment by ID."""
    service = AssignmentsService()

    try:
        assignment = service.get_assignment(assignment_id)
        if not assignment:
            return jsonify({"error": "Assignment not found"}), 404
        return jsonify(assignment), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching assignment: {exc}")
        return jsonify({"error": "Failed to fetch assignment"}), 500


@assignments_bp.post("/")
def create_assignment():
    """Create a new assignment."""
    service = AssignmentsService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No assignment data provided"}), 400

    try:
        assignment_id = service.create_assignment(payload)
        return jsonify({"message": "Assignment created successfully", "id": assignment_id}), 201
    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error creating assignment: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to create assignment"}), 500


@assignments_bp.put("/<assignment_id>")
def update_assignment(assignment_id: str):
    """Update an assignment."""
    service = AssignmentsService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_assignment(assignment_id, payload)
        return jsonify({"message": "Assignment updated successfully", "id": assignment_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error updating assignment: {exc}")
        return jsonify({"error": "Failed to update assignment"}), 500


@assignments_bp.delete("/<assignment_id>")
def delete_assignment(assignment_id: str):
    """Delete an assignment."""
    service = AssignmentsService()

    try:
        service.delete_assignment(assignment_id)
        return jsonify({"message": "Assignment deleted successfully", "id": assignment_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error deleting assignment: {exc}")
        return jsonify({"error": "Failed to delete assignment"}), 500

