import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CoverImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  courseTitle?: string;
}

export function CoverImageUpload({
  currentImageUrl,
  onImageChange,
  courseTitle,
}: CoverImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl) return;

    // Validate URL format
    try {
      new URL(imageUrl);
      setPreviewUrl(imageUrl);
      setSelectedFile(null); // Clear file selection if URL is used
      onImageChange(imageUrl);
      toast.success('Cover image URL set');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleSave = async () => {
    if (!selectedFile && !imageUrl && !previewUrl) {
      toast.error('Please select an image or enter a URL');
      return;
    }

    setUploading(true);

    try {
      let downloadUrl: string;

      if (selectedFile) {
        // Convert file to base64 data URL (temporary solution for CORS issues)
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            downloadUrl = e.target?.result as string;
            onImageChange(downloadUrl);
            toast.success('Cover image uploaded successfully!');

            // Reset state
            setSelectedFile(null);
            setImageUrl('');
            setUploading(false);
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            setUploading(false);
          }
        };
        reader.onerror = () => {
          toast.error('Failed to read file');
          setUploading(false);
        };
        reader.readAsDataURL(selectedFile);
        return; // Early return, will continue in reader.onload
      } else if (imageUrl) {
        // Use provided URL
        downloadUrl = imageUrl;
        onImageChange(downloadUrl);
        toast.success('Cover image URL set');
      } else if (previewUrl) {
        // Already set
        onImageChange(previewUrl);
      }

      // Reset state
      setSelectedFile(null);
      setImageUrl('');
      setUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageUrl('');
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Cover image removed');
  };

  return (
    <div className="space-y-4">
      <Label>Cover Image</Label>
      
      {/* Preview */}
      {previewUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
          <img
            src={previewUrl}
            alt={courseTitle ? `${courseTitle} cover` : 'Course cover'}
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drag and drop an image here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="cover-image-url">Or enter image URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="cover-image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="pl-10"
              disabled={uploading || !!previewUrl}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlSubmit}
            disabled={uploading || !imageUrl || !!previewUrl}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Use URL
          </Button>
        </div>
      </div>

      {/* Save Button (only show if there's a change) */}
      {previewUrl && (selectedFile || imageUrl) && (
        <Button
          type="button"
          onClick={handleSave}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Save Cover Image
            </>
          )}
        </Button>
      )}
    </div>
  );
}

