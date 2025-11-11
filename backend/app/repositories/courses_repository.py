"""Courses repository for Firestore access."""

from app.firebase import get_db


class CoursesRepository:
    """Data access layer for courses collection."""

    def __init__(self) -> None:
        self._db = get_db()

    def list(self, teacher_id: str | None = None) -> list[dict]:
        if teacher_id:
            query = (
                self._db.collection("courses")
                .where("teacher_id", "==", teacher_id)
                .stream()
            )
        else:
            query = self._db.collection("courses").stream()

        return [self._doc_to_dict(doc) for doc in query]

    def get(self, course_id: str) -> dict | None:
        doc = self._db.collection("courses").document(course_id).get()
        if not doc.exists:
            return None
        return self._doc_to_dict(doc)

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
