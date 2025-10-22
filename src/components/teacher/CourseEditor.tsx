import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Eye
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  enrolledStudents: number;
  totalModules: number;
  completionRate: number;
  createdAt: string;
  lastUpdated: string;
}

interface Module {
  id: string;
  title: string;
  type: 'text' | 'video' | 'pdf' | 'link';
  content?: string;
  url?: string;
  duration?: string;
  order: number;
}

const mockModules: Module[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    type: 'video',
    content: 'Welcome to our comprehensive web development course.',
    duration: '12 min',
    order: 1
  },
  {
    id: '2',
    title: 'HTML Fundamentals',
    type: 'text',
    content: 'HTML (HyperText Markup Language) is the standard markup language...',
    order: 2
  },
  {
    id: '3',
    title: 'CSS Styling Guide',
    type: 'pdf',
    url: '/documents/css-guide.pdf',
    order: 3
  }
];

interface CourseEditorProps {
  course?: Course | null;
  onBack: () => void;
  onSave: (courseData: any) => void;
}

export function CourseEditor({ course, onBack, onSave }: CourseEditorProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [courseData, setCourseData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    status: course?.status || 'draft',
    category: 'web-development',
    difficulty: 'beginner',
    estimatedHours: '40',
    prerequisites: '',
    learningObjectives: ['', '', '']
  });
  const [modules, setModules] = useState<Module[]>(mockModules);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);

  const handleCourseDataChange = (field: string, value: string) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      type: 'text',
      content: '',
      order: modules.length + 1
    };
    setModules([...modules, newModule]);
    setSelectedModule(newModule);
    setIsAddingModule(true);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(prev => prev.map(mod => 
      mod.id === moduleId ? { ...mod, ...updates } : mod
    ));
    if (selectedModule && selectedModule.id === moduleId) {
      setSelectedModule({ ...selectedModule, ...updates });
    }
  };

  const deleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(mod => mod.id !== moduleId));
    if (selectedModule && selectedModule.id === moduleId) {
      setSelectedModule(null);
    }
  };

  const handleSave = () => {
    const fullCourseData = {
      ...courseData,
      modules,
      id: course?.id || Date.now().toString()
    };
    onSave(fullCourseData);
  };

  const ModuleEditor = ({ module }: { module: Module }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Module</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSelectedModule(null)}>
            <Eye className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="module-title">Module Title</Label>
          <Input
            id="module-title"
            value={module.title}
            onChange={(e) => updateModule(module.id, { title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="module-type">Content Type</Label>
          <Select
            value={module.type}
            onValueChange={(value: 'text' | 'video' | 'pdf' | 'link') => 
              updateModule(module.id, { type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Content</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="pdf">PDF Document</SelectItem>
              <SelectItem value="link">External Link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {module.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="module-content">Content</Label>
            <Textarea
              id="module-content"
              className="min-h-32"
              value={module.content || ''}
              onChange={(e) => updateModule(module.id, { content: e.target.value })}
              placeholder="Enter your module content here..."
            />
          </div>
        )}

        {module.type === 'video' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                value={module.url || ''}
                onChange={(e) => updateModule(module.id, { url: e.target.value })}
                placeholder="Enter video URL or upload video"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-duration">Duration</Label>
              <Input
                id="video-duration"
                value={module.duration || ''}
                onChange={(e) => updateModule(module.id, { duration: e.target.value })}
                placeholder="e.g., 15 min"
              />
            </div>
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Video File
            </Button>
          </div>
        )}

        {(module.type === 'pdf' || module.type === 'link') && (
          <div className="space-y-2">
            <Label htmlFor="module-url">
              {module.type === 'pdf' ? 'PDF File URL' : 'External Link URL'}
            </Label>
            <Input
              id="module-url"
              value={module.url || ''}
              onChange={(e) => updateModule(module.id, { url: e.target.value })}
              placeholder={module.type === 'pdf' ? 'Enter PDF URL or upload file' : 'Enter external link URL'}
            />
            {module.type === 'pdf' && (
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF File
              </Button>
            )}
          </div>
        )}

        {(module.type === 'text' || module.type === 'video') && (
          <div className="space-y-2">
            <Label htmlFor="module-description">Description</Label>
            <Textarea
              id="module-description"
              value={module.content || ''}
              onChange={(e) => updateModule(module.id, { content: e.target.value })}
              placeholder="Brief description of this module..."
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => deleteModule(module.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Module
          </Button>
          <Button onClick={() => setSelectedModule(null)}>
            Save Module
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (selectedModule) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <h1>{course ? 'Edit Course' : 'Create New Course'}</h1>
        </div>
        <ModuleEditor module={selectedModule} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <h1>{course ? 'Edit Course' : 'Create New Course'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={courseData.status === 'published' ? 'default' : 'secondary'}>
            {courseData.status}
          </Badge>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Course
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input
                  id="course-title"
                  value={courseData.title}
                  onChange={(e) => handleCourseDataChange('title', e.target.value)}
                  placeholder="Enter course title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-description">Description</Label>
                <Textarea
                  id="course-description"
                  value={courseData.description}
                  onChange={(e) => handleCourseDataChange('description', e.target.value)}
                  placeholder="Enter course description"
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-category">Category</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value) => handleCourseDataChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-difficulty">Difficulty Level</Label>
                  <Select
                    value={courseData.difficulty}
                    onValueChange={(value) => handleCourseDataChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  value={courseData.estimatedHours}
                  onChange={(e) => handleCourseDataChange('estimatedHours', e.target.value)}
                  placeholder="40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={courseData.prerequisites}
                  onChange={(e) => handleCourseDataChange('prerequisites', e.target.value)}
                  placeholder="List any prerequisites for this course"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseData.learningObjectives.map((objective, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`objective-${index}`}>Objective {index + 1}</Label>
                  <Input
                    id={`objective-${index}`}
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`Learning objective ${index + 1}`}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setCourseData(prev => ({
                  ...prev,
                  learningObjectives: [...prev.learningObjectives, '']
                }))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2>Course Modules</h2>
            <Button onClick={addModule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Module {index + 1}</span>
                        <Badge variant="outline">
                          {module.type === 'text' && <FileText className="mr-1 h-3 w-3" />}
                          {module.type === 'video' && <Video className="mr-1 h-3 w-3" />}
                          {module.type === 'link' && <Link className="mr-1 h-3 w-3" />}
                          {module.type}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{module.title}</h3>
                      {module.duration && (
                        <p className="text-sm text-muted-foreground">Duration: {module.duration}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedModule(module)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-status">Publication Status</Label>
                <Select
                  value={courseData.status}
                  onValueChange={(value) => handleCourseDataChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3>Enrollment Settings</h3>
                <div className="space-y-2">
                  <Label>
                    <input type="checkbox" className="mr-2" />
                    Require instructor approval for enrollment
                  </Label>
                  <Label>
                    <input type="checkbox" className="mr-2" />
                    Allow self-enrollment
                  </Label>
                  <Label>
                    <input type="checkbox" className="mr-2" />
                    Send welcome email to new students
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
