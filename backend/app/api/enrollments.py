"""Enrollments API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.enrollments_service import EnrollmentsService

enrollments_bp = Blueprint("enrollments", __name__)


@enrollments_bp.get("/")
def list_enrollments():
    service = EnrollmentsService()
    student_id = request.args.get("student_id")
    course_id = request.args.get("course_id")

    try:
        if student_id:
            enrollments = service.list_by_student(student_id)
        elif course_id:
            enrollments = service.list_by_course(course_id)
        else:
            # If no parameters, return empty array instead of error
            # This allows the frontend to work even if no filters are provided
            return jsonify([]), 200

        return jsonify(enrollments), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching enrollments: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch enrollments", "details": str(exc)}), 500


@enrollments_bp.post("/")
def create_enrollment():
    service = EnrollmentsService()
    payload = request.get_json(force=True)

    course_id = payload.get("course_id")
    student_id = payload.get("student_id")
    progress = payload.get("progress", 0)

    if not course_id or not student_id:
        return jsonify({"error": "course_id and student_id are required"}), 400

    try:
        enrollment_id = service.enroll(student_id, course_id, progress)
        return jsonify({"id": enrollment_id}), 201
    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        print("Error creating enrollment:", exc)
        return jsonify({"error": "Failed to create enrollment"}), 500
