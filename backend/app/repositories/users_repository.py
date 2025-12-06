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

    def create(self, user_id: str, user_data: dict) -> dict:
        """Create a new user document."""
        user_data["id"] = user_id
        self._db.collection("users").document(user_id).set(user_data)
        return user_data

    def update_stats(self, user_id: str, stats: dict) -> None:
        """Update user statistics."""
        user = self.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        current_stats = user.get("stats", {})
        updated_stats = {**current_stats, **stats}
        self.update(user_id, {"stats": updated_stats})

    def update_permissions(self, user_id: str, permissions: dict) -> None:
        """Update admin permissions."""
        user = self.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        if user.get("role") != "admin":
            raise ValueError(f"User {user_id} is not an admin")
        
        current_permissions = user.get("permissions", {})
        updated_permissions = {**current_permissions, **permissions}
        self.update(user_id, {"permissions": updated_permissions})

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        """Convert Firestore document to dict with id."""
        data = doc.to_dict()
        data["id"] = doc.id
        return data

