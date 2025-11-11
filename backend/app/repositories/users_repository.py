"""Users repository for Firestore access."""

from app.firebase import get_db


class UsersRepository:
    """Data access layer for users collection."""

    def __init__(self) -> None:
        self._db = get_db()

    def list(self, role: str | None = None) -> list[dict]:
        """List all users, optionally filtered by role."""
        if role:
            query = (
                self._db.collection("users")
                .where("role", "==", role)
                .stream()
            )
        else:
            query = self._db.collection("users").stream()

        return [self._doc_to_dict(doc) for doc in query]

    def get(self, user_id: str) -> dict | None:
        """Get a user by ID."""
        doc = self._db.collection("users").document(user_id).get()
        if not doc.exists:
            return None
        return self._doc_to_dict(doc)

    def update(self, user_id: str, updates: dict) -> None:
        """Update a user document."""
        self._db.collection("users").document(user_id).update(updates)

    def delete(self, user_id: str) -> None:
        """Delete a user document."""
        self._db.collection("users").document(user_id).delete()

    def get_stats(self) -> dict:
        """Get user statistics by role."""
        users = self.list()
        stats = {
            "total": len(users),
            "students": 0,
            "teachers": 0,
            "admins": 0,
        }
        for user in users:
            role = user.get("role", "student")
            if role == "student":
                stats["students"] += 1
            elif role == "teacher":
                stats["teachers"] += 1
            elif role == "admin":
                stats["admins"] += 1
        return stats

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        """Convert Firestore document to dict with id."""
        data = doc.to_dict()
        data["id"] = doc.id
        return data

