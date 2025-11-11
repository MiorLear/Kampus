import { useState, useEffect } from 'react';
import { 
  Course, 
  Enrollment, 
  Assignment, 
  Submission,
  Announcement,
  Message,
  ActivityLog,
  User,
} from '../services/firestore.service';
import { ApiService } from '../services/api.service';

// ========== COURSES ==========

export function useCourses(teacherId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getAllCourses(teacherId);
        setCourses(data);
      } catch (err: any) {
        console.error('Error loading courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId]);

  const refreshCourses = async () => {
    try {
      const data = await ApiService.getAllCourses(teacherId);
      setCourses(data);
    } catch (err: any) {
      console.error('Error refreshing courses:', err);
      setError(err.message || 'Failed to refresh courses');
    }
  };

  return { courses, loading, error, refreshCourses };
}

export function useCourse(courseId: string | null) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCourse(courseId);
        setCourse(data);
      } catch (err: any) {
        console.error('Error loading course:', err);
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const refreshCourse = async () => {
    if (!courseId) return;
    try {
      const data = await ApiService.getCourse(courseId);
      setCourse(data);
    } catch (err: any) {
      console.error('Error refreshing course:', err);
      setError(err.message || 'Failed to refresh course');
    }
  };

  return { course, loading, error, refreshCourse };
}

// ========== ENROLLMENTS ==========

export function useEnrollments(studentId?: string, courseId?: string) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        let data: Enrollment[];
        if (studentId) {
          data = await ApiService.getEnrollmentsByStudent(studentId);
        } else if (courseId) {
          data = await ApiService.getEnrollmentsByCourse(courseId);
        } else {
          data = [];
        }
        setEnrollments(data);
      } catch (err: any) {
        console.error('Error loading enrollments:', err);
        setError(err.message || 'Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [studentId, courseId]);

  const refreshEnrollments = async () => {
    try {
      let data: Enrollment[];
      if (studentId) {
        data = await ApiService.getEnrollmentsByStudent(studentId);
      } else if (courseId) {
        data = await ApiService.getEnrollmentsByCourse(courseId);
      } else {
        data = [];
      }
      setEnrollments(data);
    } catch (err: any) {
      console.error('Error refreshing enrollments:', err);
      setError(err.message || 'Failed to refresh enrollments');
    }
  };

  return { enrollments, loading, error, refreshEnrollments };
}

// ========== ASSIGNMENTS ==========

export function useAssignments(courseId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getAssignmentsByCourse(courseId);
        setAssignments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  const refreshAssignments = async () => {
    if (!courseId) return;
    try {
      const data = await ApiService.getAssignmentsByCourse(courseId);
      setAssignments(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { assignments, loading, error, refreshAssignments };
}

// ========== SUBMISSIONS ==========

export function useSubmissions(assignmentId?: string, studentId?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        let data: Submission[];
        if (assignmentId) {
          data = await ApiService.getSubmissionsByAssignment(assignmentId);
        } else if (studentId) {
          data = await ApiService.getSubmissionsByStudent(studentId);
        } else {
          data = [];
        }
        setSubmissions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId, studentId]);

  const refreshSubmissions = async () => {
    try {
      let data: Submission[];
      if (assignmentId) {
        data = await ApiService.getSubmissionsByAssignment(assignmentId);
      } else if (studentId) {
        data = await ApiService.getSubmissionsByStudent(studentId);
      } else {
        data = [];
      }
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { submissions, loading, error, refreshSubmissions };
}

// ========== ANNOUNCEMENTS ==========

export function useAnnouncements(courseId?: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getAnnouncementsByCourse(courseId);
        setAnnouncements(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [courseId]);

  const refreshAnnouncements = async () => {
    if (!courseId) return;
    try {
      const data = await ApiService.getAnnouncementsByCourse(courseId);
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { announcements, loading, error, refreshAnnouncements };
}

// ========== MESSAGES ==========

export function useMessages(userId: string, otherUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = otherUserId
          ? await ApiService.getMessagesBetweenUsers(userId, otherUserId)
          : await ApiService.getReceivedMessages(userId);
        setMessages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId, otherUserId]);

  const refreshMessages = async () => {
    try {
      const data = otherUserId
        ? await ApiService.getMessagesBetweenUsers(userId, otherUserId)
        : await ApiService.getReceivedMessages(userId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { messages, loading, error, refreshMessages };
}

// ========== USERS ==========

export function useUsers(role?: 'student' | 'teacher' | 'admin') {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = role
          ? await ApiService.getUsersByRole(role)
          : await ApiService.getAllUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role]);

  const refreshUsers = async () => {
    try {
      const data = role
        ? await ApiService.getUsersByRole(role)
        : await ApiService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { users, loading, error, refreshUsers };
}

// ========== ANALYTICS ==========

export function useAnalytics(type: 'student' | 'teacher' | 'course' | 'system', id?: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        let data;
        switch (type) {
          case 'student':
            if (id) data = await ApiService.getStudentAnalytics(id);
            break;
          case 'teacher':
            if (id) data = await ApiService.getTeacherAnalytics(id);
            break;
          case 'course':
            if (id) data = await ApiService.getCourseAnalytics(id);
            break;
          case 'system':
            data = await ApiService.getSystemAnalytics();
            break;
        }
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [type, id]);

  const refreshAnalytics = async () => {
    try {
      let data;
      switch (type) {
        case 'student':
          if (id) data = await ApiService.getStudentAnalytics(id);
          break;
        case 'teacher':
          if (id) data = await ApiService.getTeacherAnalytics(id);
          break;
        case 'course':
          if (id) data = await ApiService.getCourseAnalytics(id);
          break;
        case 'system':
          data = await ApiService.getSystemAnalytics();
          break;
      }
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { analytics, loading, error, refreshAnalytics };
}
