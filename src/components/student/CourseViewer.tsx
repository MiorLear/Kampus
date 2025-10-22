  import React, { useState } from 'react';
  import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
  import { Button } from '../ui/button';
  import { Progress } from '../ui/progress';
  import { Badge } from '../ui/badge';
  import { Separator } from '../ui/separator';
  import { 
    ArrowLeft, 
    Play, 
    FileText, 
    ExternalLink, 
    Download,
    CheckCircle,
    Circle,
    Clock
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
    type: 'video' | 'text' | 'pdf' | 'link';
    duration?: string;
    completed: boolean;
    content?: string;
    url?: string;
  }
  
  const mockModules: CourseModule[] = [
    {
      id: '1',
      title: 'Introduction to Web Development',
      type: 'video',
      duration: '12 min',
      completed: true,
      content: 'Welcome to Web Development! In this module we will cover the basics of HTML, CSS, and JavaScript.'
    },
    {
      id: '2',
      title: 'HTML Fundamentals',
      type: 'text',
      duration: '15 min',
      completed: true,
      content: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup elements.'
    },
    {
      id: '3',
      title: 'CSS Basics Guide',
      type: 'pdf',
      duration: '20 min',
      completed: false,
      url: '/documents/css-basics.pdf'
    },
    {
      id: '4',
      title: 'JavaScript Introduction',
      type: 'video',
      duration: '25 min',
      completed: false,
      content: 'JavaScript is a programming language that enables interactive web pages and is an essential part of web applications.'
    },
    {
      id: '5',
      title: 'MDN Web Docs - HTML',
      type: 'link',
      completed: false,
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTML'
    }
  ];
  
  interface CourseViewerProps {
    course: Course;
    onBack: () => void;
  }
  
  export function CourseViewer({ course, onBack }: CourseViewerProps) {
    const [selectedModule, setSelectedModule] = useState<CourseModule>(mockModules[0]);
    const [modules, setModules] = useState(mockModules);
  
    const markModuleComplete = (moduleId: string) => {
      setModules(prev => prev.map(module => 
        module.id === moduleId ? { ...module, completed: true } : module
      ));
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
                  <Play className="h-16 w-16 mx-auto mb-4" />
                  <p>Video: {selectedModule.title}</p>
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
              <Button>
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
              <Button>
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
                  {modules.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-accent transition-colors ${
                        selectedModule.id === module.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {index + 1}. {module.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {module.type}
                            </Badge>
                          </div>
                          {module.duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {module.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
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
                    </CardTitle>
                    {selectedModule.duration && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Duration: {selectedModule.duration}
                      </p>
                    )}
                  </div>
                  {!selectedModule.completed && (
                    <Button 
                      variant="outline"
                      onClick={() => markModuleComplete(selectedModule.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderModuleContent()}
                
                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const currentIndex = modules.findIndex(m => m.id === selectedModule.id);
                      if (currentIndex > 0) {
                        setSelectedModule(modules[currentIndex - 1]);
                      }
                    }}
                    disabled={modules.findIndex(m => m.id === selectedModule.id) === 0}
                  >
                    Previous Module
                  </Button>
                  <Button
                    onClick={() => {
                      const currentIndex = modules.findIndex(m => m.id === selectedModule.id);
                      if (currentIndex < modules.length - 1) {
                        if (!selectedModule.completed) {
                          markModuleComplete(selectedModule.id);
                        }
                        setSelectedModule(modules[currentIndex + 1]);
                      }
                    }}
                    disabled={modules.findIndex(m => m.id === selectedModule.id) === modules.length - 1}
                  >
                    Next Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
