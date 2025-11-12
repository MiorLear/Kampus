"""Assignments service implementing business logic."""

from app.repositories.assignments_repository import AssignmentsRepository


class AssignmentsService:
    """Service for assignment-related operations."""

    def __init__(self, repository: AssignmentsRepository | None = None) -> None:
        self._repository = repository or AssignmentsRepository()

    def list_assignments(self, course_id: str | None = None) -> list[dict]:
        """List all assignments, optionally filtered by course_id."""
        return self._repository.list(course_id)

    def get_assignment(self, assignment_id: str) -> dict | None:
        """Get an assignment by ID."""
        return self._repository.get(assignment_id)

    def create_assignment(self, assignment_data: dict) -> str:
        """Create a new assignment."""
        # Validate required fields
        required_fields = ["course_id", "title", "description"]
        for field in required_fields:
            if field not in assignment_data:
                raise ValueError(f"Missing required field: {field}")

        return self._repository.create(assignment_data)

    def update_assignment(self, assignment_id: str, updates: dict) -> None:
        """Update an assignment."""
        # Validate that assignment exists
        assignment = self._repository.get(assignment_id)
        if not assignment:
            raise ValueError(f"Assignment {assignment_id} not found")

        # Remove id from updates if present
        updates.pop("id", None)
        self._repository.update(assignment_id, updates)

    def delete_assignment(self, assignment_id: str) -> None:
        """Delete an assignment."""
        assignment = self._repository.get(assignment_id)
        if not assignment:
            raise ValueError(f"Assignment {assignment_id} not found")
        self._repository.delete(assignment_id)

