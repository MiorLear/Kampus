"""Activity logs repository for Firestore access."""

from typing import Optional
from app.firebase import get_db


class ActivityLogsRepository:
    """Data access layer for activity_logs collection."""

    def __init__(self) -> None:
        self._db = get_db()

    def list(self, limit: Optional[int] = None, user_id: Optional[str] = None) -> list[dict]:
        """List all activity logs, optionally filtered by user_id and limited."""
        try:
            collection = self._db.collection("activity_logs")
            
            # First, try to query with order_by
            try:
                query = collection.order_by("timestamp", direction="DESCENDING")
                
                if user_id:
                    query = query.where("user_id", "==", user_id)
                
                if limit:
                    query = query.limit(limit)
                
                docs = query.stream()
                results = [self._doc_to_dict(doc) for doc in docs]
                return results
            except Exception as order_exc:  # pylint: disable=broad-except
                # If order_by fails (likely due to missing index), query without it
                print(f"Warning: Could not order activity logs by timestamp, sorting in memory: {order_exc}")
                query = collection
                
                if user_id:
                    query = query.where("user_id", "==", user_id)
                
                if limit:
                    query = query.limit(limit * 2)  # Get more to sort, then limit
                
                docs = query.stream()
                results = [self._doc_to_dict(doc) for doc in docs]
                # Sort in memory as fallback (most recent first)
                results.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
                if limit:
                    results = results[:limit]
                return results
        except Exception as exc:  # pylint: disable=broad-except
            print(f"Error listing activity logs: {exc}")
            return []

    def get(self, log_id: str) -> dict | None:
        """Get an activity log by ID."""
        doc = self._db.collection("activity_logs").document(log_id).get()
        if not doc.exists:
            return None
        return self._doc_to_dict(doc)

    def create(self, log_data: dict) -> str:
        """Create a new activity log."""
        doc_ref = self._db.collection("activity_logs").document()
        log_data["id"] = doc_ref.id
        doc_ref.set(log_data)
        return doc_ref.id

    def _doc_to_dict(self, doc) -> dict:
        """Convert Firestore document to dictionary."""
        data = doc.to_dict()
        if data:
            data["id"] = doc.id
            # Ensure timestamp is a string if it's a Firestore timestamp
            if "timestamp" in data and hasattr(data["timestamp"], "isoformat"):
                data["timestamp"] = data["timestamp"].isoformat()
        return data
