"""Modules repository for Firestore access."""

from app.firebase import get_db


class ModulesRepository:
    """Data access layer for course modules."""

    def __init__(self) -> None:
        self._db = get_db()

    def list_by_course(self, course_id: str) -> list[dict]:
        """List all modules for a course, ordered by order field."""
        try:
            collection = self._db.collection("course_modules")
            modules = []
            
            # First, try to query with order_by
            try:
                query = collection.where("course_id", "==", course_id).order_by("order").stream()
                modules = [self._doc_to_dict(doc) for doc in query]
            except Exception as order_exc:  # pylint: disable=broad-except
                # If order_by fails (likely due to missing index), query without it
                print(f"Warning: Could not order by 'order' field, sorting in memory: {order_exc}")
                try:
                    query = collection.where("course_id", "==", course_id).stream()
                    modules = [self._doc_to_dict(doc) for doc in query]
                    # Sort in memory as fallback
                    modules.sort(key=lambda m: m.get("order", 0))
                except Exception as query_exc:  # pylint: disable=broad-except
                    print(f"Error querying modules: {query_exc}")
                    # If query fails completely, return empty list
                    modules = []
            
            # Ensure we always return a list
            if not isinstance(modules, list):
                print(f"Warning: modules is not a list, converting: {type(modules)}")
                modules = []
            
            print(f"DEBUG: Found {len(modules)} modules for course {course_id}")
            return modules
        except Exception as exc:  # pylint: disable=broad-except
            print(f"Error in list_by_course for course_id {course_id}: {exc}")
            import traceback
            traceback.print_exc()
            # Return empty list instead of raising to prevent 500 errors
            return []

    @staticmethod
    def _doc_to_dict(doc) -> dict:
        """Convert Firestore document to dict with id."""
        try:
            data = doc.to_dict()
            if not data:
                return {"id": doc.id}
            data["id"] = doc.id
            # Ensure order field exists with default value
            if "order" not in data:
                data["order"] = 0
            return data
        except Exception as exc:
            print(f"Error converting document to dict: {exc}")
            return {"id": doc.id, "order": 0}

    def get(self, module_id: str) -> dict | None:
        """Get a module by ID."""
        try:
            doc = self._db.collection("course_modules").document(module_id).get()
            if not doc.exists:
                return None
            return self._doc_to_dict(doc)
        except Exception as exc:
            print(f"Error getting module {module_id}: {exc}")
            raise exc

    def create(self, module_data: dict) -> str:
        """Create a new module."""
        try:
            # Add timestamps
            from datetime import datetime
            now = datetime.utcnow().isoformat() + "Z"
            if "created_at" not in module_data:
                module_data["created_at"] = now
            module_data["updated_at"] = now
            
            doc_ref = self._db.collection("course_modules").document()
            doc_ref.set(module_data)
            return doc_ref.id
        except Exception as exc:
            print(f"Error creating module: {exc}")
            raise exc

    def update(self, module_id: str, updates: dict) -> None:
        """Update a module."""
        try:
            from datetime import datetime
            updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
            
            self._db.collection("course_modules").document(module_id).update(updates)
        except Exception as exc:
            print(f"Error updating module {module_id}: {exc}")
            raise exc

    def delete(self, module_id: str) -> None:
        """Delete a module."""
        try:
            self._db.collection("course_modules").document(module_id).delete()
        except Exception as exc:
            print(f"Error deleting module {module_id}: {exc}")
            raise exc
