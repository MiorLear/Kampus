import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Clock, Save, Send } from 'lucide-react';

interface Evaluation {
  id: string;
  title: string;
  course: string;
  type: 'quiz' | 'assignment';
  status: string;
  maxScore: number;
  dueDate: string;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'open-ended';
  question: string;
  options?: string[];
  points: number;
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
  onSubmit: (answers: Record<string, string>) => void;
}

export function EvaluationPlayer({ evaluation, onBack, onSubmit }: EvaluationPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | null>(null);

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
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const currentQ = mockQuestions[currentQuestion];
  const totalQuestions = mockQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1>{evaluation.title}</h1>
            <p className="text-muted-foreground">{evaluation.course}</p>
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
                {mockQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
                      p-2 rounded-md text-sm font-medium transition-colors
                      ${currentQuestion === index 
                        ? 'bg-primary text-primary-foreground' 
                        : answers[mockQuestions[index].id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-muted hover:bg-accent'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {currentQuestion + 1}</CardTitle>
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
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentQuestion === totalQuestions - 1 ? (
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Evaluation
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
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
            </div>
            <div className="flex items-center gap-4">
              <span>Total Points: {mockQuestions.reduce((sum, q) => sum + q.points, 0)}</span>
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
