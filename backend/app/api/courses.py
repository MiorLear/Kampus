"""Courses API blueprint."""

from flask import Blueprint, jsonify, request

from app.firebase import get_db

courses_bp = Blueprint("courses", __name__)


@courses_bp.get("/")
def list_courses():
    """Return all courses or filter by teacher_id."""
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

        return jsonify(courses), 200
    except Exception as exc:  # pylint: disable=broad-except
        print("Error fetching courses:", exc)
        return jsonify({"error": "Failed to fetch courses"}), 500
