"""Users service implementing business logic."""

from app.repositories.users_repository import UsersRepository


class UsersService:
    """Service for user-related operations."""

    def __init__(self, repository: UsersRepository | None = None) -> None:
        self._repository = repository or UsersRepository()

    def list_users(self, role: str | None = None) -> list[dict]:
        """List all users, optionally filtered by role."""
        return self._repository.list(role)

    def get_user(self, user_id: str) -> dict | None:
        """Get a user by ID."""
        return self._repository.get(user_id)

    def update_user(self, user_id: str, updates: dict) -> None:
        """Update a user."""
        # Validate that user exists
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        # Remove id from updates if present
        updates.pop("id", None)
        self._repository.update(user_id, updates)

    def delete_user(self, user_id: str) -> None:
        """Delete a user."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        self._repository.delete(user_id)

    def get_user_stats(self) -> dict:
        """Get user statistics."""
        return self._repository.get_stats()

    def create_user_profile(self, user_id: str, profile_data: dict) -> dict:
        """Create a new user profile."""
        # Add timestamps
        from datetime import datetime
        now = datetime.utcnow().isoformat() + "Z"
        profile_data["created_at"] = now
        profile_data["updated_at"] = now
        
        # Set defaults if not provided
        profile_data.setdefault("status", "active")
        profile_data.setdefault("email_verified", False)
        
        return self._repository.create(user_id, profile_data)

    def update_student_profile(self, user_id: str, updates: dict) -> None:
        """Update a student profile."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        if user.get("role") != "student":
            raise ValueError(f"User {user_id} is not a student")
        
        from datetime import datetime
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        self._repository.update(user_id, updates)

    def update_teacher_profile(self, user_id: str, updates: dict) -> None:
        """Update a teacher profile."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        if user.get("role") != "teacher":
            raise ValueError(f"User {user_id} is not a teacher")
        
        from datetime import datetime
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        self._repository.update(user_id, updates)

    def update_admin_profile(self, user_id: str, updates: dict) -> None:
        """Update an admin profile."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        if user.get("role") != "admin":
            raise ValueError(f"User {user_id} is not an admin")
        
        from datetime import datetime
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        self._repository.update(user_id, updates)

    def update_student_stats(self, user_id: str, stats: dict) -> None:
        """Update student statistics."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        if user.get("role") != "student":
            raise ValueError(f"User {user_id} is not a student")
        
        self._repository.update_stats(user_id, stats)

    def update_teacher_stats(self, user_id: str, stats: dict) -> None:
        """Update teacher statistics."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        if user.get("role") != "teacher":
            raise ValueError(f"User {user_id} is not a teacher")
        
        self._repository.update_stats(user_id, stats)

    def update_admin_stats(self, user_id: str, stats: dict) -> None:
        """Update admin statistics."""
        user = self._repository.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        if user.get("role") != "admin":
            raise ValueError(f"User {user_id} is not an admin")
        
        self._repository.update_stats(user_id, stats)

    def update_admin_permissions(self, user_id: str, permissions: dict) -> None:
        """Update admin permissions."""
        self._repository.update_permissions(user_id, permissions)

