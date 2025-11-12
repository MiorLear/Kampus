"""Assignments repository for Firestore access."""

from app.firebase import get_db


class AssignmentsRepository:
    """Data access layer for assignments collection."""

    def __init__(self) -> None:
        self._db = get_db()

    def list(self, course_id: str | None = None) -> list[dict]:
        """List all assignments, optionally filtered by course_id."""
        if course_id:
            query = (
                self._db.collection("assignments")
                .where("course_id", "==", course_id)
                .stream()
            )
        else:
            query = self._db.collection("assignments").stream()

        return [self._doc_to_dict(doc) for doc in query]

    def get(self, assignment_id: str) -> dict | None:
        """Get an assignment by ID."""
        doc = self._db.collection("assignments").document(assignment_id).get()
        if not doc.exists:
            return None
        return self._doc_to_dict(doc)

    def create(self, assignment_data: dict) -> str:
        """Create a new assignment."""
        from datetime import datetime
        assignment_data["created_at"] = datetime.utcnow().isoformat() + "Z"
        
        doc_ref = self._db.collection("assignments").document()
        doc_ref.set(assignment_data)
        return doc_ref.id

    def update(self, assignment_id: str, updates: dict) -> None:
        """Update an assignment document."""
        from datetime import datetime
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        self._db.collection("assignments").document(assignment_id).update(updates)

    def delete(self, assignment_id: str) -> None:
        """Delete an assignment document."""
        self._db.collection("assignments").document(assignment_id).delete()

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        """Convert Firestore document to dict with id."""
        data = doc.to_dict()
        data["id"] = doc.id
        return data

