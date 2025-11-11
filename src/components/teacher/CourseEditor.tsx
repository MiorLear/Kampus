import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  FileText,
  Video,
  Link,
  Upload,
  Eye,
  Image,
  File,
  Edit,
  Move,
  Copy
} from 'lucide-react';
import { CourseModule } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

interface CourseEditorProps {
  course: Course;
  onBack: () => void;
}

export function CourseEditor({ course, onBack }: CourseEditorProps) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);

  // New module form
  const [newModule, setNewModule] = useState({
    title: '',
    type: 'text' as CourseModule['type'],
    content: '',
    url: '',
    duration: '',
    order: 0
  });

  useEffect(() => {
    loadModules();
  }, [course.id]);

  const loadModules = async () => {
    try {
      setLoading(true);
      console.log('Loading modules for course:', course.id);
      const courseModules = await ApiService.getCourseModules(course.id);
      console.log('Loaded modules:', courseModules);
      console.log('Setting modules state with:', courseModules);
      setModules(courseModules);
      console.log('Modules state should now be:', courseModules);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.title.trim()) {
      toast.error('Please enter a module title');
      return;
    }

    try {
      console.log('Adding module with data:', newModule);
      console.log('Course ID:', course.id);
      
      const moduleData = {
        ...newModule,
        order: modules.length
      };

      console.log('Module data to save:', moduleData);
      
      const moduleId = await ApiService.createModule(course.id, moduleData);
      console.log('Module saved with ID:', moduleId);
      
      toast.success('Module added successfully');
      setNewModule({ title: '', type: 'text', content: '', url: '', duration: '', order: 0 });
      setShowAddModule(false);
      loadModules();
    } catch (error) {
      console.error('Error adding module:', error);
      toast.error(`Failed to add module: ${error.message || error}`);
    }
  };

  const handleUpdateModule = async (moduleId: string, updates: Partial<CourseModule>) => {
    try {
      await ApiService.updateModule(moduleId, updates);
      toast.success('Module updated successfully');
      loadModules();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await ApiService.deleteModule(moduleId);
      toast.success('Module deleted successfully');
      loadModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModule(moduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault();
    
    if (!draggedModule || draggedModule === targetModuleId) {
      setDraggedModule(null);
      return;
    }

    const draggedIndex = modules.findIndex(m => m.id === draggedModule);
    const targetIndex = modules.findIndex(m => m.id === targetModuleId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newModules = [...modules];
    const [draggedItem] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedItem);

    // Update order for all modules
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index
    }));

    setModules(updatedModules);

    // Update order in database
    try {
      for (const module of updatedModules) {
        await ApiService.updateModule(module.id, { order: module.order });
      }
      toast.success('Module order updated');
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Failed to update module order');
      loadModules(); // Revert on error
    }

    setDraggedModule(null);
  };

  const getModuleIcon = (type: CourseModule['type']) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <File className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      case 'assignment': return <Edit className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderModuleContent = (module: CourseModule) => {
    switch (module.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: module.content || '' }} />
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            {module.url ? (
              <div className="bg-black aspect-video rounded-lg overflow-hidden">
                {module.url.includes('youtube.com') || module.url.includes('youtu.be') ? (
                  // YouTube video
                  <iframe
                    src={module.url.includes('embed') ? module.url : 
                          module.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={module.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : module.url.includes('vimeo.com') ? (
                  // Vimeo video
                  <iframe
                    src={module.url.includes('player') ? module.url : 
                          module.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    title={module.title}
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
                    <source src={module.url} type="video/mp4" />
                    <source src={module.url} type="video/webm" />
                    <source src={module.url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p>Video: {module.title}</p>
                  <p className="text-sm opacity-75">{module.duration}</p>
                  <p className="text-sm opacity-50 mt-2">No video URL provided</p>
                </div>
              </div>
            )}
            {module.content && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: module.content }} />
              </div>
            )}
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center space-y-4 py-12">
            <File className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3>{module.title}</h3>
              <p className="text-muted-foreground">PDF Document - {module.duration}</p>
            </div>
            {module.file_url && (
              <Button asChild>
                <a href={module.file_url} target="_blank" rel="noopener noreferrer">
                  <File className="mr-2 h-4 w-4" />
                  View PDF
                </a>
              </Button>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            {module.file_url && (
              <img 
                src={module.file_url} 
                alt={module.title}
                className="max-w-full h-auto rounded-lg"
              />
            )}
            {module.content && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: module.content }} />
            </div>
            )}
          </div>
        );
      case 'link':
        return (
          <div className="text-center space-y-4 py-12">
            <Link className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3>{module.title}</h3>
              <p className="text-muted-foreground">External Resource</p>
            </div>
            {module.url && (
              <Button asChild>
                <a href={module.url} target="_blank" rel="noopener noreferrer">
                  <Link className="mr-2 h-4 w-4" />
                  Open Link
                </a>
              </Button>
            )}
          </div>
        );
      case 'assignment':
        return (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                This module contains an assignment. Students will need to complete it to progress.
              </AlertDescription>
            </Alert>
            {module.content && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: module.content }} />
          </div>
        )}
        </div>
  );
      default:
        return <div>Content not available</div>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading course modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Course Editor</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModule(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
          </Button>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">Modules ({modules.length})</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {console.log('Rendering modules tab, modules.length:', modules.length)}
          {console.log('Current modules state:', modules)}
          {modules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your course by adding modules with different types of content.
                </p>
                <Button onClick={() => setShowAddModule(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Module
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card key={module.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="cursor-move p-1 hover:bg-accent rounded"
                          draggable
                          onDragStart={(e) => handleDragStart(e, module.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, module.id)}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          {getModuleIcon(module.type)}
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <Badge variant="outline">{module.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingModule(module)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderModuleContent(module)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Module {index + 1}
                      </span>
                      <Badge variant="outline">{module.type}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                    {renderModuleContent(module)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Module Dialog */}
      <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module for your course with different types of content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Module Title</Label>
              <Input
                id="title"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="Enter module title"
                />
              </div>

            <div>
              <Label htmlFor="type">Module Type</Label>
                  <Select
                value={newModule.type}
                onValueChange={(value: CourseModule['type']) => 
                  setNewModule({ ...newModule, type: value })
                }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newModule.content}
                onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                placeholder="Enter module content (supports HTML)"
                rows={6}
              />
                </div>

            {(newModule.type === 'video' || newModule.type === 'link') && (
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newModule.url}
                  onChange={(e) => setNewModule({ ...newModule, url: e.target.value })}
                  placeholder={
                    newModule.type === 'video' 
                      ? "Enter video URL (YouTube, Vimeo, or direct video file URL)"
                      : "Enter URL"
                  }
                />
                {newModule.type === 'video' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported: YouTube (youtube.com/watch?v=...), Vimeo (vimeo.com/...), or direct video files (.mp4, .webm, .ogg)
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="duration">Duration (optional)</Label>
              <Input
                id="duration"
                value={newModule.duration}
                onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                placeholder="e.g., 15 min, 1 hour"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModule(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddModule}>
                <Save className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Update the module content and settings.
            </DialogDescription>
          </DialogHeader>
          
          {editingModule && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Module Title</Label>
                <Input
                  id="edit-title"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingModule.content || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, content: e.target.value })}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="edit-url">URL</Label>
                  <Input
                  id="edit-url"
                  value={editingModule.url || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, url: e.target.value })}
                  />
                </div>

              <div>
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={editingModule.duration || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, duration: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingModule(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleUpdateModule(editingModule.id, editingModule);
                  setEditingModule(null);
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}