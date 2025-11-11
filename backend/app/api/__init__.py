from app.api.courses import courses_bp
from app.api.modules import modules_bp
from app.api.enrollments import enrollments_bp
from app.api.progress import progress_bp

__all__ = [
    "courses_bp",
    "modules_bp",
    "enrollments_bp",
    "progress_bp",
]
