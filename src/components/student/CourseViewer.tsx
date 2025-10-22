import React, { useState, useEffect } from 'react';
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
  Clock,
  File,
  Image,
  Link,
  Edit
} from 'lucide-react';
import { FirestoreService, CourseModule, UserProgress, CourseProgress } from '../../services/firestore.service';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
  
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
  
  interface CourseModuleWithProgress extends CourseModule {
    completed: boolean;
  }
  
  interface CourseViewerProps {
    course: Course;
    onBack: () => void;
  }
  
export function CourseViewer({ course, onBack }: CourseViewerProps) {
  const { user } = useAuth();
  const [modules, setModules] = useState<CourseModuleWithProgress[]>([]);
  const [selectedModule, setSelectedModule] = useState<CourseModuleWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    loadCourseModules();
  }, [course.id]);

  const loadCourseModules = async () => {
    try {
      setLoading(true);
      console.log('CourseViewer: Loading modules for course:', course.id);
      const courseModules = await FirestoreService.getCourseModules(course.id);
      console.log('CourseViewer: Loaded modules:', courseModules);
      
      // Load user progress for this course
      const userProgress = await FirestoreService.getUserProgressForCourse(user.id, course.id);
      console.log('CourseViewer: Loaded user progress:', userProgress);
      
      // Load course progress
      const progress = await FirestoreService.getCourseProgress(user.id, course.id);
      setCourseProgress(progress);
      console.log('CourseViewer: Loaded course progress:', progress);
      
      // Merge modules with progress data
      const modulesWithProgress = courseModules.map(module => {
        const progress = userProgress.find(p => p.module_id === module.id);
        return {
          ...module,
          completed: progress?.completed || false,
          completed_at: progress?.completed_at
        };
      });
      
      console.log('CourseViewer: Modules with progress:', modulesWithProgress);
      setModules(modulesWithProgress);
      if (modulesWithProgress.length > 0) {
        setSelectedModule(modulesWithProgress[0]);
      }
    } catch (error) {
      console.error('CourseViewer: Error loading course modules:', error);
      toast.error('Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  const markModuleComplete = async (moduleId: string) => {
    try {
      await FirestoreService.markModuleComplete(user.id, course.id, moduleId);
      
      // Update local state
      setModules(prev => prev.map(module => 
        module.id === moduleId ? { ...module, completed: true, completed_at: new Date().toISOString() } : module
      ));
      
      // Reload course progress
      const progress = await FirestoreService.getCourseProgress(user.id, course.id);
      setCourseProgress(progress);
      
      toast.success('Module marked as complete!');
    } catch (error) {
      console.error('Error marking module complete:', error);
      toast.error('Failed to mark module as complete');
    }
  };
  
  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const progressPercentage = courseProgress?.progress_percentage || (totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0);
  
    const renderModuleContent = () => {
      if (!selectedModule) return <div>No module selected</div>;

      switch (selectedModule.type) {
        case 'video':
          return (
            <div className="space-y-4">
              {selectedModule.url ? (
                <div className="bg-black aspect-video rounded-lg overflow-hidden">
                  {selectedModule.url.includes('youtube.com') || selectedModule.url.includes('youtu.be') ? (
                    // YouTube video
                    <iframe
                      src={selectedModule.url.includes('embed') ? selectedModule.url : 
                            selectedModule.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={selectedModule.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : selectedModule.url.includes('vimeo.com') ? (
                    // Vimeo video
                    <iframe
                      src={selectedModule.url.includes('player') ? selectedModule.url : 
                            selectedModule.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      title={selectedModule.title}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Generic video (MP4, WebM, etc.)
                    <video
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    >
                      <source src={selectedModule.url} type="video/mp4" />
                      <source src={selectedModule.url} type="video/webm" />
                      <source src={selectedModule.url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4" />
                    <p>Video: {selectedModule.title}</p>
                    <p className="text-sm opacity-75">{selectedModule.duration}</p>
                    <p className="text-sm opacity-50 mt-2">No video URL provided</p>
                  </div>
                </div>
              )}
              {selectedModule.content && (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
                </div>
              )}
            </div>
          );

        case 'text':
          return (
            <div className="prose max-w-none">
              <h2>{selectedModule.title}</h2>
              {selectedModule.content && (
                <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
              )}
            </div>
          );

        case 'pdf':
          return (
            <div className="text-center space-y-4 py-12">
              <File className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3>{selectedModule.title}</h3>
                <p className="text-muted-foreground">PDF Document - {selectedModule.duration}</p>
              </div>
              {selectedModule.file_url && (
                <Button asChild>
                  <a href={selectedModule.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    View PDF
                  </a>
                </Button>
              )}
            </div>
          );

        case 'image':
          return (
            <div className="space-y-4">
              {selectedModule.file_url && (
                <img 
                  src={selectedModule.file_url} 
                  alt={selectedModule.title}
                  className="max-w-full h-auto rounded-lg"
                />
              )}
              {selectedModule.content && (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
                </div>
              )}
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
              {selectedModule.url && (
                <Button asChild>
                  <a href={selectedModule.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                  </a>
                </Button>
              )}
            </div>
          );

        case 'assignment':
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Assignment</h3>
                </div>
                <p className="text-blue-800">This module contains an assignment. Complete it to progress.</p>
              </div>
              {selectedModule.content && (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
                </div>
              )}
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading course content...</p>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules available</h3>
              <p className="text-muted-foreground">
                This course doesn't have any content modules yet. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                            selectedModule?.id === module.id ? 'bg-accent' : ''
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
                          {selectedModule?.title}
                          <Badge variant="outline">{selectedModule?.type}</Badge>
                        </CardTitle>
                        {selectedModule?.duration && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Duration: {selectedModule.duration}
                          </p>
                        )}
                      </div>
                      {selectedModule && !selectedModule.completed && (
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
                          const currentIndex = modules.findIndex(m => m.id === selectedModule?.id);
                          if (currentIndex > 0) {
                            setSelectedModule(modules[currentIndex - 1]);
                          }
                        }}
                        disabled={modules.findIndex(m => m.id === selectedModule?.id) === 0}
                      >
                        Previous Module
                      </Button>
                      <Button
                        onClick={() => {
                          const currentIndex = modules.findIndex(m => m.id === selectedModule?.id);
                          if (currentIndex < modules.length - 1) {
                            if (selectedModule && !selectedModule.completed) {
                              markModuleComplete(selectedModule.id);
                            }
                            setSelectedModule(modules[currentIndex + 1]);
                          }
                        }}
                        disabled={modules.findIndex(m => m.id === selectedModule?.id) === modules.length - 1}
                      >
                        Next Module
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
