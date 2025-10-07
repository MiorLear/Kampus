import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  ExternalLink, 
  Download,
  CheckCircle,
  Circle,
  Clock,
  Lock,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  status: string;
  duration: string;
  modules: number;
}

interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'text' | 'pdf' | 'link' | 'quiz' | 'assignment';
  duration?: string;
  completed: boolean;
  content?: string;
  url?: string;
  order: number;
  isLocked: boolean;
  prerequisites?: string[];
  lastAccessed?: string;
  timeSpent?: number; // in minutes
}

const mockModules: CourseModule[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    type: 'video',
    duration: '12 min',
    completed: true,
    content: 'Welcome to Web Development! In this module we will cover the basics of HTML, CSS, and JavaScript.',
    order: 1,
    isLocked: false,
    lastAccessed: '2024-01-20T10:30:00Z',
    timeSpent: 12
  },
  {
    id: '2',
    title: 'HTML Fundamentals',
    type: 'text',
    duration: '15 min',
    completed: true,
    content: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup elements.',
    order: 2,
    isLocked: false,
    lastAccessed: '2024-01-20T11:00:00Z',
    timeSpent: 15
  },
  {
    id: '3',
    title: 'CSS Basics Guide',
    type: 'pdf',
    duration: '20 min',
    completed: false,
    url: '/documents/css-basics.pdf',
    order: 3,
    isLocked: false
  },
  {
    id: '4',
    title: 'HTML & CSS Quiz',
    type: 'quiz',
    duration: '30 min',
    completed: false,
    content: 'Test your understanding of HTML and CSS fundamentals',
    order: 4,
    isLocked: false,
    prerequisites: ['1', '2', '3']
  },
  {
    id: '5',
    title: 'JavaScript Introduction',
    type: 'video',
    duration: '25 min',
    completed: false,
    content: 'JavaScript is a programming language that enables interactive web pages and is an essential part of web applications.',
    order: 5,
    isLocked: true,
    prerequisites: ['4']
  },
  {
    id: '6',
    title: 'MDN Web Docs - HTML',
    type: 'link',
    completed: false,
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    order: 6,
    isLocked: true,
    prerequisites: ['1', '2']
  }
];

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
  onProgressUpdate?: (courseId: string, progress: number) => Promise<void>;
  isArchived?: boolean;
}

export function CourseViewer({ course, onBack, onProgressUpdate, isArchived = false }: CourseViewerProps) {
  const [selectedModule, setSelectedModule] = useState<CourseModule>(mockModules[0]);
  const [modules, setModules] = useState<CourseModule[]>(mockModules.sort((a, b) => a.order - b.order));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save progress when modules are completed
  useEffect(() => {
    const completedModules = modules.filter(m => m.completed).length;
    const totalModules = modules.length;
    const progressPercentage = (completedModules / totalModules) * 100;

    if (onProgressUpdate && progressPercentage > 0) {
      const saveProgress = async () => {
        setIsSaving(true);
        try {
          await onProgressUpdate(course.id, progressPercentage);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Failed to save progress:', error);
        } finally {
          setIsSaving(false);
        }
      };

      // Debounce the save operation
      const timeoutId = setTimeout(saveProgress, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [modules, course.id, onProgressUpdate]);

  const markModuleComplete = (moduleId: string) => {
    if (isArchived) return; // Don't allow progress updates for archived courses

    setModules(prev => {
      const updatedModules = prev.map(module => 
        module.id === moduleId 
          ? { 
              ...module, 
              completed: true, 
              lastAccessed: new Date().toISOString(),
              timeSpent: (module.timeSpent || 0) + 1 // Increment time spent
            } 
          : module
      );
      
      // Calcular nuevo progreso
      const completedModules = updatedModules.filter(m => m.completed).length;
      const totalModules = updatedModules.length;
      const newProgress = (completedModules / totalModules) * 100;
      
      // Si el curso está completo, actualizar el estado del curso
      if (newProgress === 100) {
        // Notificar al componente padre que el curso está completo
        if (onProgressUpdate) {
          onProgressUpdate(course.id, 100);
        }
      }
      
      return updatedModules;
    });
  };

  const canAccessModule = (module: CourseModule) => {
    if (!module.isLocked) return true;
    if (isArchived) return true; // Allow viewing archived content
    
    // Check if prerequisites are completed
    if (module.prerequisites) {
      return module.prerequisites.every(prereqId => 
        modules.find(m => m.id === prereqId)?.completed
      );
    }
    
    return true;
  };

  const getNextModule = () => {
    const currentIndex = modules.findIndex(m => m.id === selectedModule.id);
    for (let i = currentIndex + 1; i < modules.length; i++) {
      if (canAccessModule(modules[i])) {
        return modules[i];
      }
    }
    return null;
  };

  const getPreviousModule = () => {
    const currentIndex = modules.findIndex(m => m.id === selectedModule.id);
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (canAccessModule(modules[i])) {
        return modules[i];
      }
    }
    return null;
  };

  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const progressPercentage = (completedModules / totalModules) * 100;

  const renderModuleContent = () => {
    switch (selectedModule.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Button 
                  size="lg"
                  onClick={() => {
                    // Abrir video de ejemplo en YouTube
                    const videoUrls = {
                      'Introduction to Web Development': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                      'JavaScript Introduction': 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
                      'HTML Fundamentals': 'https://www.youtube.com/watch?v=qz0aGYrrlhU'
                    };
                    const videoUrl = videoUrls[selectedModule.title as keyof typeof videoUrls] || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                    window.open(videoUrl, '_blank');
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Play className="h-8 w-8 mr-2" />
                  Watch on YouTube
                </Button>
                <p className="mt-4">Video: {selectedModule.title}</p>
                <p className="text-sm opacity-75">{selectedModule.duration}</p>
              </div>
            </div>
            {selectedModule.content && (
              <div className="prose max-w-none">
                <p>{selectedModule.content}</p>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose max-w-none">
            <h2>{selectedModule.title}</h2>
            <p>{selectedModule.content}</p>
          </div>
        );

      case 'pdf':
        return (
          <div className="text-center space-y-4 py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3>{selectedModule.title}</h3>
              <p className="text-muted-foreground">PDF Document - {selectedModule.duration}</p>
            </div>
            <Button onClick={() => {
              // Crear un PDF de ejemplo o abrir URL
              if (selectedModule.url) {
                window.open(selectedModule.url, '_blank');
              } else {
                // Crear un PDF de ejemplo con contenido
                const pdfContent = `
                  %PDF-1.4
                  1 0 obj
                  <<
                  /Type /Catalog
                  /Pages 2 0 R
                  >>
                  endobj
                  2 0 obj
                  <<
                  /Type /Pages
                  /Kids [3 0 R]
                  /Count 1
                  >>
                  endobj
                  3 0 obj
                  <<
                  /Type /Page
                  /Parent 2 0 R
                  /MediaBox [0 0 612 792]
                  /Contents 4 0 R
                  >>
                  endobj
                  4 0 obj
                  <<
                  /Length 44
                  >>
                  stream
                  BT
                  /F1 12 Tf
                  100 700 Td
                  (${selectedModule.title}) Tj
                  ET
                  endstream
                  endobj
                  xref
                  0 5
                  0000000000 65535 f 
                  0000000009 00000 n 
                  0000000058 00000 n 
                  0000000115 00000 n 
                  0000000204 00000 n 
                  trailer
                  <<
                  /Size 5
                  /Root 1 0 R
                  >>
                  startxref
                  297
                  %%EOF
                `;
                const blob = new Blob([pdfContent], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedModule.title}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        );

      case 'link':
        return (
          <div className="text-center space-y-4 py-12">
            <ExternalLink className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3>{selectedModule.title}</h3>
              <p className="text-muted-foreground">External Resource</p>
            </div>
            <Button onClick={() => {
              if (selectedModule.url) {
                window.open(selectedModule.url, '_blank');
              } else {
                // URL de ejemplo para MDN Web Docs
                window.open('https://developer.mozilla.org/en-US/docs/Web/HTML', '_blank');
              }
            }}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Link
            </Button>
          </div>
        );

      default:
        return <div>Content not available</div>;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1>{course.title}</h1>
          <p className="text-muted-foreground">by {course.instructor}</p>
        </div>
      </div>

      {/* Archived Course Warning */}
      {isArchived && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This course has been archived. You can review content but cannot track new progress or take evaluations.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span>Course Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedModules} of {totalModules} modules completed
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <div className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% complete
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Course Modules</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {modules.map((module, index) => {
                  const canAccess = canAccessModule(module);
                  const isSelected = selectedModule.id === module.id;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => canAccess && setSelectedModule(module)}
                      disabled={!canAccess}
                      className={`w-full text-left p-4 border-b last:border-b-0 transition-colors ${
                        isSelected ? 'bg-accent' : canAccess ? 'hover:bg-accent' : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : !canAccess ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${!canAccess ? 'text-muted-foreground' : ''}`}>
                              {module.order}. {module.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {module.type}
                            </Badge>
                            {!canAccess && (
                              <Badge variant="secondary" className="text-xs">
                                Locked
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {module.duration && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {module.duration}
                              </div>
                            )}
                            {module.timeSpent && module.timeSpent > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {module.timeSpent} min spent
                              </div>
                            )}
                            {!canAccess && module.prerequisites && (
                              <div className="text-xs text-muted-foreground">
                                Complete prerequisites first
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedModule.title}
                    <Badge variant="outline">{selectedModule.type}</Badge>
                    {!canAccessModule(selectedModule) && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {selectedModule.duration && (
                      <span>Duration: {selectedModule.duration}</span>
                    )}
                    {selectedModule.timeSpent && selectedModule.timeSpent > 0 && (
                      <span>Time spent: {selectedModule.timeSpent} min</span>
                    )}
                    {selectedModule.lastAccessed && (
                      <span>Last accessed: {new Date(selectedModule.lastAccessed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  )}
                  {lastSaved && !isSaving && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Save className="h-4 w-4" />
                      Saved {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                  {!selectedModule.completed && canAccessModule(selectedModule) && !isArchived && (
                    <Button 
                      variant="outline"
                      onClick={() => markModuleComplete(selectedModule.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!canAccessModule(selectedModule) ? (
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Module Locked</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete the prerequisite modules to unlock this content.
                  </p>
                  {selectedModule.prerequisites && (
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">Prerequisites:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedModule.prerequisites.map(prereqId => {
                          const prereq = modules.find(m => m.id === prereqId);
                          return prereq ? (
                            <li key={prereqId} className={prereq.completed ? 'text-green-600' : 'text-muted-foreground'}>
                              {prereq.title} {prereq.completed ? '✓' : '✗'}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                renderModuleContent()
              )}
              
              {/* Navigation */}
              {canAccessModule(selectedModule) && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const prevModule = getPreviousModule();
                      if (prevModule) {
                        setSelectedModule(prevModule);
                      }
                    }}
                    disabled={!getPreviousModule()}
                  >
                    Previous Module
                  </Button>
                  <Button
                    onClick={() => {
                      const nextModule = getNextModule();
                      if (nextModule) {
                        if (!selectedModule.completed && !isArchived) {
                          markModuleComplete(selectedModule.id);
                        }
                        setSelectedModule(nextModule);
                      }
                    }}
                    disabled={!getNextModule()}
                  >
                    Next Module
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}