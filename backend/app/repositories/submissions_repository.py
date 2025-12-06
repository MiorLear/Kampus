"""Submissions repository for Firestore access."""

from app.firebase import get_db


class SubmissionsRepository:
    """Data access layer for submissions collection."""

    def __init__(self) -> None:
        self._db = get_db()

    def list(self, assignment_id: str | None = None, student_id: str | None = None) -> list[dict]:
        """List all submissions, optionally filtered by assignment_id or student_id."""
        query = self._db.collection("submissions")
        
        if assignment_id:
            query = query.where("assignment_id", "==", assignment_id)
        elif student_id:
            query = query.where("student_id", "==", student_id)
        
        return [self._doc_to_dict(doc) for doc in query.stream()]

    def get(self, submission_id: str) -> dict | None:
        """Get a submission by ID."""
        doc = self._db.collection("submissions").document(submission_id).get()
        if not doc.exists:
            return None
        return self._doc_to_dict(doc)

    def create(self, submission_data: dict) -> str:
        """Create a new submission."""
        from datetime import datetime
        submission_data["submitted_at"] = datetime.utcnow().isoformat() + "Z"
        
        doc_ref = self._db.collection("submissions").document()
        doc_ref.set(submission_data)
        return doc_ref.id

    def update(self, submission_id: str, updates: dict) -> None:
        """Update a submission document."""
        from datetime import datetime
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        self._db.collection("submissions").document(submission_id).update(updates)

    def delete(self, submission_id: str) -> None:
        """Delete a submission document."""
        self._db.collection("submissions").document(submission_id).delete()

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        """Convert Firestore document to dict with id."""
        data = doc.to_dict()
        data["id"] = doc.id
        return data

