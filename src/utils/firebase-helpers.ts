import { FirestoreService } from '../services/firestore.service';
import { SeedService } from '../services/seed.service';
import { toast } from 'sonner';

/**
 * Initialize sample data for a new user
 */
export async function initializeSampleData(
  userId: string,
  userName: string,
  userRole: 'student' | 'teacher' | 'admin'
) {
  try {
    const success = await SeedService.seedSampleData(userId, userName, userRole);
    if (success) {
      toast.success('Sample data initialized successfully!');
    }
    return success;
  } catch (error: any) {
    console.error('Error initializing sample data:', error);
    toast.error('Failed to initialize sample data');
    return false;
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time for display
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get grade letter from percentage
 */
export function getGradeLetter(grade: number): string {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
}

/**
 * Check if assignment is overdue
 */
export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Get time remaining until due date
 */
export function getTimeRemaining(dueDate?: string): string {
  if (!dueDate) return 'No due date';
  
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  
  if (diff < 0) return 'Overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  return 'Due soon';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get course progress color
 */
export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'text-green-600';
  if (progress >= 50) return 'text-blue-600';
  if (progress >= 25) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
    case 'graded':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'pending':
    case 'submitted':
      return 'outline';
    case 'dropped':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Log user activity
 */
export async function logActivity(userId: string, action: string, metadata?: Record<string, any>) {
  try {
    await FirestoreService.logActivity({
      user_id: userId,
      action,
      metadata,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Calculate time ago from timestamp
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}
