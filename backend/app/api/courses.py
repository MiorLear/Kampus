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


@courses_bp.post("/")
def create_course():
    """Create a new course."""
    db = get_db()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No course data provided"}), 400

    # Validate required fields
    if not payload.get("title"):
        return jsonify({"error": "title is required"}), 400
    if not payload.get("teacher_id"):
        return jsonify({"error": "teacher_id is required"}), 400

    try:
        from datetime import datetime
        
        # Prepare course data
        course_data = {
            "title": payload.get("title"),
            "description": payload.get("description", ""),
            "teacher_id": payload.get("teacher_id"),
            "cover_image_url": payload.get("cover_image_url"),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }
        
        # Remove None values
        course_data = {k: v for k, v in course_data.items() if v is not None}
        
        # Create the course document
        doc_ref = db.collection("courses").document()
        doc_ref.set(course_data)
        
        # Return the created course with its ID
        data = course_data.copy()
        data["id"] = doc_ref.id
        
        print(f"DEBUG: Created course with ID: {doc_ref.id}")
        return jsonify({"id": doc_ref.id, "message": "Course created successfully"}), 201
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error creating course: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to create course", "details": str(exc)}), 500


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


@courses_bp.put("/<course_id>")
def update_course(course_id: str):
    """Update a course by ID."""
    db = get_db()
    payload = request.get_json(force=True)

    try:
        doc_ref = db.collection("courses").document(course_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Course not found"}), 404

        # Update the course with new data
        update_data = {
            **payload,
            "updated_at": request.environ.get("_firestore_timestamp") or None
        }
        # Remove id from update data if present (it's in the document ID)
        update_data.pop("id", None)
        
        # Use server timestamp for updated_at
        from datetime import datetime
        update_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        doc_ref.update(update_data)
        
        # Return updated course
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data["id"] = updated_doc.id
        return jsonify(data), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error updating course: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to update course", "details": str(exc)}), 500


@courses_bp.delete("/<course_id>")
def delete_course(course_id: str):
    """Delete a course by ID."""
    db = get_db()

    try:
        doc_ref = db.collection("courses").document(course_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Course not found"}), 404

        # Delete the course
        doc_ref.delete()
        
        return jsonify({"message": "Course deleted successfully"}), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error deleting course: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to delete course", "details": str(exc)}), 500