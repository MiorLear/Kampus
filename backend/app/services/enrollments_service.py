"""Enrollments service."""

from app.repositories.enrollments_repository import EnrollmentsRepository


class EnrollmentsService:
    def __init__(self, repository: EnrollmentsRepository | None = None) -> None:
        self._repository = repository or EnrollmentsRepository()

    def list_by_student(self, student_id: str) -> list[dict]:
        return self._repository.list_by_student(student_id)

    def list_by_course(self, course_id: str) -> list[dict]:
        return self._repository.list_by_course(course_id)

    def enroll(self, student_id: str, course_id: str, progress: int = 0) -> str:
        if self._repository.exists(student_id, course_id):
            raise ValueError("Student is already enrolled in this course")
        return self._repository.create(student_id, course_id, progress)

    def unenroll(self, enrollment_id: str) -> None:
        self._repository.delete(enrollment_id)
