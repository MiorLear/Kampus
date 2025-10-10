import { FirestoreService } from './firestore.service';

export class SeedService {
  static async seedSampleData(userId: string, userName: string, userRole: 'student' | 'teacher' | 'admin') {
    console.log('Seeding sample data for user:', userName, userRole);

    try {
      if (userRole === 'admin') {
        // Create sample users first
        const sampleUsers = await this.createSampleUsers();
        
        // Create sample courses with different teachers
        const courses = await this.createSampleCourses(userId, sampleUsers);
        
        // Create enrollments
        await this.createSampleEnrollments(courses, sampleUsers);
        
        // Create assignments and announcements
        await this.createSampleAssignmentsAndAnnouncements(courses);
        
        console.log('Admin sample data created successfully!');
        return true;
      }

      if (userRole === 'teacher') {
        // Create sample courses for teacher
        const course1Id = await FirestoreService.createCourse({
          title: 'Introduction to Web Development',
          description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites. This comprehensive course covers everything from basic HTML tags to advanced CSS techniques and JavaScript programming.',
          teacher_id: userId,
        });

        const course2Id = await FirestoreService.createCourse({
          title: 'Advanced React Development',
          description: 'Master React hooks, state management, and modern patterns. Build scalable applications with best practices.',
          teacher_id: userId,
        });

        const course3Id = await FirestoreService.createCourse({
          title: 'Database Design Fundamentals',
          description: 'Learn how to design efficient and scalable databases. Covers normalization, relationships, and optimization.',
          teacher_id: userId,
        });

        // Create sample assignments for course 1
        const assignment1Id = await FirestoreService.createAssignment({
          course_id: course1Id,
          title: 'HTML Basics Quiz',
          description: 'Complete the quiz on HTML fundamentals including tags, attributes, and semantic HTML.',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        });

        const assignment2Id = await FirestoreService.createAssignment({
          course_id: course1Id,
          title: 'CSS Styling Project',
          description: 'Create a responsive landing page using CSS Flexbox and Grid. Submit the HTML and CSS files.',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        });

        const assignment3Id = await FirestoreService.createAssignment({
          course_id: course1Id,
          title: 'JavaScript Calculator',
          description: 'Build a functional calculator using vanilla JavaScript. Include basic operations and a clean UI.',
          due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        });

        // Create sample assignments for course 2
        await FirestoreService.createAssignment({
          course_id: course2Id,
          title: 'React Hooks Exercise',
          description: 'Implement a todo list application using useState and useEffect hooks.',
          due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        });

        await FirestoreService.createAssignment({
          course_id: course2Id,
          title: 'State Management with Redux',
          description: 'Build a shopping cart feature using Redux for state management.',
          due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Create sample announcements
        await FirestoreService.createAnnouncement({
          course_id: course1Id,
          title: 'Welcome to Web Development!',
          message: 'Welcome to the Introduction to Web Development course! We\'ll be covering HTML, CSS, and JavaScript over the next 8 weeks. Make sure to check the course materials and complete assignments on time.',
        });

        await FirestoreService.createAnnouncement({
          course_id: course1Id,
          title: 'Assignment 1 Released',
          message: 'The first assignment on HTML Basics is now available. The due date is next week. Good luck!',
        });

        await FirestoreService.createAnnouncement({
          course_id: course2Id,
          title: 'Course Materials Updated',
          message: 'New video lectures on React Hooks have been added to the course. Check them out in the materials section.',
        });

        console.log('Sample courses, assignments, and announcements created!');
      }

      if (userRole === 'student') {
        // For students, we can't enroll them automatically in courses
        // They would need to browse and enroll themselves
        console.log('Student account created. Browse courses to enroll.');
      }

      // Log the activity
      await FirestoreService.logActivity({
        user_id: userId,
        action: 'account_created',
        metadata: {
          role: userRole,
          timestamp: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error seeding data:', error);
      return false;
    }
  }

  // Helper method to enroll sample students in a course (for testing)
  static async enrollSampleStudents(courseId: string, studentIds: string[]) {
    try {
      for (const studentId of studentIds) {
        await FirestoreService.enrollStudent({
          student_id: studentId,
          course_id: courseId,
          progress: Math.floor(Math.random() * 100), // Random progress for demo
        });
      }
      console.log(`Enrolled ${studentIds.length} students in course ${courseId}`);
      return true;
    } catch (error) {
      console.error('Error enrolling sample students:', error);
      return false;
    }
  }

  // Helper method to create sample submissions (for testing)
  static async createSampleSubmissions(assignmentId: string, studentIds: string[]) {
    try {
      for (const studentId of studentIds) {
        const hasSubmitted = Math.random() > 0.3; // 70% chance of submission
        
        if (hasSubmitted) {
          const isGraded = Math.random() > 0.4; // 60% of submissions are graded
          
          await FirestoreService.createSubmission({
            assignment_id: assignmentId,
            student_id: studentId,
            grade: isGraded ? Math.floor(Math.random() * 30) + 70 : undefined, // 70-100
            feedback: isGraded ? 'Good work! Keep it up.' : undefined,
          });
        }
      }
      console.log(`Created sample submissions for assignment ${assignmentId}`);
      return true;
    } catch (error) {
      console.error('Error creating sample submissions:', error);
      return false;
    }
  }

  // Create sample users for admin
  static async createSampleUsers() {
    const sampleUsers = [
      // Teachers
      { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@kampus.edu', role: 'teacher' },
      { name: 'Prof. Michael Chen', email: 'michael.chen@kampus.edu', role: 'teacher' },
      { name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@kampus.edu', role: 'teacher' },
      
      // Students
      { name: 'Alex Thompson', email: 'alex.thompson@student.kampus.edu', role: 'student' },
      { name: 'Maria Garcia', email: 'maria.garcia@student.kampus.edu', role: 'student' },
      { name: 'David Kim', email: 'david.kim@student.kampus.edu', role: 'student' },
      { name: 'Lisa Wang', email: 'lisa.wang@student.kampus.edu', role: 'student' },
      { name: 'James Wilson', email: 'james.wilson@student.kampus.edu', role: 'student' },
      { name: 'Sophie Brown', email: 'sophie.brown@student.kampus.edu', role: 'student' },
      { name: 'Ryan Davis', email: 'ryan.davis@student.kampus.edu', role: 'student' },
      { name: 'Emma Taylor', email: 'emma.taylor@student.kampus.edu', role: 'student' },
    ];

    const createdUsers = [];
    for (const user of sampleUsers) {
      try {
        // Create user document directly in Firestore
        const userDoc = {
          name: user.name,
          email: user.email,
          role: user.role,
          photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
          created_at: new Date().toISOString(),
        };
        
        // Use FirestoreService to create the user
        const userId = await FirestoreService.createUser(userDoc);
        createdUsers.push({ id: userId, ...userDoc });
      } catch (error) {
        console.error('Error creating user:', user.name, error);
      }
    }
    
    console.log(`Created ${createdUsers.length} sample users`);
    return createdUsers;
  }

  // Create sample courses
  static async createSampleCourses(adminId: string, users: any[]) {
    const teachers = users.filter(u => u.role === 'teacher');
    const courses = [];

    const courseData = [
      {
        title: 'Introduction to Computer Science',
        description: 'Learn the fundamentals of computer science including algorithms, data structures, and programming concepts.',
        teacher: teachers[0]?.id || adminId,
      },
      {
        title: 'Web Development Bootcamp',
        description: 'Complete course covering HTML, CSS, JavaScript, React, and Node.js for full-stack development.',
        teacher: teachers[1]?.id || adminId,
      },
      {
        title: 'Data Science Fundamentals',
        description: 'Introduction to data analysis, statistics, and machine learning using Python and R.',
        teacher: teachers[2]?.id || adminId,
      },
      {
        title: 'Mobile App Development',
        description: 'Build mobile applications for iOS and Android using React Native and Flutter.',
        teacher: teachers[0]?.id || adminId,
      },
      {
        title: 'Cybersecurity Essentials',
        description: 'Learn about network security, encryption, and ethical hacking techniques.',
        teacher: teachers[1]?.id || adminId,
      },
    ];

    for (const course of courseData) {
      try {
        const courseId = await FirestoreService.createCourse({
          title: course.title,
          description: course.description,
          teacher_id: course.teacher,
        });
        courses.push({ id: courseId, ...course });
      } catch (error) {
        console.error('Error creating course:', course.title, error);
      }
    }

    console.log(`Created ${courses.length} sample courses`);
    return courses;
  }

  // Create sample enrollments
  static async createSampleEnrollments(courses: any[], users: any[]) {
    const students = users.filter(u => u.role === 'student');
    
    for (const course of courses) {
      // Enroll 3-5 random students in each course
      const numEnrollments = Math.floor(Math.random() * 3) + 3; // 3-5 students
      const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
      const enrolledStudents = shuffledStudents.slice(0, numEnrollments);

      for (const student of enrolledStudents) {
        try {
          await FirestoreService.enrollStudent({
            student_id: student.id,
            course_id: course.id,
            progress: Math.floor(Math.random() * 100), // Random progress 0-100
          });
        } catch (error) {
          console.error('Error enrolling student:', student.name, error);
        }
      }
    }

    console.log('Created sample enrollments');
  }

  // Create assignments and announcements
  static async createSampleAssignmentsAndAnnouncements(courses: any[]) {
    for (const course of courses) {
      // Create 2-3 assignments per course
      const numAssignments = Math.floor(Math.random() * 2) + 2; // 2-3 assignments
      
      for (let i = 0; i < numAssignments; i++) {
        try {
          const assignmentId = await FirestoreService.createAssignment({
            course_id: course.id,
            title: `${course.title} - Assignment ${i + 1}`,
            description: `Complete this assignment to demonstrate your understanding of ${course.title.toLowerCase()}.`,
            due_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(), // 1-3 weeks from now
          });

          // Create some submissions for this assignment
          const students = await FirestoreService.getEnrollmentsByCourse(course.id);
          if (students.length > 0) {
            await this.createSampleSubmissions(assignmentId, students.map(s => s.student_id));
          }
        } catch (error) {
          console.error('Error creating assignment for course:', course.title, error);
        }
      }

      // Create 1-2 announcements per course
      const numAnnouncements = Math.floor(Math.random() * 2) + 1; // 1-2 announcements
      
      for (let i = 0; i < numAnnouncements; i++) {
        try {
          await FirestoreService.createAnnouncement({
            course_id: course.id,
            title: `Welcome to ${course.title}!`,
            message: `Welcome to ${course.title}! This course will cover ${course.description.toLowerCase()}. Make sure to check the course materials and complete assignments on time.`,
          });
        } catch (error) {
          console.error('Error creating announcement for course:', course.title, error);
        }
      }
    }

    console.log('Created sample assignments and announcements');
  }
}
