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

