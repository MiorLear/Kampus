"""Submissions service implementing business logic."""

from app.repositories.submissions_repository import SubmissionsRepository


class SubmissionsService:
    """Service for submission-related operations."""

    def __init__(self, repository: SubmissionsRepository | None = None) -> None:
        self._repository = repository or SubmissionsRepository()

    def list_submissions(
        self, assignment_id: str | None = None, student_id: str | None = None
    ) -> list[dict]:
        """List all submissions, optionally filtered by assignment_id or student_id."""
        return self._repository.list(assignment_id, student_id)

    def get_submission(self, submission_id: str) -> dict | None:
        """Get a submission by ID."""
        return self._repository.get(submission_id)

    def create_submission(self, submission_data: dict) -> str:
        """Create a new submission."""
        # Validate required fields
        required_fields = ["assignment_id", "student_id"]
        for field in required_fields:
            if field not in submission_data:
                raise ValueError(f"Missing required field: {field}")

        return self._repository.create(submission_data)

    def update_submission(self, submission_id: str, updates: dict) -> None:
        """Update a submission."""
        # Validate that submission exists
        submission = self._repository.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        # Remove id from updates if present
        updates.pop("id", None)
        self._repository.update(submission_id, updates)

    def delete_submission(self, submission_id: str) -> None:
        """Delete a submission."""
        submission = self._repository.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")
        self._repository.delete(submission_id)

