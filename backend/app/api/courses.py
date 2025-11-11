"""Courses API blueprint."""

from flask import Blueprint, jsonify, request

from app.firebase import get_db

courses_bp = Blueprint("courses", __name__)


@courses_bp.get("/")
def list_courses():
    """Return all courses or filter by teacher_id."""
    print("DEBUG: list_courses endpoint called")
    teacher_id = request.args.get("teacher_id")
    db = get_db()

    try:
        if teacher_id:
            query = (
                db.collection("courses")
                .where("teacher_id", "==", teacher_id)
                .stream()
            )
        else:
            query = db.collection("courses").stream()

        courses = []
        for doc in query:
            data = doc.to_dict()
            data["id"] = doc.id
            courses.append(data)

        print(f"DEBUG: Returning {len(courses)} courses")
        return jsonify(courses), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"ERROR: Error fetching courses: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch courses", "details": str(exc)}), 500


@courses_bp.get("/<course_id>")
def get_course(course_id: str):
    """Get a course by ID."""
    db = get_db()

    try:
        doc = db.collection("courses").document(course_id).get()
        if not doc.exists:
            return jsonify({"error": "Course not found"}), 404
        
        data = doc.to_dict()
        data["id"] = doc.id
        return jsonify(data), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching course:", exc)
        return jsonify({"error": "Failed to fetch course"}), 500
