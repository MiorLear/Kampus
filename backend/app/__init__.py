# Flask application factory

from flask import Flask, jsonify, request
from flask_cors import CORS

from app.config import Config
from app.firebase import init_firebase
from app.api.courses import courses_bp
from app.api.modules import modules_bp
from app.api.enrollments import enrollments_bp
from app.api.progress import progress_bp


def create_app() -> Flask:
    """Application factory for the Kampus backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for the frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("FRONTEND_URL", "*")}},
        supports_credentials=True,
    )

    # Initialize Firebase Admin SDK
    init_firebase()

    # Register API blueprints
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(modules_bp, url_prefix="/api/modules")
    app.register_blueprint(enrollments_bp, url_prefix="/api/enrollments")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")

    @app.get("/api")
    def api_index():
        """Return a simple index of available API endpoints."""
        base_url = request.host_url.rstrip("/")
        return jsonify(
            {
                "message": "Kampus API",
                "endpoints": {
                    "courses": [
                        f"{base_url}/api/courses",
                        f"{base_url}/api/courses?teacher_id=<teacher_id>",
                    ],
                    "modules": [
                        f"{base_url}/api/modules/courses/<course_id>/modules",
                    ],
                    "enrollments": [
                        f"{base_url}/api/enrollments?student_id=<user_id>",
                        f"{base_url}/api/enrollments?course_id=<course_id>",
                        f"POST {base_url}/api/enrollments",
                    ],
                    "progress": [
                        f"POST {base_url}/api/progress/access",
                        f"POST {base_url}/api/progress",
                        f"POST {base_url}/api/progress/complete",
                        f"{base_url}/api/progress/module/<user_id>/<course_id>/<module_id>",
                        f"{base_url}/api/progress/course/<user_id>/<course_id>",
                        f"{base_url}/api/progress/course/<user_id>/<course_id>/summary",
                    ],
                },
            }
        )

    return app
