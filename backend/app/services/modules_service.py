"""Modules service."""

from app.repositories.modules_repository import ModulesRepository


class ModulesService:
    def __init__(self, repository: ModulesRepository | None = None) -> None:
        self._repository = repository or ModulesRepository()

    def list_modules(self, course_id: str) -> list[dict]:
        return self._repository.list_by_course(course_id)

    def get_module(self, module_id: str) -> dict | None:
        return self._repository.get(module_id)

    def create_module(self, course_id: str, module_data: dict) -> str:
        # Ensure course_id link
        module_data["course_id"] = course_id
        return self._repository.create(module_data)

    def update_module(self, module_id: str, updates: dict) -> None:
        return self._repository.update(module_id, updates)

    def delete_module(self, module_id: str) -> None:
        return self._repository.delete(module_id)
