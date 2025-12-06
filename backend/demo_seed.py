import requests
import json
import datetime
import random

BASE_URL = "http://127.0.0.1:8000/api"

def log(msg, success=True):
    icon = "✅" if success else "❌"
    print(f"{icon} {msg}")

def create_course(title, description, teacher_id, image_url):
    payload = {
        "title": title,
        "description": description,
        "teacher_id": teacher_id,
        "cover_image_url": image_url
    }
    r = requests.post(f"{BASE_URL}/courses", json=payload)
    if r.status_code == 201:
        data = r.json()
        log(f"Created Course: {title}")
        return data["id"]
    log(f"Failed to create course {title}: {r.text}", False)
    return None

def create_module(course_id, title, type, content, order=0, duration=None):
    payload = {
        "title": title,
        "type": type,
        "content": content,
        "order": order
    }
    if duration:
        payload["duration"] = duration
        
    r = requests.post(f"{BASE_URL}/modules/courses/{course_id}/modules", json=payload)
    if r.status_code == 201:
        log(f"  Created Module: {title}")
        return True
    log(f"  Failed module {title}: {r.text}", False)
    return False

def create_assignment_with_module(course_id, title, type, questions, due_date_offset_days=7, order=0):
    # 1. Create Assignment
    due_date = (datetime.datetime.now() + datetime.timedelta(days=due_date_offset_days)).isoformat()
    payload = {
        "course_id": course_id,
        "title": title,
        "description": f"Assignment for {title}",
        "type": type,
        "max_attempts": 3,
        "passing_score": 70,
        "status": "published",
        "due_date": due_date,
        "questions": questions
    }
    
    r = requests.post(f"{BASE_URL}/assignments", json=payload)
    assignment_id = None
    if r.status_code == 201:
        assignment_id = r.json()["id"]
        log(f"  Created Assignment: {title}")
    else:
        log(f"  Failed assignment {title}: {r.text}", False)
        return

    # 2. Create Linked Module
    module_content = json.dumps({
        "assignmentId": assignment_id,
        "description": payload["description"]
    })
    
    create_module(course_id, title, "assignment", module_content, order)
    return assignment_id

def enroll_student(course_id, student_id, progress=0):
    payload = {
        "student_id": student_id,
        "course_id": course_id,
        "progress": progress
    }
    requests.post(f"{BASE_URL}/enrollments", json=payload)
    log(f"  Enrolled {student_id} in course")

def submit_assignment(assignment_id, student_id, answers, grade=None):
    payload = {
        "assignment_id": assignment_id,
        "student_id": student_id,
        "answers": answers,
        "submitted_at": datetime.datetime.now().isoformat()
    }
    # Note: Using the python backend submission endpoint
    r = requests.post(f"{BASE_URL}/submissions", json=payload)
    if r.status_code == 201:
        log(f"    Submitted assignment for {student_id}")
        # If we want to grade it immediately (mocking teacher action)
        # We would need a backend endpoint for grading updates.
        # Currently backend might not have update_submission exposed easily or we use generic update.
        submission_id = r.json()["id"]
        if grade is not None:
             # Update submission with grade
             update_payload = {"grade": grade, "feedback": "Great job!", "status": "graded"}
             requests.put(f"{BASE_URL}/submissions/{submission_id}", json=update_payload)
             log(f"    Graded submission: {grade}%")

def seed_demo_data():
    print("🚀 Injecting Demo Data...")
    
    # --- PROFILES ---
    mr_rodriguez = "teacher_dev_01"
    ms_thompson = "teacher_phy_01"
    
    alice = "student_alice"
    bob = "student_bob"
    charlie = "student_charlie"

    # --- COURSE 1: WEB DEVELOPMENT ---
    web_course_id = create_course(
        "Modern Web Development 2024", 
        "Master React, TypeScript, and Tailwind CSS in this comprehensive bootcamp.",
        mr_rodriguez,
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"
    )
    
    if web_course_id:
        create_module(web_course_id, "Intro to React", "video", "https://www.youtube.com/watch?v=Tn6-PIqc4UM", 0, "15 min")
        create_module(web_course_id, "Component Lifecycle", "text", "<h1>Lifecycle Methods</h1><p>Understanding mount, update, unmount...</p>", 1, "10 min")
        
        # Assignment 1
        q1 = [
            {"id": "q1", "type": "multiple-choice", "question": "What hook handles side effects?", "options": ["useState", "useEffect", "useMemo"], "correctAnswer": "useEffect", "points": 50},
            {"id": "q2", "type": "open-ended", "question": "Explain the Virtual DOM.", "points": 50}
        ]
        midterm_id = create_assignment_with_module(web_course_id, "Midterm Exam", "quiz", q1, due_date_offset_days=5, order=2)
        
        # Assignment 2 (Overdue)
        q2 = [{"id": "q1", "type": "open-ended", "question": "Build a Todo App", "points": 100}]
        project_id = create_assignment_with_module(web_course_id, "Final Project", "assignment", q2, due_date_offset_days=-2, order=3)

        # -- ENROLLMENTS & ACTIVITY --
        enroll_student(web_course_id, alice, 60)
        enroll_student(web_course_id, bob, 20)
        
        # Alice submitted midterm
        if midterm_id:
            submit_assignment(midterm_id, alice, {"q1": "useEffect", "q2": "It is a lightweight copy..."}, 95)
            
        # Bob missed the project (Overdue)
        # No submission

    # --- COURSE 2: PHYSICS ---
    phy_course_id = create_course(
        "Classical Mechanics",
        "Newtonian mechanics, kinematics, and dynamics.",
        ms_thompson,
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80"
    )

    if phy_course_id:
        create_module(phy_course_id, "Newton's First Law", "video", "https://www.youtube.com/watch?v=VideoID", 0, "12 min")
        create_module(phy_course_id, "Forces and Motion", "pdf", "http://example.com/physics.pdf", 1, "20 min")
        
        q_phy = [{"id": "p1", "type": "multiple-choice", "question": "F = ma?", "options": ["True", "False"], "correctAnswer": "True", "points": 100}]
        hw_id = create_assignment_with_module(phy_course_id, "Homework 1", "assignment", q_phy, order=2)

        enroll_student(phy_course_id, charlie, 15)
        
        if hw_id:
            submit_assignment(hw_id, charlie, {"p1": "True"}, 100)

    # --- COURSE 3: UNIVERSITY ADMISSION TEST (PAA) ---
    paa_course_id = create_course(
        "Prueba de Admisión Universitaria 2025",
        "Simulacro completo de la Prueba de Aptitud Académica (PAA) con secciones de matemáticas y español.",
        "teacher_admin_paa",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
    )

    if paa_course_id:
        create_module(paa_course_id, "Instrucciones Generales", "text", "<h1>Bienvenido al Simulacro</h1><p>Esta prueba evalúa tus habilidades en matemáticas y lectura crítica.</p>", 0, "5 min")
        
        # Section 1: Verbal Reasoning
        q_verbal = [
            {
                "id": "v1", "type": "multiple-choice", "points": 20,
                "question": "Seleccione la palabra más similar a: EFIMERO",
                "options": ["Duradero", "Pasajero", "Eterno", "Constante"],
                "correctAnswer": "Pasajero"
            },
            {
                "id": "v2", "type": "multiple-choice", "points": 20,
                "question": "Complete la oración: El _______ del artista fue evidente en cada trazo de la pintura.",
                "options": ["Talento", "Descuido", "Miedo", "Olvido"],
                "correctAnswer": "Talento"
            },
            {
                "id": "v3", "type": "multiple-choice", "points": 20,
                "question": "Lectura Crítica: ¿Cuál es la idea central del texto anterior?", 
                "options": ["La importancia de la fotosíntesis", "El ciclo del agua", "La historia de Roma", "La economía global"],
                "correctAnswer": "La importancia de la fotosíntesis"
            }
        ]
        create_assignment_with_module(paa_course_id, "Sección 1: Razonamiento Verbal", "quiz", q_verbal, due_date_offset_days=10, order=1)

        # Section 2: Math Reasoning
        q_math = [
            {
                "id": "m1", "type": "multiple-choice", "points": 20,
                "question": "Si x + 5 = 12, ¿cuál es el valor de x?",
                "options": ["5", "6", "7", "8"],
                "correctAnswer": "7"
            },
            {
                "id": "m2", "type": "multiple-choice", "points": 20,
                "question": "¿Cuál es el área de un círculo con radio 3?",
                "options": ["3π", "6π", "9π", "12π"],
                "correctAnswer": "9π"
            },
             {
                "id": "m3", "type": "multiple-choice", "points": 20,
                "question": "Si un tren viaja a 60 km/h, ¿cuánto recorre en 2.5 horas?",
                "options": ["120 km", "150 km", "100 km", "180 km"],
                "correctAnswer": "150 km"
            }
        ]
        create_assignment_with_module(paa_course_id, "Sección 2: Razonamiento Matemático", "quiz", q_math, due_date_offset_days=10, order=2)

        # Enroll demo students
        enroll_student(paa_course_id, alice, 0)
        enroll_student(paa_course_id, charlie, 0)

    print("\n✨ Demo data injection complete!")

if __name__ == "__main__":
    seed_demo_data()
