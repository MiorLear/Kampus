"""Progress repository for Firestore access."""

from app.firebase import get_db


class ProgressRepository:
    """Data access for user_progress and course_progress collections."""

    def __init__(self) -> None:
        self._db = get_db()

    # --- User progress ---

    def get_module_progress(self, user_id: str, course_id: str, module_id: str) -> dict | None:
        query = (
            self._db.collection("user_progress")
            .where("user_id", "==", user_id)
            .where("course_id", "==", course_id)
            .where("module_id", "==", module_id)
            .limit(1)
            .stream()
        )
        doc = next(iter(query), None)
        if doc is None:
            return None
        return self._doc_to_dict(doc)

    def list_module_progress(self, user_id: str, course_id: str) -> list[dict]:
        query = (
            self._db.collection("user_progress")
            .where("user_id", "==", user_id)
            .where("course_id", "==", course_id)
            .stream()
        )
        return [self._doc_to_dict(doc) for doc in query]

    def save_module_progress(self, user_id: str, course_id: str, module_id: str, payload: dict) -> None:
        existing = self.get_module_progress(user_id, course_id, module_id)
        collection = self._db.collection("user_progress")
        if existing:
            doc_ref = collection.document(existing["id"])
            doc_ref.update(payload)
        else:
            doc_ref = collection.document()
            payload = {
                **payload,
                "user_id": user_id,
                "course_id": course_id,
                "module_id": module_id,
            }
            doc_ref.set(payload)

    # --- Course progress ---

    def get_course_progress(self, user_id: str, course_id: str) -> dict | None:
        query = (
            self._db.collection("course_progress")
            .where("user_id", "==", user_id)
            .where("course_id", "==", course_id)
            .limit(1)
            .stream()
        )
        doc = next(iter(query), None)
        if doc is None:
            return None
        return self._doc_to_dict(doc)

    def save_course_progress(self, user_id: str, course_id: str, payload: dict) -> None:
        existing = self.get_course_progress(user_id, course_id)
        collection = self._db.collection("course_progress")
        if existing:
            collection.document(existing["id"]).update(payload)
        else:
            doc_ref = collection.document()
            payload = {
                **payload,
                "user_id": user_id,
                "course_id": course_id,
            }
            doc_ref.set(payload)

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
