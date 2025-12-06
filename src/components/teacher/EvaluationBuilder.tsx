import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit,
  Save,
  Eye,
  Clock,
  FileText,
  GripVertical,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';

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
  course_id: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment';
  timeLimit?: number;
  attempts: number;
  passingGrade: number;
  status: 'draft' | 'published';
  dueDate?: string;
  questions: Question[];
  grade?: number; // For compatibility
}

interface ApiAssignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: 'quiz' | 'assignment';
  time_limit?: number;
  max_attempts?: number;
  passing_score?: number;
  status: 'draft' | 'published';
  due_date?: string;
  questions?: string | Question[];
  [key: string]: any;
}

interface EvaluationBuilderProps {
  course: Course;
  onBack: () => void;
}

export function EvaluationBuilder({ course, onBack }: EvaluationBuilderProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluations();
  }, [course]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const assignments = await ApiService.getAssignmentsByCourse(course.id);
      
      // Map API assignments to local Evaluation interface
      const mappedEvaluations: Evaluation[] = assignments.map((a: ApiAssignment) => ({
        id: a.id,
        course_id: a.course_id,
        title: a.title || 'Untitled',
        description: a.description || '',
        type: a.type || 'assignment',
        timeLimit: a.time_limit,
        attempts: a.max_attempts || 1,
        passingGrade: a.passing_score || 0,
        status: a.status || 'draft',
        dueDate: a.due_date,
        questions: a.questions ? (typeof a.questions === 'string' ? JSON.parse(a.questions) : a.questions) : []
      }));

      setEvaluations(mappedEvaluations);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast.error('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const createNewEvaluation = () => {
    const newEvaluation: Evaluation = {
      id: 'temp-' + Date.now(), // Temporary ID until saved
      course_id: course.id,
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
    
    const updatedQuestions = selectedEvaluation.questions.map((q: Question) =>
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
    
    const updatedQuestions = selectedEvaluation.questions.filter((q: Question) => q.id !== questionId);
    setSelectedEvaluation({
      ...selectedEvaluation,
      questions: updatedQuestions
    });
    
    if (editingQuestion && editingQuestion.id === questionId) {
      setEditingQuestion(null);
    }
  };

  const syncModules = async () => {
    try {
      setLoading(true);
      toast.info('Syncing assignments to modules...');
      
      const assignments = await ApiService.getAssignmentsByCourse(course.id);
      const modules = await ApiService.getCourseModules(course.id);
      
      let createdCount = 0;
      let maxOrder = modules.length > 0 ? Math.max(...modules.map((m: any) => m.order || 0)) : 0;

      for (const assignment of assignments) {
        // Check if a module exists for this assignment
        // We check if any module content contains the assignmentId
        const exists = modules.some((m: any) => {
            try {
                if (!m.content) return false;
                const parsed = JSON.parse(m.content);
                return parsed.assignmentId === assignment.id;
            } catch {
                return false;
            }
        });

        if (!exists) {
            // Create module
            maxOrder++;
            await ApiService.createModule(course.id, {
                title: assignment.title,
                type: 'assignment',
                order: maxOrder,
                content: JSON.stringify({
                    assignmentId: assignment.id,
                    description: assignment.description
                })
            });
            createdCount++;
        }
      }

      if (createdCount > 0) {
        toast.success(`Synced ${createdCount} assignments to modules.`);
      } else {
        toast.info('All assignments are already synced.');
      }
      
    } catch (error) {
       console.error('Error syncing modules:', error);
       toast.error('Failed to sync modules');
    } finally {
       setLoading(false);
    }
  };

  const saveEvaluation = async () => {
    if (!selectedEvaluation) return;
    
    try {
      const payload = {
        course_id: selectedEvaluation.course_id,
        title: selectedEvaluation.title,
        description: selectedEvaluation.description,
        status: selectedEvaluation.status,
        due_date: selectedEvaluation.dueDate,
        max_attempts: selectedEvaluation.attempts,
        passing_score: selectedEvaluation.passingGrade,
        time_limit: selectedEvaluation.timeLimit,
        type: selectedEvaluation.type,
        // Store questions as JSON or array depending on what backend expects.
        questions: selectedEvaluation.questions 
      };

      let assignmentId = selectedEvaluation.id;

      if (selectedEvaluation.id.startsWith('temp-')) {
        // Create new
        const newId = await ApiService.createAssignment(payload);
        assignmentId = newId;
        toast.success('Evaluation created successfully');

        // AUTOMATICALLY CREATE A MODULE FOR THIS ASSIGNMENT
        try {
          // Fetch existing modules to find last order
          const modules = await ApiService.getCourseModules(selectedEvaluation.course_id);
          const maxOrder = modules.length > 0 ? Math.max(...modules.map((m: any) => m.order || 0)) : 0;

          // Create the module
          await ApiService.createModule(selectedEvaluation.course_id, {
            title: selectedEvaluation.title,
            type: 'assignment',
            order: maxOrder + 1,
            // We store the assignment ID in the content so CourseViewer can link them
            content: JSON.stringify({
              assignmentId: newId,
              description: selectedEvaluation.description
            })
          });
          toast.success('Course module created for assignment');
        } catch (moduleError) {
          console.error('Failed to create module for assignment:', moduleError);
          toast.warning('Assignment created but failed to create course module');
        }

      } else {
        // Update existing
        await ApiService.updateAssignment(selectedEvaluation.id, payload);
        toast.success('Evaluation updated successfully');
        
        // TODO: Ideally we should also find the corresponding module and update its title
      }

      await loadEvaluations(); // Reload to get fresh data/IDs
      setIsEditing(false);
      setEditingQuestion(null);
      setSelectedEvaluation(null);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error('Failed to save evaluation');
    }
  };

  if (editingQuestion) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditingQuestion(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Evaluation
          </Button>
          <h1 className="text-2xl font-bold">Edit Question</h1>
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion(editingQuestion.id, { question: e.target.value })}
                placeholder="Enter your question here..."
                className="min-h-24"
              />
            </div>

            {editingQuestion.type === 'multiple-choice' && (
              <div className="space-y-4">
                <Label>Answer Options</Label>
                {editingQuestion.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(editingQuestion.id, { points: parseInt(e.target.value) || 0 })}
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
            <h1 className="text-2xl font-bold">Edit Evaluation</h1>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedEvaluation({
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedEvaluation({
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedEvaluation({
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedEvaluation({
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedEvaluation({
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedEvaluation({
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
                    {selectedEvaluation.questions.map((question: Question, index: number) => (
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
                  <span>{selectedEvaluation.questions.reduce((sum: number, q: Question) => sum + q.points, 0)}</span>
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
            <h1 className="text-2xl font-bold">Evaluations</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={syncModules} disabled={loading}>
                <RotateCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Sync to Modules
            </Button>
            <Button onClick={createNewEvaluation}>
            <Plus className="mr-2 h-4 w-4" />
            Create Evaluation
            </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading evaluations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluations.length === 0 ? (
            <div className="col-span-full text-center py-12 border rounded-lg bg-slate-50">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No evaluations yet</h3>
              <p className="text-muted-foreground mb-4">Create your first quiz or assignment for this course.</p>
              <Button onClick={createNewEvaluation}>
                <Plus className="mr-2 h-4 w-4" />
                Create Evaluation
              </Button>
            </div>
          ) : (
            evaluations.map((evaluation: Evaluation) => (
              <Card key={evaluation.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{evaluation.title}</CardTitle>
                    <Badge variant={evaluation.status === 'published' ? 'default' : 'secondary'}>
                      {evaluation.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={evaluation.type === 'quiz' ? 'outline' : 'secondary'}>{evaluation.type}</Badge>
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {evaluation.description || 'No description provided.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{evaluation.questions.length} questions</span>
                      <span>{evaluation.questions.reduce((sum: number, q: Question) => sum + q.points, 0)} points</span>
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
