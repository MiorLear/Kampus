"""Activity logs service implementing business logic."""

from typing import Optional
from app.repositories.activity_logs_repository import ActivityLogsRepository


class ActivityLogsService:
    """Service for activity log-related operations."""

    def __init__(self, repository: ActivityLogsRepository | None = None) -> None:
        self._repository = repository or ActivityLogsRepository()

    def list_logs(self, limit: Optional[int] = None, user_id: Optional[str] = None) -> list[dict]:
        """List all activity logs, optionally filtered by user_id and limited."""
        return self._repository.list(limit=limit, user_id=user_id)

    def get_log(self, log_id: str) -> dict | None:
        """Get an activity log by ID."""
        return self._repository.get(log_id)

    def create_log(self, user_id: str, action: str, metadata: Optional[dict] = None) -> str:
        """Create a new activity log entry."""
        from datetime import datetime
        
        log_data = {
            "user_id": user_id,
            "action": action,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metadata": metadata or {},
        }
        
        return self._repository.create(log_data)
