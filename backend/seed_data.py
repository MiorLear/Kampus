import requests
import sys
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def log(msg, success=True):
    icon = "✅" if success else "❌"
    print(f"{icon} {msg}")

def seed_data():
    print(f"🚀 Starting data seed to {BASE_URL}...")
    
    # Check if server is up
    try:
        requests.get(f"{BASE_URL}/health")
        log("Server is running")
    except Exception:
        log("Server is NOT running. Please start 'python run.py' in backend/ first.", False)
        sys.exit(1)

    # 1. Create Teacher
    teacher_id = "teacher_seed_001"
    # Try to create user if API supports it, otherwise we just use the ID
    # endpoints.ts shows users endpoint. try getting it first
    # If users api not strictly required for key constraints, we skip complex user auth for now.
    
    # 2. Create Course
    course_payload = {
        "title": "Welcome to Kampus (Induction)",
        "description": "A complete guide to using the Kampus platform for teachers and students.",
        "teacher_id": teacher_id,
        "cover_image_url": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
    }
    
    try:
        r = requests.post(f"{BASE_URL}/courses", json=course_payload)
        if r.status_code == 201:
            course = r.json()
            course_id = course["id"]
            log(f"Created Course: {course_payload['title']} (ID: {course_id})")
        else:
            log(f"Failed to create course: {r.text}", False)
            course_id = None
            # Try fetching existing if this fails? Nah, unique generic check not implemented.
            return
            
    except Exception as e:
        log(f"Error creating course: {e}", False)
        return

    if not course_id:
        return

    # 3. Create Modules
    modules = [
        {
            "title": "Welcome to the Platform",
            "type": "text",
            "content": "<h1>Welcome!</h1><p>We are excited to have you here.</p>",
            "duration": "2 min",
            "order": 0
        },
        {
            "title": "Platform Overview Video",
            "type": "video",
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", # Rick roll safe test
            "duration": "5 min",
            "order": 1
        },
        {
            "title": "Getting Started Guide",
            "type": "pdf",
            "file_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "duration": "10 min",
            "order": 2
        },
        {
            "title": "Assignment: Setup Profile",
            "type": "assignment",
            "content": "<p>Please complete your user profile settings.</p>",
            "order": 3
        }
    ]

    for m in modules:
        try:
            r = requests.post(f"{BASE_URL}/modules/courses/{course_id}/modules", json=m)
            if r.status_code == 201:
                log(f"Created Module: {m['title']}")
            else:
                log(f"Failed to create module {m['title']}: {r.text} ({r.status_code})", False)
        except Exception as e:
            log(f"Error creating module {m['title']}: {e}", False)

    # 4. Create Assignment (Grading)
    assignment_payload = {
        "course_id": course_id,
        "title": "Module 1 Assessment",
        "description": "Test your knowledge about the platform basics.",
        "type": "quiz",
        "max_attempts": 3,
        "passing_score": 80,
        "status": "published",
        "questions": [
            {
                "id": "q1",
                "type": "multiple-choice",
                "question": "What is Kampus?",
                "options": ["LMS", "Social Network", "Video Game"],
                "correctAnswer": "LMS",
                "points": 10
            }
        ]
    }
    
    try:
        r = requests.post(f"{BASE_URL}/assignments", json=assignment_payload)
        if r.status_code == 201:
            log(f"Created Assignment: {assignment_payload['title']}")
        else:
            log(f"Failed to create assignment: {r.text}", False)
    except Exception as e:
        log(f"Error creating assignment: {e}", False)
        
    print("\n✨ Data seed completed! Refresh the frontend to see changes.")

if __name__ == "__main__":
    seed_data()
