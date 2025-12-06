import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
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
  Copy,
  MoreVertical,
  Search,
  Loader2
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);

  // New module form
  const [newModule, setNewModule] = useState({
    title: '',
    type: 'text' as CourseModule['type'],
    content: '',
    url: '',
    file_url: '',
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
      // Sort by order
      const sortedModules = [...courseModules].sort((a, b) => (a.order || 0) - (b.order || 0));
      setModules(sortedModules);
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
      setNewModule({ title: '', type: 'text', content: '', url: '', file_url: '', duration: '', order: 0 });
      setShowAddModule(false);
      loadModules();
    } catch (error: any) {
      console.error('Error adding module:', error);
      toast.error(`Failed to add module: ${error.message || error}`);
    }
  };

  const handleEditModule = (module: CourseModule) => {
    // Create a copy of the module to avoid reference issues
    const moduleCopy = { ...module };
    setEditingModule(moduleCopy);
    setShowEditDialog(true);
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;

    try {
      await ApiService.updateModule(editingModule.id, editingModule);
      toast.success('Module updated successfully');
      setShowEditDialog(false);
      setEditingModule(null);
      loadModules();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };

  const handleDeleteModule = async () => {
    if (!selectedModule) return;
    try {
      await ApiService.deleteModule(selectedModule.id);
      toast.success('Module deleted successfully');
      setShowDeleteDialog(false);
      setSelectedModule(null);
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

    // Identify only modules whose order has changed to minimize API calls
    // However, since we might not have the previous order for strict comparison easily without a map, 
    // and reordering usually affects a range, checking against original state is good.
    // simpler: update all in parallel, it's much faster than sequential.
    // Better: Filter.
    
    const modulesToUpdate = updatedModules.filter(m => {
        const oldModule = modules.find(om => om.id === m.id);
        return oldModule && oldModule.order !== m.order;
    });

    try {
      await Promise.all(modulesToUpdate.map(module => 
        ApiService.updateModule(module.id, { order: module.order })
      ));
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
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddModule(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : modules.filter((module) =>
            module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            module.type.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No modules found' : 'No modules yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Start building your course by adding modules with different types of content.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddModule(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Module
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Content Preview</TableHead>
                    <TableHead className="hidden lg:table-cell">Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules
                    .filter((module) =>
                      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      module.type.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((module, index) => (
                      <TableRow
                        key={module.id}
                        className="group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, module.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, module.id)}
                      >
                        <TableCell>
                          <div className="cursor-move p-1 hover:bg-accent rounded">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getModuleIcon(module.type)}
                            <div>
                              <div className="font-medium">{module.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Order: {module.order ?? index}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{module.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                            {module.content
                              ? module.content.replace(/<[^>]*>/g, '').substring(0, 100)
                              : module.url || 'No content'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {module.duration || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditModule(module)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedModule(module);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module for your course with different types of content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title *</Label>
              <Input
                id="module-title"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="Enter module title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-type">Module Type *</Label>
              <Select
                value={newModule.type}
                onValueChange={(value: CourseModule['type']) => 
                  setNewModule({ ...newModule, type: value })
                }
              >
                <SelectTrigger id="module-type">
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

            <div className="space-y-2">
              <Label htmlFor="module-content">Content</Label>
              <Textarea
                id="module-content"
                value={newModule.content}
                onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                placeholder="Enter module content (supports HTML)"
                rows={6}
              />
            </div>

            {(newModule.type === 'video' || newModule.type === 'link') && (
              <div className="space-y-2">
                <Label htmlFor="module-url">URL</Label>
                <Input
                  id="module-url"
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

            {(newModule.type === 'pdf' || newModule.type === 'image') && (
              <div className="space-y-2">
                <Label htmlFor="module-file-url">File URL</Label>
                <Input
                  id="module-file-url"
                  value={newModule.file_url || ''}
                  onChange={(e) => setNewModule({ ...newModule, file_url: e.target.value })}
                  placeholder="Enter file URL"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="module-duration">Duration (optional)</Label>
              <Input
                id="module-duration"
                value={newModule.duration}
                onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                placeholder="e.g., 15 min, 1 hour"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddModule(false);
              setNewModule({ title: '', type: 'text', content: '', url: '', file_url: '', duration: '', order: 0 });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddModule}>
              <Save className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog 
        open={showEditDialog} 
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingModule(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Update the module content and settings.
            </DialogDescription>
          </DialogHeader>
          {editingModule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-module-title">Module Title *</Label>
                <Input
                  id="edit-module-title"
                  value={editingModule.title}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-module-type">Module Type *</Label>
                <Select
                  value={editingModule.type}
                  onValueChange={(value: CourseModule['type']) =>
                    setEditingModule({ ...editingModule, type: value })
                  }
                >
                  <SelectTrigger id="edit-module-type">
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

              <div className="space-y-2">
                <Label htmlFor="edit-module-content">Content</Label>
                <Textarea
                  id="edit-module-content"
                  value={editingModule.content || ''}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, content: e.target.value })
                  }
                  rows={6}
                />
              </div>

              {(editingModule.type === 'video' || editingModule.type === 'link') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-module-url">URL</Label>
                  <Input
                    id="edit-module-url"
                    value={editingModule.url || ''}
                    onChange={(e) =>
                      setEditingModule({ ...editingModule, url: e.target.value })
                    }
                  />
                </div>
              )}

              {(editingModule.type === 'pdf' || editingModule.type === 'image') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-module-file-url">File URL</Label>
                  <Input
                    id="edit-module-file-url"
                    value={editingModule.file_url || ''}
                    onChange={(e) =>
                      setEditingModule({ ...editingModule, file_url: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-module-duration">Duration</Label>
                <Input
                  id="edit-module-duration"
                  value={editingModule.duration || ''}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, duration: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModule}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the module "{selectedModule?.title}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}