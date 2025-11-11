"""Progress service encapsulating progress logic."""

from __future__ import annotations

from datetime import datetime, timezone

from app.repositories.modules_repository import ModulesRepository
from app.repositories.progress_repository import ProgressRepository


class ProgressService:
    def __init__(
        self,
        progress_repository: ProgressRepository | None = None,
        modules_repository: ModulesRepository | None = None,
    ) -> None:
        self._progress_repository = progress_repository or ProgressRepository()
        self._modules_repository = modules_repository or ModulesRepository()

    # ------------------------------------------------------------------
    # Module progress
    # ------------------------------------------------------------------

    def save_module_access(
        self,
        user_id: str,
        course_id: str,
        module_id: str,
        progress_percentage: int | None = None,
    ) -> None:
        now = self._timestamp()
        existing = self._progress_repository.get_module_progress(user_id, course_id, module_id)

        payload: dict = {
            "last_accessed_at": now,
            "times_accessed": (existing.get("times_accessed", 0) + 1) if existing else 1,
            "completed": existing.get("completed", False) if existing else False,
        }

        if progress_percentage is not None:
            current = existing.get("progress_percentage", 0) if existing else 0
            payload["progress_percentage"] = max(current, progress_percentage)

        self._progress_repository.save_module_progress(user_id, course_id, module_id, payload)
        self._update_course_progress(user_id, course_id)

    def save_module_progress(
        self,
        user_id: str,
        course_id: str,
        module_id: str,
        progress_data: dict,
    ) -> None:
        existing = self._progress_repository.get_module_progress(user_id, course_id, module_id)
        now = self._timestamp()

        payload: dict = {
            "last_accessed_at": now,
            "completed": existing.get("completed", False) if existing else False,
            **progress_data,
        }

        if "progress_percentage" in progress_data and existing:
            payload["progress_percentage"] = max(
                existing.get("progress_percentage", 0), progress_data["progress_percentage"]
            )

        if "progress_percentage" not in payload and existing:
            payload["progress_percentage"] = existing.get("progress_percentage", 0)

        self._progress_repository.save_module_progress(user_id, course_id, module_id, payload)
        self._update_course_progress(user_id, course_id)

    def mark_module_complete(self, user_id: str, course_id: str, module_id: str) -> None:
        now = self._timestamp()
        payload = {
            "completed": True,
            "completed_at": now,
            "last_accessed_at": now,
            "progress_percentage": 100,
        }
        self._progress_repository.save_module_progress(user_id, course_id, module_id, payload)
        self._update_course_progress(user_id, course_id)

    def get_module_progress(self, user_id: str, course_id: str, module_id: str) -> dict | None:
        return self._progress_repository.get_module_progress(user_id, course_id, module_id)

    def list_course_module_progress(self, user_id: str, course_id: str) -> list[dict]:
        return self._progress_repository.list_module_progress(user_id, course_id)

    # ------------------------------------------------------------------
    # Course progress
    # ------------------------------------------------------------------

    def get_course_progress(self, user_id: str, course_id: str) -> dict | None:
        return self._progress_repository.get_course_progress(user_id, course_id)

    def _update_course_progress(self, user_id: str, course_id: str) -> None:
        modules = self._modules_repository.list_by_course(course_id)
        total_modules = len(modules)

        module_progress = self._progress_repository.list_module_progress(user_id, course_id)
        completed_modules = sum(1 for item in module_progress if item.get("completed"))

        progress_percentage = 0
        if total_modules > 0:
            progress_percentage = round((completed_modules / total_modules) * 100)

        payload = {
            "total_modules": total_modules,
            "completed_modules": completed_modules,
            "progress_percentage": progress_percentage,
            "updated_at": self._timestamp(),
        }

        self._progress_repository.save_course_progress(user_id, course_id, payload)

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()
