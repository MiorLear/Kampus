import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  FileText, 
  Play, 
  RotateCcw, 
  Search, 
  Eye, 
  ExternalLink, 
  Circle, 
  BookOpen, 
  ChevronRight, 
  Edit,
  Download
} from 'lucide-react';
import { CourseModule, UserProgress, CourseProgress } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EvaluationPlayer } from './EvaluationPlayer';
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
    cover_image_url?: string;
  }
  
  interface CourseModuleWithProgress extends CourseModule {
    completed: boolean;
    progress_percentage?: number;
    times_accessed?: number;
  }
  
  interface VideoPlayerProps {
    src: string;
    title: string;
    moduleId: string;
    courseId: string;
    userId: string;
    onProgress: (time: number, duration: number) => void;
  }
  
  function VideoPlayer({ src, title, onProgress }: VideoPlayerProps) {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      
      // Función para guardar progreso
      const saveProgress = () => {
        if (video.duration && video.currentTime) {
          onProgress(video.currentTime, video.duration);
        }
      };
      
      // Guardar progreso cuando el video avanza
      const handleTimeUpdate = () => {
        // Guardar cada 10 segundos aproximadamente
        if (Math.floor(video.currentTime) % 10 === 0) {
          saveProgress();
        }
      };
      
      // Guardar cuando el video termina
      const handleEnded = () => {
        saveProgress();
      };
      
      // Guardar cuando el usuario pausa (asume que vio algo)
      const handlePause = () => {
        saveProgress();
      };
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('pause', handlePause);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('pause', handlePause);
        
        // Guardar progreso final al desmontar
        saveProgress();
      };
    }, [onProgress]);
    
    return (
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    );
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
  const [moduleStartTime, setModuleStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadCourseModules();
  }, [course.id]);

  // Guardar acceso automático cuando se selecciona un módulo
  useEffect(() => {
    if (selectedModule && user && course.id) {
      // Guardar acceso al módulo
      ApiService.saveModuleAccess(user.id, course.id, selectedModule.id).catch(err => {
        console.error('Error saving module access:', err);
      });
      // Registrar tiempo de inicio
      setModuleStartTime(Date.now());
    }
  }, [selectedModule?.id, user?.id, course.id]);

  // Guardar tiempo de visualización cuando el usuario sale del módulo
  useEffect(() => {
    return () => {
      if (moduleStartTime && selectedModule && user && course.id) {
        const timeSpent = Math.round((Date.now() - moduleStartTime) / 1000); // en segundos
        if (timeSpent > 0) {
          ApiService.saveModuleProgress(user.id, course.id, selectedModule.id, {
            time_spent: timeSpent
          }).catch(err => {
            console.error('Error saving time spent:', err);
          });
        }
      }
    };
  }, [selectedModule?.id]);

  // Función para actualizar progreso de módulo en tiempo real
  const updateModuleProgress = React.useCallback((moduleId: string, progressData: Partial<CourseModuleWithProgress>) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, ...progressData } : module
    ));
    
    setSelectedModule(prev => prev && prev.id === moduleId ? { ...prev, ...progressData } : prev);
  }, []);

  const loadCourseModules = async () => {
    try {
      setLoading(true);
      console.log('CourseViewer: Loading modules for course:', course.id);
      const courseModules = await ApiService.getCourseModules(course.id);
      console.log('CourseViewer: Loaded modules:', courseModules);
      
      // Load user progress for this course
      if (!user) {
        console.warn('CourseViewer: User not authenticated');
        setModules(courseModules.map(m => ({ ...m, completed: false })));
        return;
      }
      
      const userProgress = await ApiService.getUserProgressForCourse(user.id, course.id);
      console.log('CourseViewer: Loaded user progress:', userProgress);
      
      // Load course progress
      const progress = await ApiService.getCourseProgress(user.id, course.id);
      setCourseProgress(progress);
      console.log('CourseViewer: Loaded course progress:', progress);
      
      // Merge modules with progress data
      const modulesWithProgress = courseModules.map(module => {
        if (!module || !module.id) return null;
        
        // Safety check for userProgress array
        const progress = Array.isArray(userProgress) 
          ? userProgress.find(p => p && p.module_id === module.id)
          : null;

        return {
          ...module,
          completed: progress?.completed || false,
          completed_at: progress?.completed_at,
          progress_percentage: progress?.progress_percentage || 0,
          times_accessed: progress?.times_accessed || 0
        };
      }).filter(Boolean) as CourseModuleWithProgress[];
      
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
    if (!user) return;
    
    try {
      await ApiService.markModuleComplete(user.id, course.id, moduleId);
      
      // Update local state
      setModules(prev => prev.map(module => 
        module.id === moduleId ? { 
          ...module, 
          completed: true, 
          completed_at: new Date().toISOString(),
          progress_percentage: 100
        } : module
      ));
      
      // Update selected module if it's the one being completed
      if (selectedModule?.id === moduleId) {
        setSelectedModule(prev => prev ? {
          ...prev,
          completed: true,
          completed_at: new Date().toISOString(),
          progress_percentage: 100
        } : prev);
      }
      
      // Reload course progress
      const progress = await ApiService.getCourseProgress(user.id, course.id);
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
                    // YouTube video - Tracking básico (YouTube no permite acceso directo al tiempo)
                    <iframe
                      src={selectedModule.url.includes('embed') ? selectedModule.url : 
                            selectedModule.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={selectedModule.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        // Marcar que el video fue cargado
                        if (selectedModule && user && course.id) {
                          ApiService.saveModuleProgress(user.id, course.id, selectedModule.id, {
                            progress_percentage: 5 // Indicador de que el video fue iniciado
                          }).catch(err => console.error('Error saving video progress:', err));
                        }
                      }}
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
                      onLoad={() => {
                        if (selectedModule && user && course.id) {
                          ApiService.saveModuleProgress(user.id, course.id, selectedModule.id, {
                            progress_percentage: 5
                          }).catch(err => console.error('Error saving video progress:', err));
                        }
                      }}
                    />
                  ) : (
                    // Generic video (MP4, WebM, etc.) - Tracking completo
                    user ? (
                    <VideoPlayer
                      src={selectedModule.url}
                      title={selectedModule.title}
                      moduleId={selectedModule.id}
                      courseId={course.id}
                      userId={user.id}
                      onProgress={(time, duration) => {
                        // Guardar progreso del video cada 10 segundos aproximadamente
                        if (selectedModule && user && course.id) {
                          const percentage = Math.round((time / duration) * 100);
                          ApiService.saveModuleProgress(user.id, course.id, selectedModule.id, {
                            video_time_watched: Math.round(time),
                            video_duration: Math.round(duration),
                            progress_percentage: percentage
                          }).then(() => {
                            // Actualizar UI en tiempo real
                            updateModuleProgress(selectedModule.id, { progress_percentage: percentage });
                          }).catch(err => console.error('Error saving video progress:', err));
                        }
                      }}
                    />
                    ) : <div>Please log in to track video progress</div>
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
              {selectedModule.progress_percentage !== undefined && selectedModule.progress_percentage > 0 && selectedModule.progress_percentage < 100 && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progreso de visualización</span>
                    <span>{selectedModule.progress_percentage}%</span>
                  </div>
                  <Progress value={selectedModule.progress_percentage} className="h-2" />
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
          // We need to handle two cases:
          // 1. Content is just raw JSON questions (legacy/seeded data potentially)
          // 2. Content is JSON with { assignmentId, description } (new flow)
          
          // State to hold fetched assignment data
          const [assignmentData, setAssignmentData] = useState<any>(null);
          const [loadingAssignment, setLoadingAssignment] = useState(false);

          useEffect(() => {
             const loadAssignment = async () => {
                try {
                  if (!selectedModule.content) return;
                  
                  let parsed: any = {};
                  try {
                    parsed = JSON.parse(selectedModule.content);
                  } catch {
                    return; // Not JSON
                  }

                  if (parsed.assignmentId) {
                     setLoadingAssignment(true);
                     const assignment = await ApiService.getAssignment(parsed.assignmentId);
                     setAssignmentData(assignment);
                     setLoadingAssignment(false);
                  } else if (Array.isArray(parsed)) {
                     // Legacy/Seeded: Content IS the questions
                     setAssignmentData({ questions: parsed });
                  }
                } catch (err) {
                   console.error("Error loading assignment data", err);
                   setLoadingAssignment(false);
                }
             };
             loadAssignment();
          }, [selectedModule.id, selectedModule.content]);


          if (loadingAssignment) {
            return <div className="p-8 text-center text-muted-foreground">Loading assignment...</div>;
          }

          const questions = assignmentData?.questions || [];
          // If we have questions from the fetch, use them. 
          // If the assignmentData has 'questions' field as string, parse it.
          const finalQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
          
          const assignmentId = assignmentData?.id || selectedModule.id; // Fallback to module ID if no specific assignment ID (legacy)

          return (
            <div className="space-y-4">
              <EvaluationPlayer
                evaluation={{
                  id: assignmentId,
                  title: assignmentData?.title || selectedModule.title,
                  course: course.title,
                  type: 'assignment',
                  status: selectedModule.completed ? 'completed' : 'pending',
                  maxScore: 100,
                  dueDate: assignmentData?.due_date || new Date().toISOString()
                }}
                questions={Array.isArray(finalQuestions) ? finalQuestions : []} 
                onBack={() => {}} 
                onSubmit={async (answers) => {
                  try {
                    await ApiService.submitAssignment(assignmentId, {
                        answers,
                        student_id: user?.id || ''
                    });
                    toast.success('Assignment submitted successfully!');
                    markModuleComplete(selectedModule.id);
                  } catch (error) {
                    console.error('Error submitting assignment:', error);
                    toast.error('Failed to submit assignment');
                  }
                }}
              />
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

        {/* Cover Image */}
        {course.cover_image_url && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6 border border-border">
            <img
              src={course.cover_image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

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
              <div className="lg:col-span-1 space-y-6">
                {/* Assignments List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Course Assignments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     {modules.filter(m => m.type?.toLowerCase() === 'assignment').length === 0 ? (
                       <div className="p-4 text-sm text-muted-foreground text-center">
                         No assignments in this course.
                       </div>
                     ) : (
                       <div className="divide-y">
                         {modules.filter(m => m.type?.toLowerCase() === 'assignment').map((module) => (
                           <button
                             key={module.id}
                             onClick={() => setSelectedModule(module)}
                             className={`w-full text-left p-3 hover:bg-accent transition-colors text-sm ${
                               selectedModule?.id === module.id ? 'bg-accent' : ''
                             }`}
                           >
                             <div className="flex items-start justify-between gap-2">
                               <span className="font-medium line-clamp-2">{module.title}</span>
                               <div className="flex-shrink-0">
                                 {module.completed ? (
                                   <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                     Completed
                                   </Badge>
                                 ) : (
                                   <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                     Pending
                                   </Badge>
                                 )}
                               </div>
                             </div>
                           </button>
                         ))}
                       </div>
                     )}
                  </CardContent>
                </Card>

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
                              {module.progress_percentage !== undefined && module.progress_percentage > 0 && module.progress_percentage < 100 && (
                                <div className="mt-1">
                                  <Progress value={module.progress_percentage} className="h-1" />
                                  <span className="text-xs text-muted-foreground">
                                    {module.progress_percentage}% visto
                                  </span>
                                </div>
                              )}
                              {module.times_accessed && module.times_accessed > 1 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Visitado {module.times_accessed} veces
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
