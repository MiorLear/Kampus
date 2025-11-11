"""Enrollments repository for Firestore access."""

from app.firebase import get_db


class EnrollmentsRepository:
    """Data access layer for enrollments collection."""

    def __init__(self) -> None:
        self._db = get_db()

    def list_by_student(self, student_id: str) -> list[dict]:
        query = (
            self._db.collection("enrollments")
            .where("student_id", "==", student_id)
            .stream()
        )
        return [self._doc_to_dict(doc) for doc in query]

    def list_by_course(self, course_id: str) -> list[dict]:
        query = (
            self._db.collection("enrollments")
            .where("course_id", "==", course_id)
            .stream()
        )
        return [self._doc_to_dict(doc) for doc in query]

    def create(self, student_id: str, course_id: str, progress: int = 0) -> str:
        doc_ref = self._db.collection("enrollments").document()
        doc_ref.set(
            {
                "student_id": student_id,
                "course_id": course_id,
                "progress": progress,
                "status": "active",
            }
        )
        return doc_ref.id

    def delete(self, enrollment_id: str) -> None:
        self._db.collection("enrollments").document(enrollment_id).delete()

    def exists(self, student_id: str, course_id: str) -> bool:
        snapshot = (
            self._db.collection("enrollments")
            .where("student_id", "==", student_id)
            .where("course_id", "==", course_id)
            .limit(1)
            .stream()
        )
        return any(snapshot)

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
