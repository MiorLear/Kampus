import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ========== TYPES ==========

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  photo_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'text' | 'video' | 'pdf' | 'image' | 'link' | 'assignment';
  content?: string;
  url?: string;
  file_url?: string;
  duration?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number; // 0-100
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  file_url?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  completed_at?: string;
  progress_percentage: number; // 0-100
  last_accessed_at: string;
  time_spent?: number; // Tiempo en segundos
  video_time_watched?: number; // Para videos: tiempo visto en segundos
  video_duration?: number; // Duración total del video en segundos
  times_accessed?: number; // Número de veces que se ha accedido
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  total_modules: number;
  completed_modules: number;
  progress_percentage: number; // 0-100
  last_accessed_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  course_id: string;
  title: string;
  message: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ========== FIRESTORE SERVICE ==========

export class FirestoreService {
  // ========== USERS ==========
  
  static async getUser(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  static async getUsersByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  static async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), data as any);
  }

  static async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId));
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  }

  // ========== COURSES ==========
  
  static async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...course,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const docSnap = await getDoc(doc(db, 'courses', courseId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as Course;
    } catch (error) {
      console.error('Error getting course:', error);
      return null;
    }
  }

  static async getAllCourses(): Promise<Course[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  static async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    try {
      const q = query(collection(db, 'courses'), where('teacher_id', '==', teacherId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    } catch (error) {
      console.error('Error getting courses by teacher:', error);
      return [];
    }
  }

  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    await updateDoc(doc(db, 'courses', courseId), {
      ...updates,
      updated_at: new Date().toISOString(),
    } as any);
  }

  static async deleteCourse(courseId: string): Promise<void> {
    await deleteDoc(doc(db, 'courses', courseId));
  }

  // ========== COURSE MODULES ==========

  static async addCourseModule(courseId: string, module: Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      console.log('FirestoreService.addCourseModule called with:', { courseId, module });
      
      const moduleData = {
        ...module,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Module data to add to Firestore:', moduleData);
      
      const docRef = await addDoc(collection(db, 'course_modules'), {
        course_id: courseId,
        ...moduleData
      });
      
      console.log('Module added to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding course module:', error);
      throw error;
    }
  }

  static async updateCourseModule(moduleId: string, updates: Partial<CourseModule>): Promise<void> {
    try {
      await updateDoc(doc(db, 'course_modules', moduleId), {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating course module:', error);
      throw error;
    }
  }

  static async deleteCourseModule(moduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'course_modules', moduleId));
    } catch (error) {
      console.error('Error deleting course module:', error);
      throw error;
    }
  }

  static async getCourseModules(courseId: string): Promise<CourseModule[]> {
    try {
      console.log('FirestoreService.getCourseModules called for course:', courseId);
      
      // First try without orderBy to see if that's the issue
      const q = query(
        collection(db, 'course_modules'), 
        where('course_id', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      const modules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseModule));
      
      // Sort by order locally instead of using orderBy
      modules.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      console.log('Retrieved modules from Firestore:', modules);
      
      return modules;
    } catch (error) {
      console.error('Error getting course modules:', error);
      return [];
    }
  }

  // ========== USER PROGRESS ==========

  /**
   * Guardar o actualizar progreso de un módulo (acceso automático)
   * Se llama cuando el estudiante accede a un módulo
   */
  static async saveModuleAccess(
    userId: string, 
    courseId: string, 
    moduleId: string,
    progressPercentage?: number
  ): Promise<void> {
    try {
      const existingProgress = await this.getUserProgress(userId, courseId, moduleId);
      const now = new Date().toISOString();
      
      if (existingProgress) {
        // Actualizar progreso existente
        await updateDoc(doc(db, 'user_progress', existingProgress.id), {
          last_accessed_at: now,
          times_accessed: (existingProgress.times_accessed || 0) + 1,
          ...(progressPercentage !== undefined && {
            progress_percentage: Math.max(existingProgress.progress_percentage || 0, progressPercentage)
          })
        });
      } else {
        // Crear nuevo registro de progreso
        await addDoc(collection(db, 'user_progress'), {
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: false,
          progress_percentage: progressPercentage || 0,
          last_accessed_at: now,
          times_accessed: 1
        });
      }
      
      // Actualizar progreso del curso (sin marcar como completo)
      await this.updateCourseProgress(userId, courseId);
    } catch (error) {
      console.error('Error saving module access:', error);
      // No lanzar error para no interrumpir la experiencia del usuario
    }
  }

  /**
   * Guardar progreso parcial (especialmente para videos)
   */
  static async saveModuleProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    progressData: {
      progress_percentage?: number;
      video_time_watched?: number;
      video_duration?: number;
      time_spent?: number;
    }
  ): Promise<void> {
    try {
      const existingProgress = await this.getUserProgress(userId, courseId, moduleId);
      const now = new Date().toISOString();
      
      if (existingProgress) {
        // Actualizar progreso existente
        const updates: any = {
          last_accessed_at: now,
          ...progressData
        };
        
        // Si se proporciona tiempo de video, calcular porcentaje automáticamente
        if (progressData.video_time_watched && progressData.video_duration) {
          const calculatedPercentage = Math.min(
            100,
            Math.round((progressData.video_time_watched / progressData.video_duration) * 100)
          );
          updates.progress_percentage = Math.max(
            existingProgress.progress_percentage || 0,
            calculatedPercentage
          );
        }
        
        await updateDoc(doc(db, 'user_progress', existingProgress.id), updates);
      } else {
        // Crear nuevo registro
        const progressPercentage = progressData.progress_percentage || 
          (progressData.video_time_watched && progressData.video_duration
            ? Math.round((progressData.video_time_watched / progressData.video_duration) * 100)
            : 0);
        
        await addDoc(collection(db, 'user_progress'), {
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: false,
          progress_percentage: progressPercentage,
          last_accessed_at: now,
          times_accessed: 1,
          ...progressData
        });
      }
      
      // Actualizar progreso del curso
      await this.updateCourseProgress(userId, courseId);
    } catch (error) {
      console.error('Error saving module progress:', error);
    }
  }

  /**
   * Marcar módulo como completado
   */
  static async markModuleComplete(userId: string, courseId: string, moduleId: string): Promise<void> {
    try {
      console.log('Marking module complete:', { userId, courseId, moduleId });
      
      // Check if progress already exists
      const existingProgress = await this.getUserProgress(userId, courseId, moduleId);
      
      if (existingProgress) {
        // Update existing progress
        await updateDoc(doc(db, 'user_progress', existingProgress.id), {
          completed: true,
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
          last_accessed_at: new Date().toISOString()
        });
      } else {
        // Create new progress record
        await addDoc(collection(db, 'user_progress'), {
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
          last_accessed_at: new Date().toISOString(),
          times_accessed: 1
        });
      }
      
      // Update course progress
      await this.updateCourseProgress(userId, courseId);
      
      console.log('Module marked as complete');
    } catch (error) {
      console.error('Error marking module complete:', error);
      throw error;
    }
  }

  static async getUserProgress(userId: string, courseId: string, moduleId: string): Promise<UserProgress | null> {
    try {
      const q = query(
        collection(db, 'user_progress'),
        where('user_id', '==', userId),
        where('course_id', '==', courseId),
        where('module_id', '==', moduleId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as UserProgress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  static async getUserProgressForCourse(userId: string, courseId: string): Promise<UserProgress[]> {
    try {
      const q = query(
        collection(db, 'user_progress'),
        where('user_id', '==', userId),
        where('course_id', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProgress));
    } catch (error) {
      console.error('Error getting user progress for course:', error);
      return [];
    }
  }

  static async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      // Get all modules for the course
      const modules = await this.getCourseModules(courseId);
      const totalModules = modules.length;
      
      // Get user progress for this course
      const userProgress = await this.getUserProgressForCourse(userId, courseId);
      const completedModules = userProgress.filter(p => p.completed).length;
      
      const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      // Check if course progress exists
      const q = query(
        collection(db, 'course_progress'),
        where('user_id', '==', userId),
        where('course_id', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new course progress
        await addDoc(collection(db, 'course_progress'), {
          user_id: userId,
          course_id: courseId,
          total_modules: totalModules,
          completed_modules: completedModules,
          progress_percentage: progressPercentage,
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // Update existing course progress
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, 'course_progress', docId), {
          total_modules: totalModules,
          completed_modules: completedModules,
          progress_percentage: progressPercentage,
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      console.log('Course progress updated:', { userId, courseId, progressPercentage });
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  static async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    try {
      const q = query(
        collection(db, 'course_progress'),
        where('user_id', '==', userId),
        where('course_id', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CourseProgress;
    } catch (error) {
      console.error('Error getting course progress:', error);
      return null;
    }
  }

  static async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    try {
      const q = query(
        collection(db, 'course_progress'),
        where('user_id', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseProgress));
    } catch (error) {
      console.error('Error getting user course progress:', error);
      return [];
    }
  }

  // ========== ENROLLMENTS ==========

  static async enrollStudent(enrollment: Omit<Enrollment, 'id' | 'enrolled_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'enrollments'), {
      ...enrollment,
      enrolled_at: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    try {
      const q = query(collection(db, 'enrollments'), where('student_id', '==', studentId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
    } catch (error) {
      console.error('Error getting enrollments by student:', error);
      return [];
    }
  }

  static async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    try {
      const q = query(collection(db, 'enrollments'), where('course_id', '==', courseId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
    } catch (error) {
      console.error('Error getting enrollments by course:', error);
      return [];
    }
  }

  static async updateEnrollment(enrollmentId: string, updates: Partial<Enrollment>): Promise<void> {
    await updateDoc(doc(db, 'enrollments', enrollmentId), updates as any);
  }

  static async deleteEnrollment(enrollmentId: string): Promise<void> {
    await deleteDoc(doc(db, 'enrollments', enrollmentId));
  }

  // ========== ASSIGNMENTS ==========

  static async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'assignments'), {
      ...assignment,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getAssignment(assignmentId: string): Promise<Assignment | null> {
    try {
      const docSnap = await getDoc(doc(db, 'assignments', assignmentId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as Assignment;
    } catch (error) {
      console.error('Error getting assignment:', error);
      return null;
    }
  }

  static async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    try {
      const q = query(collection(db, 'assignments'), where('course_id', '==', courseId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
    } catch (error) {
      console.error('Error getting assignments by course:', error);
      return [];
    }
  }

  static async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<void> {
    await updateDoc(doc(db, 'assignments', assignmentId), updates as any);
  }

  static async deleteAssignment(assignmentId: string): Promise<void> {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  }

  // ========== SUBMISSIONS ==========

  static async createSubmission(submission: Omit<Submission, 'id' | 'submitted_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'submissions'), {
      ...submission,
      submitted_at: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getSubmission(submissionId: string): Promise<Submission | null> {
    try {
      const docSnap = await getDoc(doc(db, 'submissions', submissionId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as Submission;
    } catch (error) {
      console.error('Error getting submission:', error);
      return null;
    }
  }

  static async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    try {
      const q = query(collection(db, 'submissions'), where('assignment_id', '==', assignmentId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
    } catch (error) {
      console.error('Error getting submissions by assignment:', error);
      return [];
    }
  }

  static async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    try {
      const q = query(collection(db, 'submissions'), where('student_id', '==', studentId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
    } catch (error) {
      console.error('Error getting submissions by student:', error);
      return [];
    }
  }

  static async updateSubmission(submissionId: string, updates: Partial<Submission>): Promise<void> {
    await updateDoc(doc(db, 'submissions', submissionId), updates as any);
  }

  static async deleteSubmission(submissionId: string): Promise<void> {
    await deleteDoc(doc(db, 'submissions', submissionId));
  }

  // ========== ANNOUNCEMENTS ==========

  static async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcement,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getAnnouncement(announcementId: string): Promise<Announcement | null> {
    try {
      const docSnap = await getDoc(doc(db, 'announcements', announcementId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as Announcement;
    } catch (error) {
      console.error('Error getting announcement:', error);
      return null;
    }
  }

  static async getAnnouncementsByCourse(courseId: string): Promise<Announcement[]> {
    try {
      const q = query(
        collection(db, 'announcements'),
        where('course_id', '==', courseId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    } catch (error) {
      console.error('Error getting announcements by course:', error);
      return [];
    }
  }

  static async updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Promise<void> {
    await updateDoc(doc(db, 'announcements', announcementId), updates as any);
  }

  static async deleteAnnouncement(announcementId: string): Promise<void> {
    await deleteDoc(doc(db, 'announcements', announcementId));
  }

  // ========== MESSAGES ==========

  static async sendMessage(message: Omit<Message, 'id' | 'sent_at' | 'read'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      sent_at: new Date().toISOString(),
      read: false,
    });
    return docRef.id;
  }

  static async getMessage(messageId: string): Promise<Message | null> {
    try {
      const docSnap = await getDoc(doc(db, 'messages', messageId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as Message;
    } catch (error) {
      console.error('Error getting message:', error);
      return null;
    }
  }

  static async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    try {
      const q1 = query(
        collection(db, 'messages'),
        where('sender_id', '==', userId1),
        where('receiver_id', '==', userId2)
      );
      const q2 = query(
        collection(db, 'messages'),
        where('sender_id', '==', userId2),
        where('receiver_id', '==', userId1)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const messages1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      const messages2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      return [...messages1, ...messages2].sort((a, b) => 
        new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
      );
    } catch (error) {
      console.error('Error getting messages between users:', error);
      return [];
    }
  }

  static async getReceivedMessages(userId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('receiver_id', '==', userId),
        orderBy('sent_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (error) {
      console.error('Error getting received messages:', error);
      return [];
    }
  }

  static async getSentMessages(userId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('sender_id', '==', userId),
        orderBy('sent_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (error) {
      console.error('Error getting sent messages:', error);
      return [];
    }
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    await updateDoc(doc(db, 'messages', messageId), { read: true });
  }

  static async deleteMessage(messageId: string): Promise<void> {
    await deleteDoc(doc(db, 'messages', messageId));
  }

  // ========== ACTIVITY LOGS ==========

  static async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'activity_logs'), {
      ...log,
      timestamp: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getActivityLogsByUser(userId: string, limitCount: number = 50): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, 'activity_logs'),
        where('user_id', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  static async getAllActivityLogs(limitCount: number = 100): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, 'activity_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
    } catch (error) {
      console.error('Error getting all activity logs:', error);
      return [];
    }
  }

  // ========== ANALYTICS ==========

  static async getStudentAnalytics(studentId: string) {
    try {
      const [enrollments, submissions] = await Promise.all([
        this.getEnrollmentsByStudent(studentId),
        this.getSubmissionsByStudent(studentId),
      ]);

      const totalCourses = enrollments.length;
      const averageProgress = totalCourses > 0
        ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses
        : 0;

      const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
      const averageGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        : 0;

      const pendingSubmissions = submissions.filter(s => s.grade === undefined || s.grade === null);

      return {
        totalCourses,
        averageProgress,
        totalSubmissions: submissions.length,
        gradedSubmissions: gradedSubmissions.length,
        pendingSubmissions: pendingSubmissions.length,
        averageGrade,
        enrollments,
        submissions,
      };
    } catch (error) {
      console.error('Error getting student analytics:', error);
      return null;
    }
  }

  static async getTeacherAnalytics(teacherId: string) {
    try {
      const courses = await this.getCoursesByTeacher(teacherId);
      const courseIds = courses.map(c => c.id);

      const enrollmentsPromises = courseIds.map(id => this.getEnrollmentsByCourse(id));
      const assignmentsPromises = courseIds.map(id => this.getAssignmentsByCourse(id));
      
      const [enrollmentsArrays, assignmentsArrays] = await Promise.all([
        Promise.all(enrollmentsPromises),
        Promise.all(assignmentsPromises),
      ]);

      const enrollments = enrollmentsArrays.flat();
      const assignments = assignmentsArrays.flat();

      const assignmentIds = assignments.map(a => a.id);
      const submissionsPromises = assignmentIds.map(id => this.getSubmissionsByAssignment(id));
      const submissionsArrays = await Promise.all(submissionsPromises);
      const submissions = submissionsArrays.flat();

      const pendingGrading = submissions.filter(s => s.grade === undefined || s.grade === null).length;

      return {
        totalCourses: courses.length,
        totalStudents: enrollments.length,
        totalAssignments: assignments.length,
        totalSubmissions: submissions.length,
        pendingGrading,
        courses,
        enrollments,
        assignments,
        submissions,
      };
    } catch (error) {
      console.error('Error getting teacher analytics:', error);
      return null;
    }
  }

  static async getCourseAnalytics(courseId: string) {
    try {
      const [course, enrollments, assignments, announcements] = await Promise.all([
        this.getCourse(courseId),
        this.getEnrollmentsByCourse(courseId),
        this.getAssignmentsByCourse(courseId),
        this.getAnnouncementsByCourse(courseId),
      ]);

      const totalStudents = enrollments.length;
      const averageProgress = totalStudents > 0
        ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalStudents
        : 0;

      return {
        course,
        totalStudents,
        averageProgress,
        totalAssignments: assignments.length,
        totalAnnouncements: announcements.length,
        enrollments,
        assignments,
        announcements,
      };
    } catch (error) {
      console.error('Error getting course analytics:', error);
      return null;
    }
  }

  static async getSystemAnalytics() {
    try {
      const [users, courses, enrollments, assignments, submissions] = await Promise.all([
        this.getAllUsers(),
        this.getAllCourses(),
        getDocs(collection(db, 'enrollments')),
        getDocs(collection(db, 'assignments')),
        getDocs(collection(db, 'submissions')),
      ]);

      const students = users.filter(u => u.role === 'student');
      const teachers = users.filter(u => u.role === 'teacher');
      const admins = users.filter(u => u.role === 'admin');

      return {
        totalUsers: users.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalAdmins: admins.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.size,
        totalAssignments: assignments.size,
        totalSubmissions: submissions.size,
      };
    } catch (error) {
      console.error('Error getting system analytics:', error);
      return null;
    }
  }
}
