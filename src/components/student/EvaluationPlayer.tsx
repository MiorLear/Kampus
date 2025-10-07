import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Save, 
  Send, 
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface Evaluation {
  id: string;
  title: string;
  course: string;
  type: 'quiz' | 'assignment' | 'exam';
  status: string;
  maxScore: number;
  dueDate: string;
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  currentAttempt?: number;
  isProctored?: boolean;
  allowReview?: boolean;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'open-ended' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  points: number;
  correctAnswer?: string;
  explanation?: string;
  isRequired?: boolean;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple-choice',
    question: 'Which HTML tag is used to create a hyperlink?',
    options: ['<link>', '<href>', '<a>', '<url>'],
    points: 10
  },
  {
    id: '2',
    type: 'multiple-choice',
    question: 'What does CSS stand for?',
    options: [
      'Computer Style Sheets',
      'Cascading Style Sheets',
      'Creative Style Sheets',
      'Colorful Style Sheets'
    ],
    points: 10
  },
  {
    id: '3',
    type: 'open-ended',
    question: 'Explain the difference between HTML, CSS, and JavaScript. Provide examples of when you would use each.',
    points: 20
  },
  {
    id: '4',
    type: 'multiple-choice',
    question: 'Which JavaScript method is used to add an element to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    points: 10
  },
  {
    id: '5',
    type: 'open-ended',
    question: 'Describe the box model in CSS and how it affects element layout.',
    points: 15
  }
];

interface EvaluationPlayerProps {
  evaluation: Evaluation;
  onBack: () => void;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onSaveDraft?: (answers: Record<string, string>) => Promise<void>;
}

export function EvaluationPlayer({ evaluation, onBack, onSubmit, onSaveDraft }: EvaluationPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(evaluation.timeLimit ? evaluation.timeLimit * 60 : 3600); // Convert minutes to seconds
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningShown = useRef(false);

  // Cargar borrador guardado al inicializar
  useEffect(() => {
    const savedDraft = localStorage.getItem(`evaluation-draft-${evaluation.id}`);
    if (savedDraft) {
      try {
        const draftAnswers = JSON.parse(savedDraft);
        setAnswers(draftAnswers);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [evaluation.id]);

  // Confirmación de navegación
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  // Anti-cheating measures
  useEffect(() => {
    if (!evaluation.isProctored) return;

    // Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        if (tabSwitchCount >= 3 && !warningShown.current) {
          setShowWarning(true);
          warningShown.current = true;
        }
      }
    };

    // Detect fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Detect right-click and keyboard shortcuts
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common shortcuts
      if (e.ctrlKey || e.metaKey) {
        const disabledKeys = ['c', 'v', 'x', 'a', 's', 'f', 'h', 'p', 'u', 'i', 'j'];
        if (disabledKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
      // Disable F12, Ctrl+Shift+I, etc.
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    // Track activity
    const handleActivity = () => {
      setLastActivity(Date.now());
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        // Auto-submit after 5 minutes of inactivity
        handleSubmit();
      }, 5 * 60 * 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [evaluation.isProctored, tabSwitchCount]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      setAutoSaveStatus('saving');
      // Simulate auto-save
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 2000);
      }, 500);
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [answers]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate required questions
    const requiredQuestions = mockQuestions.filter(q => q.isRequired);
    const missingRequired = requiredQuestions.filter(q => !answers[q.id]?.trim());
    
    if (missingRequired.length > 0) {
      alert(`Please answer all required questions. Missing: ${missingRequired.map(q => q.id).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      alert('Failed to submit evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSavingDraft) return;

    setIsSavingDraft(true);
    try {
      // Guardar en localStorage
      localStorage.setItem(`evaluation-draft-${evaluation.id}`, JSON.stringify(answers));
      
      // Llamar callback si existe
      if (onSaveDraft) {
        await onSaveDraft(answers);
      }
      
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const currentQ = mockQuestions[currentQuestion];
  const totalQuestions = mockQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Proctoring Warning */}
      {evaluation.isProctored && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">This is a proctored evaluation</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Tab switching and right-click are disabled</li>
                <li>• Your activity is being monitored</li>
                <li>• Multiple tab switches may result in automatic submission</li>
                <li>• Stay in fullscreen mode for the best experience</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Switch Warning */}
      {showWarning && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Warning: Suspicious Activity Detected</p>
              <p className="text-sm">
                You have switched tabs {tabSwitchCount} times. Further tab switching may result in automatic submission.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmExit = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
                if (confirmExit) {
                  onBack();
                }
              } else {
                onBack();
              }
            }} 
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1>{evaluation.title}</h1>
            <p className="text-muted-foreground">{evaluation.course}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{evaluation.type}</Badge>
              {evaluation.isProctored && (
                <Badge variant="destructive" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Proctored
                </Badge>
              )}
              {evaluation.maxAttempts && (
                <Badge variant="secondary" className="text-xs">
                  Attempt {evaluation.currentAttempt || 1} of {evaluation.maxAttempts}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {autoSaveStatus && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Save className="h-4 w-4" />
              {autoSaveStatus === 'saving' ? 'Saving...' : 'Saved'}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-foreground'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span>Progress</span>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="text-sm text-muted-foreground">
            {answeredCount} of {totalQuestions} questions answered
          </div>
        </CardContent>
      </Card>

      {timeLeft < 300 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Warning: Only {formatTime(timeLeft)} remaining! The evaluation will auto-submit when time expires.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-1 p-4">
                {mockQuestions.map((question, index) => {
                  const isAnswered = !!answers[question.id]?.trim();
                  const isRequired = question.isRequired;
                  const isCurrent = currentQuestion === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        p-2 rounded-md text-sm font-medium transition-colors relative
                        ${isCurrent 
                          ? 'bg-primary text-primary-foreground' 
                          : isAnswered
                          ? 'bg-green-100 text-green-800'
                          : isRequired
                          ? 'bg-red-100 text-red-800'
                          : 'bg-muted hover:bg-accent'
                        }
                      `}
                    >
                      {index + 1}
                      {isRequired && !isAnswered && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Question {currentQuestion + 1}</CardTitle>
                  {currentQ.isRequired && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentQ.points} points
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p>{currentQ.question}</p>
              </div>

              {currentQ.type === 'multiple-choice' ? (
                <RadioGroup
                  value={answers[currentQ.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                >
                  {currentQ.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="open-answer">Your Answer</Label>
                  <Textarea
                    id="open-answer"
                    placeholder="Enter your answer here..."
                    className="min-h-32"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0 || isSubmitting}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {onSaveDraft && (
                    <Button 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft || isSubmitting}
                    >
                      {isSavingDraft ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Draft
                        </>
                      )}
                    </Button>
                  )}
                  
                  {currentQuestion === totalQuestions - 1 ? (
                    <Button 
                      onClick={handleSubmit} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Evaluation
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span>Total Questions: {totalQuestions}</span>
              <span>Answered: {answeredCount}</span>
              <span>Remaining: {totalQuestions - answeredCount}</span>
              {mockQuestions.filter(q => q.isRequired).length > 0 && (
                <span className="text-red-600">
                  Required: {mockQuestions.filter(q => q.isRequired && !answers[q.id]?.trim()).length} unanswered
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Total Points: {mockQuestions.reduce((sum, q) => sum + q.points, 0)}</span>
              {evaluation.timeLimit && (
                <span className="text-muted-foreground">
                  Time Limit: {evaluation.timeLimit} min
                </span>
              )}
              {evaluation.maxAttempts && (
                <span className="text-muted-foreground">
                  Attempts: {evaluation.currentAttempt || 1}/{evaluation.maxAttempts}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}