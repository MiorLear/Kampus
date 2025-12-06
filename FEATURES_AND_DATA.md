# Features and Demo Data Overview

This document outlines the specific features added to Kampus and the demo data available for testing.

## New Features

### 1. Assignment-Module Synchronization
**Problem:** Previously, assignments created in the "Grading" section were not automatically appearing in the Course Modules for students.
**Solution:** 
- **Automatic Sync:** Newly created assignments now automatically generate a corresponding module.
- **Manual Sync Tool:** A "Sync to Modules" button was added to the Teacher's Evaluation/Grading dashboard. This scans for orphan assignments and generates the missing modules in one click.

### 2. Assignment Submission & Grading
- **Student View:** Students can now open assignments directly from the course module list. Code assignments and Quizzes are partially supported via the `EvaluationPlayer`.
- **Submission:** Submissions are saved to the backend and linked to the student and assignment.

### 3. Profile Picture Management
- **Role-Aware Updates:** The profile picture update dialog now correctly handles Students, Teachers, and Admins, saving the image URL to the appropriate profile collection in Firestore.

---

## Demo Data Scenarios

To demonstrate these features, the database has been seeded with rich content scenarios.

### Scenario A: Modern Web Development (Tech Bootcamp)
*   **Course:** `Modern Web Development 2024`
*   **Teacher:** `mr_rodriguez` (Dev Specialist)
*   **Students:** 
    *   `student_alice` (High performer, submitted Midterm)
    *   `student_bob` (struggling, missed Final Project)
*   **Content:**
    *   Video Modules (Intro to React)
    *   Text Modules (Lifecycles)
    *   **Midterm Exam:** A quiz with multiple choice and open-ended questions.
    *   **Final Project:** A complex assignment (Overdue for Bob).

### Scenario B: University Admission Test (PAA)
*   **Course:** `Prueba de Admisión Universitaria 2025`
*   **Teacher:** `teacher_admin_paa`
*   **Focus:** Academic Aptitude Testing
*   **Content:**
    *   **Sección 1: Razonamiento Verbal:** Analogies, Sentence Completion, Critical Reading.
    *   **Sección 2: Razonamiento Matemático:** Geometry, Algebra, Logic.
*   **Students:** `student_charlie` is enrolled to take this simulation.

### Scenario C: Classical Mechanics (Physics)
*   **Course:** `Classical Mechanics`
*   **Teacher:** `ms_thompson`
*   **Content:** Video lectures and a standard Homework assignment.
*   **Students:** `student_charlie` (Submitted Homework 1).

## How to Test

1.  **Run Backend:** `cd backend && python run.py`
2.  **Run Frontend:** `npm run dev`
3.  **Log in as Alice (`student_alice`):**
    *   Go to "My Courses".
    *   Open "Modern Web Development".
    *   Check your Grade for "Midterm Exam".
4.  **Log in as Teacher:**
    *   Go to Dashboard -> Grading.
    *   Select "Precalculo" (or any legacy course).
    *   Click "Sync to Modules" to fix missing assignment links.
