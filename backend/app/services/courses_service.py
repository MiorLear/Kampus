"""Courses service implementing business logic."""

from app.repositories.courses_repository import CoursesRepository


class CoursesService:
    def __init__(self, repository: CoursesRepository | None = None) -> None:
        self._repository = repository or CoursesRepository()

    def list_courses(self, teacher_id: str | None = None) -> list[dict]:
        return self._repository.list(teacher_id)

    def get_course(self, course_id: str) -> dict | None:
        return self._repository.get(course_id)
