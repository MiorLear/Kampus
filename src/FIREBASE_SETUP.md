# Firebase Setup Guide for Kampus LMS

This guide will help you set up and configure Firebase for your Kampus LMS application.

## Firebase Configuration

The application is already configured with your Firebase credentials. The configuration is located in `/config/firebase.ts`.

## Firestore Database Structure

The application uses the following Firestore collections:

### Collections

1. **users**
   - User profiles with roles (student, teacher, admin)
   - Fields: `id`, `email`, `name`, `role`, `photo_url`, `created_at`

2. **courses**
   - Course information and content
   - Fields: `id`, `title`, `description`, `teacher_id`, `created_at`, `updated_at`

3. **enrollments**
   - Student enrollments in courses
   - Fields: `id`, `student_id`, `course_id`, `enrolled_at`, `progress`

4. **assignments**
   - Course assignments and tasks
   - Fields: `id`, `course_id`, `title`, `description`, `due_date`, `created_at`

5. **submissions**
   - Student submissions for assignments
   - Fields: `id`, `assignment_id`, `student_id`, `submitted_at`, `grade`, `feedback`, `file_url`

6. **announcements**
   - Course announcements
   - Fields: `id`, `course_id`, `title`, `message`, `created_at`

7. **messages**
   - Direct messages between users
   - Fields: `id`, `sender_id`, `receiver_id`, `content`, `sent_at`, `read`

8. **activity_logs**
   - User activity tracking
   - Fields: `id`, `user_id`, `action`, `timestamp`, `metadata`

## Firestore Security Rules

To secure your database, add these rules in the Firebase Console under Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return getUserRole() == 'admin';
    }
    
    function isTeacher() {
      return getUserRole() == 'teacher';
    }
    
    function isStudent() {
      return getUserRole() == 'student';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow create: if isTeacher() || isAdmin();
      allow update: if isAdmin() || (isTeacher() && resource.data.teacher_id == request.auth.uid);
      allow delete: if isAdmin() || (isTeacher() && resource.data.teacher_id == request.auth.uid);
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAdmin() || isTeacher() || (isStudent() && resource.data.student_id == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated();
      allow create: if isTeacher() || isAdmin();
      allow update: if isAdmin() || isTeacher();
      allow delete: if isAdmin() || isTeacher();
    }
    
    // Submissions collection
    match /submissions/{submissionId} {
      allow read: if isAuthenticated();
      allow create: if isStudent();
      allow update: if isAdmin() || isTeacher() || (isStudent() && resource.data.student_id == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow create: if isTeacher() || isAdmin();
      allow update: if isAdmin() || isTeacher();
      allow delete: if isAdmin() || isTeacher();
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated() && 
        (resource.data.sender_id == request.auth.uid || resource.data.receiver_id == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.receiver_id == request.auth.uid;
      allow delete: if isAuthenticated() && 
        (resource.data.sender_id == request.auth.uid || resource.data.receiver_id == request.auth.uid);
    }
    
    // Activity logs collection
    match /activity_logs/{logId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.user_id == request.auth.uid);
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
```

## Firestore Indexes

For optimal query performance, create these composite indexes:

1. **announcements**
   - Fields: `course_id` (Ascending), `created_at` (Descending)

2. **messages**
   - Fields: `receiver_id` (Ascending), `sent_at` (Descending)
   - Fields: `sender_id` (Ascending), `sent_at` (Descending)

3. **activity_logs**
   - Fields: `user_id` (Ascending), `timestamp` (Descending)

These indexes will be automatically suggested by Firebase when you first run queries that need them.

## Firebase Authentication Setup

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Email/Password" authentication
3. (Optional) Enable email verification in the Settings
4. (Optional) Customize email templates for verification and password reset

## Storage Setup (Optional)

If you want to enable file uploads for assignment submissions:

1. Go to Firebase Console > Storage
2. Click "Get Started"
3. Choose production mode
4. Select your storage location
5. Configure storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Assignment submissions
    match /submissions/{assignmentId}/{studentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == studentId;
    }
    
    // Course materials
    match /courses/{courseId}/materials/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Initial Setup Steps

1. **Enable Authentication**: Make sure Email/Password is enabled in Firebase Console
2. **Set up Security Rules**: Copy the rules above into Firestore Rules
3. **Create an admin account**: 
   - Register a new user through the app
   - Go to Firestore in Firebase Console
   - Find the user in the `users` collection
   - Change their `role` field from `student` to `admin`
4. **Test the app**: Try logging in with different roles to ensure everything works

## Using the Application

### For Students:
- Register with an email and password
- Browse available courses
- Enroll in courses
- Submit assignments
- View grades and feedback
- Check course announcements

### For Teachers:
- Register as a teacher
- Create and manage courses
- Create assignments with due dates
- Grade student submissions
- Post announcements
- View course analytics

### For Admins:
- Manage all users
- Oversee all courses
- View system-wide analytics
- Monitor activity logs
- Handle user issues

## Development Notes

- All Firebase services are initialized in `/config/firebase.ts`
- Authentication logic is in `/services/auth.service.ts`
- Database operations are in `/services/firestore.service.ts`
- Custom hooks are in `/hooks/useAuth.ts` and `/hooks/useFirestore.ts`
- Helper utilities are in `/utils/firebase-helpers.ts`

## Sample Data

When teachers or admins first log in, they'll see a prompt to initialize sample data:
- 3 sample courses
- Multiple assignments per course
- Course announcements
- Activity logs

Students can browse these courses and enroll.

## Troubleshooting

### "Permission denied" errors
- Verify Firestore security rules are properly configured
- Check that the user is authenticated
- Ensure the user has the correct role for the operation

### Authentication not working
- Verify Email/Password is enabled in Firebase Console
- Check Firebase configuration in `/config/firebase.ts`
- Look for errors in browser console

### Data not loading
- Check browser console for specific errors
- Verify Firestore security rules allow read access
- Ensure user is authenticated

### Queries failing
- Create required composite indexes (Firebase will prompt you)
- Wait a few minutes for indexes to build

## Production Checklist

Before deploying to production:

- [ ] Set up proper Firestore security rules
- [ ] Enable email verification
- [ ] Configure custom email templates
- [ ] Set up Firebase Storage rules
- [ ] Create composite indexes
- [ ] Set up backup and export policies
- [ ] Configure monitoring and alerts
- [ ] Review and test all user roles
- [ ] Set up rate limiting (optional)
- [ ] Enable Analytics (optional)

## Next Steps

1. Customize the database structure for your specific needs
2. Add more fields to collections as required
3. Implement real-time listeners for live updates
4. Add push notifications using Firebase Cloud Messaging
5. Set up Cloud Functions for complex backend logic
6. Implement advanced analytics and reporting

For more information, visit the [Firebase Documentation](https://firebase.google.com/docs).
