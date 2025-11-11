# Flask application factory

from flask import Flask, jsonify, request
from flask_cors import CORS

from app.config import Config
from app.firebase import init_firebase
from app.api.courses import courses_bp
from app.api.modules import modules_bp
from app.api.enrollments import enrollments_bp
from app.api.progress import progress_bp
from app.api.users import users_bp


def create_app() -> Flask:
    """Application factory for the Kampus backend."""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Disable strict_slashes to prevent redirects that break CORS preflight
    app.url_map.strict_slashes = False

    # Enable CORS with the most permissive settings for development
    CORS(app, 
         origins="*",
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         supports_credentials=False,
         max_age=3600)
    
    # Explicit OPTIONS handler as fallback
    @app.before_request
    def handle_preflight():
        """Handle preflight OPTIONS requests explicitly."""
        if request.method == "OPTIONS":
            response = jsonify({})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
            response.headers.add("Access-Control-Max-Age", "3600")
            return response
    
    # Add request logging
    @app.before_request
    def log_request():
        """Log incoming requests."""
        print(f"[{request.method}] {request.path} - Origin: {request.headers.get('Origin', 'None')}")
    
    @app.after_request
    def add_cors_headers(response):
        """Ensure CORS headers are always present and override any conflicting values."""
        # Use set() instead of add() to override any existing headers
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response

    # Initialize Firebase Admin SDK
    init_firebase()

    # Register API blueprints (must be after CORS initialization)
    app.register_blueprint(courses_bp, url_prefix="/courses")
    app.register_blueprint(modules_bp, url_prefix="/modules")
    app.register_blueprint(enrollments_bp, url_prefix="/enrollments")
    app.register_blueprint(progress_bp, url_prefix="/progress")
    app.register_blueprint(users_bp, url_prefix="/users")

    @app.get("/")
    def api_index():
        """Return a simple index of available API endpoints."""
        return jsonify(
            {
                "message": "Kampus API",
                "endpoints": {
                    "users": [
                        "/users",
                        "  /users?role=<role>",
                        "/users/<user_id>",
                        "PUT /users/<user_id>",
                        "DELETE /users/<user_id>",
                        "/users/stats",
                    ],
                    "courses": [
                        "/courses",
                        "/courses?teacher_id=<teacher_id>",
                    ],
                    "modules": [
                        "/modules/courses/<course_id>/modules",
                    ],
                    "enrollments": [
                        "/enrollments?student_id=<user_id>",
                        "/enrollments?course_id=<course_id>",
                        "POST /enrollments",
                    ],
                    "progress": [
                        "POST /progress/access",
                        "POST /progress",
                        "POST /progress/complete",
                        "/progress/module/<user_id>/<course_id>/<module_id>",
                        "/progress/course/<user_id>/<course_id>",
                        "/progress/course/<user_id>/<course_id>/summary",
                    ],
                },
            }
        )

    @app.get("/health")
    def health_check():
        """Health check endpoint."""
        return jsonify({"status": "ok", "message": "API is running"}), 200

    return app
