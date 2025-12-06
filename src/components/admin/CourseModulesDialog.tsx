import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Video,
  Link,
  Image,
  File,
  GripVertical,
  Eye,
  Loader2,
} from 'lucide-react';
import { CourseModule, Course } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';

interface CourseModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}

export function CourseModulesDialog({
  open,
  onOpenChange,
  course,
}: CourseModulesDialogProps) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);

  // New module form
  const [newModule, setNewModule] = useState({
    title: '',
    type: 'text' as CourseModule['type'],
    content: '',
    url: '',
    file_url: '',
    duration: '',
    order: 0,
  });

  useEffect(() => {
    if (open && course) {
      loadModules();
    }
  }, [open, course]);

  const loadModules = async () => {
    if (!course) return;
    try {
      setLoading(true);
      const courseModules = await ApiService.getCourseModules(course.id);
      // Sort by order
      const sortedModules = [...courseModules].sort((a, b) => (a.order || 0) - (b.order || 0));
      setModules(sortedModules);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModuleIcon = (type: CourseModule['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <File className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateModule = async () => {
    if (!course) return;
    if (!newModule.title.trim()) {
      toast.error('Please enter a module title');
      return;
    }

    try {
      const moduleData = {
        ...newModule,
        order: modules.length,
      };
      await ApiService.createModule(course.id, moduleData);
      toast.success('Module created successfully');
      setNewModule({
        title: '',
        type: 'text',
        content: '',
        url: '',
        file_url: '',
        duration: '',
        order: 0,
      });
      setShowCreateDialog(false);
      loadModules();
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    }
  };

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module);
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

    if (!draggedModule || draggedModule === targetModuleId || !course) {
      setDraggedModule(null);
      return;
    }

    const draggedIndex = modules.findIndex((m) => m.id === draggedModule);
    const targetIndex = modules.findIndex((m) => m.id === targetModuleId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newModules = [...modules];
    const [draggedItem] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedItem);

    // Update order for all modules
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index,
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

  if (!course) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Modules - {course.title}</DialogTitle>
            <DialogDescription>
              Manage modules for this course. Drag and drop to reorder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Start by adding your first module'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                )}
              </div>
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
                    {filteredModules.map((module, index) => (
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Module Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>
              Add a new module to the course with different types of content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title *</Label>
              <Input
                id="module-title"
                value={newModule.title}
                onChange={(e) =>
                  setNewModule({ ...newModule, title: e.target.value })
                }
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
                onChange={(e) =>
                  setNewModule({ ...newModule, content: e.target.value })
                }
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
                  onChange={(e) =>
                    setNewModule({ ...newModule, url: e.target.value })
                  }
                  placeholder={
                    newModule.type === 'video'
                      ? 'Enter video URL (YouTube, Vimeo, or direct video file)'
                      : 'Enter URL'
                  }
                />
              </div>
            )}

            {(newModule.type === 'pdf' || newModule.type === 'image') && (
              <div className="space-y-2">
                <Label htmlFor="module-file-url">File URL</Label>
                <Input
                  id="module-file-url"
                  value={newModule.file_url}
                  onChange={(e) =>
                    setNewModule({ ...newModule, file_url: e.target.value })
                  }
                  placeholder="Enter file URL"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="module-duration">Duration (optional)</Label>
              <Input
                id="module-duration"
                value={newModule.duration}
                onChange={(e) =>
                  setNewModule({ ...newModule, duration: e.target.value })
                }
                placeholder="e.g., 15 min, 1 hour"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewModule({
                  title: '',
                  type: 'text',
                  content: '',
                  url: '',
                  file_url: '',
                  duration: '',
                  order: 0,
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateModule}>Create Module</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModule}>Save Changes</Button>
          </div>
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
    </>
  );
}

