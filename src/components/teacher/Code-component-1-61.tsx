import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit,
  Save,
  Eye,
  Clock,
  FileText,
  CheckCircle,
  GripVertical
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'open-ended';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
}

interface Evaluation {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment';
  timeLimit?: number;
  attempts: number;
  passingGrade: number;
  status: 'draft' | 'published';
  dueDate?: string;
  questions: Question[];
}

const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    title: 'HTML & CSS Fundamentals Quiz',
    description: 'Test your knowledge of HTML and CSS basics',
    type: 'quiz',
    timeLimit: 60,
    attempts: 3,
    passingGrade: 70,
    status: 'published',
    dueDate: '2024-01-20',
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'Which HTML tag is used to create a hyperlink?',
        options: ['<link>', '<href>', '<a>', '<url>'],
        correctAnswer: '<a>',
        points: 10,
        order: 1
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
        correctAnswer: 'Cascading Style Sheets',
        points: 10,
        order: 2
      }
    ]
  },
  {
    id: '2',
    title: 'JavaScript Basics Assignment',
    description: 'Complete coding exercises using JavaScript',
    type: 'assignment',
    attempts: 1,
    passingGrade: 75,
    status: 'draft',
    dueDate: '2024-01-25',
    questions: [
      {
        id: '3',
        type: 'open-ended',
        question: 'Write a JavaScript function that takes an array of numbers and returns the sum.',
        points: 25,
        order: 1
      }
    ]
  }
];

interface EvaluationBuilderProps {
  course: Course;
  onBack: () => void;
}

export function EvaluationBuilder({ course, onBack }: EvaluationBuilderProps) {
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const createNewEvaluation = () => {
    const newEvaluation: Evaluation = {
      id: Date.now().toString(),
      title: 'New Evaluation',
      description: '',
      type: 'quiz',
      attempts: 1,
      passingGrade: 70,
      status: 'draft',
      questions: []
    };
    setSelectedEvaluation(newEvaluation);
    setIsEditing(true);
  };

  const addQuestion = (evaluation: Evaluation) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      points: 10,
      order: evaluation.questions.length + 1
    };
    
    const updatedEvaluation = {
      ...evaluation,
      questions: [...evaluation.questions, newQuestion]
    };
    setSelectedEvaluation(updatedEvaluation);
    setEditingQuestion(newQuestion);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!selectedEvaluation) return;
    
    const updatedQuestions = selectedEvaluation.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    
    setSelectedEvaluation({
      ...selectedEvaluation,
      questions: updatedQuestions
    });
    
    if (editingQuestion && editingQuestion.id === questionId) {
      setEditingQuestion({ ...editingQuestion, ...updates });
    }
  };

  const deleteQuestion = (questionId: string) => {
    if (!selectedEvaluation) return;
    
    const updatedQuestions = selectedEvaluation.questions.filter(q => q.id !== questionId);
    setSelectedEvaluation({
      ...selectedEvaluation,
      questions: updatedQuestions
    });
    
    if (editingQuestion && editingQuestion.id === questionId) {
      setEditingQuestion(null);
    }
  };

  const saveEvaluation = () => {
    if (!selectedEvaluation) return;
    
    setEvaluations(prev => {
      const existing = prev.find(e => e.id === selectedEvaluation.id);
      if (existing) {
        return prev.map(e => e.id === selectedEvaluation.id ? selectedEvaluation : e);
      } else {
        return [...prev, selectedEvaluation];
      }
    });
    
    setIsEditing(false);
    setEditingQuestion(null);
  };

  if (editingQuestion) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditingQuestion(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Evaluation
          </Button>
          <h1>Edit Question</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={editingQuestion.type}
                onValueChange={(value: 'multiple-choice' | 'open-ended') => 
                  updateQuestion(editingQuestion.id, { type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="open-ended">Open Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                value={editingQuestion.question}
                onChange={(e) => updateQuestion(editingQuestion.id, { question: e.target.value })}
                placeholder="Enter your question here..."
                className="min-h-24"
              />
            </div>

            {editingQuestion.type === 'multiple-choice' && (
              <div className="space-y-4">
                <Label>Answer Options</Label>
                {editingQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(editingQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        updateQuestion(editingQuestion.id, { options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant={editingQuestion.correctAnswer === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateQuestion(editingQuestion.id, { correctAnswer: option })}
                    >
                      {editingQuestion.correctAnswer === option ? 'Correct' : 'Mark Correct'}
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newOptions = [...(editingQuestion.options || []), ''];
                    updateQuestion(editingQuestion.id, { options: newOptions });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="question-points">Points</Label>
              <Input
                id="question-points"
                type="number"
                value={editingQuestion.points}
                onChange={(e) => updateQuestion(editingQuestion.id, { points: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button onClick={() => setEditingQuestion(null)}>
                Save Question
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedEvaluation && isEditing) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => {
              setSelectedEvaluation(null);
              setIsEditing(false);
            }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Evaluations
            </Button>
            <h1>Edit Evaluation</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={selectedEvaluation.status === 'published' ? 'default' : 'secondary'}>
              {selectedEvaluation.status}
            </Badge>
            <Button onClick={saveEvaluation}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eval-title">Title</Label>
                  <Input
                    id="eval-title"
                    value={selectedEvaluation.title}
                    onChange={(e) => setSelectedEvaluation({
                      ...selectedEvaluation,
                      title: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eval-description">Description</Label>
                  <Textarea
                    id="eval-description"
                    value={selectedEvaluation.description}
                    onChange={(e) => setSelectedEvaluation({
                      ...selectedEvaluation,
                      description: e.target.value
                    })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eval-type">Type</Label>
                    <Select
                      value={selectedEvaluation.type}
                      onValueChange={(value: 'quiz' | 'assignment') => 
                        setSelectedEvaluation({
                          ...selectedEvaluation,
                          type: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      value={selectedEvaluation.timeLimit || ''}
                      onChange={(e) => setSelectedEvaluation({
                        ...selectedEvaluation,
                        timeLimit: parseInt(e.target.value) || undefined
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Allowed Attempts</Label>
                    <Input
                      id="attempts"
                      type="number"
                      value={selectedEvaluation.attempts}
                      onChange={(e) => setSelectedEvaluation({
                        ...selectedEvaluation,
                        attempts: parseInt(e.target.value) || 1
                      })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passing-grade">Passing Grade (%)</Label>
                    <Input
                      id="passing-grade"
                      type="number"
                      value={selectedEvaluation.passingGrade}
                      onChange={(e) => setSelectedEvaluation({
                        ...selectedEvaluation,
                        passingGrade: parseInt(e.target.value) || 70
                      })}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={selectedEvaluation.dueDate || ''}
                    onChange={(e) => setSelectedEvaluation({
                      ...selectedEvaluation,
                      dueDate: e.target.value
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Questions</CardTitle>
                  <Button onClick={() => addQuestion(selectedEvaluation)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedEvaluation.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No questions added yet</p>
                    <Button className="mt-4" onClick={() => addQuestion(selectedEvaluation)}>
                      Add First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedEvaluation.questions.map((question, index) => (
                      <div key={question.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                            <Badge variant="outline">
                              {question.type === 'multiple-choice' ? 'MCQ' : 'Open'}
                            </Badge>
                            <Badge variant="secondary">{question.points} pts</Badge>
                          </div>
                          <p className="text-sm">{question.question || 'Untitled question'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Questions</span>
                  <span>{selectedEvaluation.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Points</span>
                  <span>{selectedEvaluation.questions.reduce((sum, q) => sum + q.points, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Time</span>
                  <span>{selectedEvaluation.timeLimit ? `${selectedEvaluation.timeLimit} min` : 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Passing Grade</span>
                  <span>{selectedEvaluation.passingGrade}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => setSelectedEvaluation({
                    ...selectedEvaluation,
                    status: selectedEvaluation.status === 'published' ? 'draft' : 'published'
                  })}
                >
                  {selectedEvaluation.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <div>
            <h1>Evaluations</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <Button onClick={createNewEvaluation}>
          <Plus className="mr-2 h-4 w-4" />
          Create Evaluation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluations.map(evaluation => (
          <Card key={evaluation.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{evaluation.title}</CardTitle>
                <Badge variant={evaluation.status === 'published' ? 'default' : 'secondary'}>
                  {evaluation.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{evaluation.type}</Badge>
                {evaluation.timeLimit && (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {evaluation.timeLimit}m
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{evaluation.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{evaluation.questions.length} questions</span>
                  <span>{evaluation.questions.reduce((sum, q) => sum + q.points, 0)} points</span>
                </div>

                {evaluation.dueDate && (
                  <div className="text-sm text-muted-foreground">
                    Due: {new Date(evaluation.dueDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedEvaluation(evaluation);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}