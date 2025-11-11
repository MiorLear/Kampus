"""Modules repository for Firestore access."""

from app.firebase import get_db


class ModulesRepository:
    """Data access layer for course modules."""

    def __init__(self) -> None:
        self._db = get_db()

    def list_by_course(self, course_id: str) -> list[dict]:
        collection = self._db.collection("course_modules")
        try:
            query = collection.where("course_id", "==", course_id).order_by("order").stream()
        except Exception:  # order index might not exist
            query = collection.where("course_id", "==", course_id).stream()

        modules = [self._doc_to_dict(doc) for doc in query]
        modules.sort(key=lambda m: m.get("order", 0))
        return modules

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
