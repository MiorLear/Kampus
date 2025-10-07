import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Trophy,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Calendar,
  BookOpen,
  User
} from 'lucide-react';

interface Submission {
  id: string;
  evaluationId: string;
  evaluationTitle: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project';
  status: 'submitted' | 'graded' | 'returned' | 'late';
  score?: number;
  maxScore: number;
  percentage?: number;
  submittedAt: string;
  gradedAt?: string;
  dueDate: string;
  feedback?: string;
  attempts: number;
  maxAttempts?: number;
  timeSpent?: number; // in minutes
  isLate: boolean;
}

interface GradeSummary {
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
  totalPoints: number;
  earnedPoints: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

interface MyGradesProps {
  onViewSubmission?: (submissionId: string) => void;
  onDownloadFeedback?: (submissionId: string) => void;
}

const mockSubmissions: Submission[] = [
  {
    id: '1',
    evaluationId: 'eval1',
    evaluationTitle: 'HTML & CSS Quiz',
    courseId: 'course1',
    courseTitle: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Martinez',
    type: 'quiz',
    status: 'graded',
    score: 95,
    maxScore: 100,
    percentage: 95,
    submittedAt: '2024-01-15T10:30:00Z',
    gradedAt: '2024-01-16T14:20:00Z',
    dueDate: '2024-01-15T23:59:00Z',
    feedback: 'Excellent work! You demonstrated a strong understanding of HTML structure and CSS styling. Pay attention to semantic HTML elements in future assignments.',
    attempts: 1,
    maxAttempts: 3,
    timeSpent: 25,
    isLate: false
  },
  {
    id: '2',
    evaluationId: 'eval2',
    evaluationTitle: 'JavaScript Fundamentals Assignment',
    courseId: 'course1',
    courseTitle: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Martinez',
    type: 'assignment',
    status: 'graded',
    score: 88,
    maxScore: 100,
    percentage: 88,
    submittedAt: '2024-01-20T16:45:00Z',
    gradedAt: '2024-01-22T09:15:00Z',
    dueDate: '2024-01-20T23:59:00Z',
    feedback: 'Good implementation of JavaScript concepts. Your code is well-structured and functional. Consider adding more error handling and comments for better code documentation.',
    attempts: 1,
    maxAttempts: 2,
    timeSpent: 120,
    isLate: false
  },
  {
    id: '3',
    evaluationId: 'eval3',
    evaluationTitle: 'React Components Quiz',
    courseId: 'course2',
    courseTitle: 'Advanced React Patterns',
    instructor: 'Prof. Miguel Rodriguez',
    type: 'quiz',
    status: 'submitted',
    maxScore: 100,
    submittedAt: '2024-01-25T11:20:00Z',
    dueDate: '2024-01-25T23:59:00Z',
    attempts: 1,
    maxAttempts: 2,
    timeSpent: 30,
    isLate: false
  },
  {
    id: '4',
    evaluationId: 'eval4',
    evaluationTitle: 'Database Design Project',
    courseId: 'course3',
    courseTitle: 'Database Design Fundamentals',
    instructor: 'Dr. Ana Garcia',
    type: 'project',
    status: 'graded',
    score: 92,
    maxScore: 100,
    percentage: 92,
    submittedAt: '2024-01-18T14:30:00Z',
    gradedAt: '2024-01-20T16:45:00Z',
    dueDate: '2024-01-18T23:59:00Z',
    feedback: 'Outstanding database design! Your ER diagram is well-thought-out and your normalization is correct. The implementation follows best practices.',
    attempts: 1,
    maxAttempts: 1,
    timeSpent: 300,
    isLate: false
  },
  {
    id: '5',
    evaluationId: 'eval5',
    evaluationTitle: 'Midterm Exam',
    courseId: 'course1',
    courseTitle: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Martinez',
    type: 'exam',
    status: 'graded',
    score: 78,
    maxScore: 100,
    percentage: 78,
    submittedAt: '2024-01-10T09:00:00Z',
    gradedAt: '2024-01-12T10:30:00Z',
    dueDate: '2024-01-10T11:00:00Z',
    feedback: 'Good effort on the exam. You showed understanding of most concepts but struggled with some advanced CSS techniques. Review the flexbox and grid layouts.',
    attempts: 1,
    maxAttempts: 1,
    timeSpent: 90,
    isLate: false
  }
];

const mockGradeSummary: GradeSummary = {
  totalEvaluations: 5,
  completedEvaluations: 4,
  averageScore: 88.25,
  totalPoints: 500,
  earnedPoints: 353,
  gradeDistribution: {
    A: 2,
    B: 1,
    C: 1,
    D: 0,
    F: 0
  }
};

export function MyGrades({ onViewSubmission, onDownloadFeedback }: MyGradesProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [gradeSummary] = useState<GradeSummary>(mockGradeSummary);

  // Filter and sort submissions
  useEffect(() => {
    let filtered = submissions.filter(submission => {
      const matchesSearch = submission.evaluationTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      const matchesType = typeFilter === 'all' || submission.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'submittedAt':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'score':
          if (a.score === undefined && b.score === undefined) return 0;
          if (a.score === undefined) return 1;
          if (b.score === undefined) return -1;
          return b.score - a.score;
        case 'course':
          return a.courseTitle.localeCompare(b.courseTitle);
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, typeFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-purple-100 text-purple-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <FileText className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'exam': return <FileText className="h-4 w-4" />;
      case 'project': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getGradeColor = (percentage?: number) => {
    if (percentage === undefined) return 'text-muted-foreground';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage?: number) => {
    if (percentage === undefined) return 'N/A';
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'returned': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      case 'late': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Grade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{gradeSummary.averageScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{gradeSummary.earnedPoints}/{gradeSummary.totalPoints}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{gradeSummary.completedEvaluations}/{gradeSummary.totalEvaluations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Grade</p>
                <p className="text-2xl font-bold">{getGradeLetter(gradeSummary.averageScore)}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search evaluations or courses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="project">Project</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="submittedAt">Submitted Date</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map(submission => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(submission.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{submission.evaluationTitle}</h3>
                          <Badge variant="outline" className="text-xs">
                            {submission.type}
                          </Badge>
                          {submission.isLate && (
                            <Badge variant="destructive" className="text-xs">
                              Late
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{submission.courseTitle}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{submission.instructor}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Score */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      
                      {submission.score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getGradeColor(submission.percentage)}`}>
                            {submission.score}/{submission.maxScore}
                          </span>
                          <span className={`text-lg font-semibold ${getGradeColor(submission.percentage)}`}>
                            ({submission.percentage}%)
                          </span>
                          <Badge variant="outline" className={getGradeColor(submission.percentage)}>
                            {getGradeLetter(submission.percentage)}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>Pending grade</span>
                        </div>
                      )}
                    </div>

                    {/* Submission Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(submission.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Attempts: {submission.attempts}/{submission.maxAttempts || '∞'}</span>
                      </div>
                      {submission.timeSpent && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Time: {submission.timeSpent} min</span>
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {submission.feedback && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Instructor Feedback</h4>
                        <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewSubmission?.(submission.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    {submission.feedback && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDownloadFeedback?.(submission.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No submissions found</h3>
              <p className="text-muted-foreground">
                No submissions match your current filters. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
