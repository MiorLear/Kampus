"""Modules service."""

from app.repositories.modules_repository import ModulesRepository


class ModulesService:
    def __init__(self, repository: ModulesRepository | None = None) -> None:
        self._repository = repository or ModulesRepository()

    def list_modules(self, course_id: str) -> list[dict]:
        return self._repository.list_by_course(course_id)
