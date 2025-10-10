import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Upload, Camera, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { UserProfileService } from '../../../services/user-profile.service';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentPhotoUrl?: string;
  userName: string;
  onPhotoUpdated?: (newUrl: string) => void;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  userId,
  currentPhotoUrl,
  userName,
  onPhotoUpdated,
}: PhotoUploadDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && !imageUrl) {
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
            
            // Update user profile in Firestore with base64 data
            await UserProfileService.updateStudentProfile(userId, {
              photo_url: downloadUrl,
            });

            toast.success('Profile picture updated successfully!');
            onPhotoUpdated?.(downloadUrl);
            onOpenChange(false);

            // Reset state
            setPreviewUrl(null);
            setSelectedFile(null);
            setImageUrl('');
            setUploading(false);
          } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile picture');
            setUploading(false);
          }
        };
        reader.onerror = () => {
          toast.error('Failed to read file');
          setUploading(false);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // Use provided URL
        downloadUrl = imageUrl;
        
        // Update user profile in Firestore
        await UserProfileService.updateStudentProfile(userId, {
          photo_url: downloadUrl,
        });

        toast.success('Profile picture updated successfully!');
        onPhotoUpdated?.(downloadUrl);
        onOpenChange(false);

        // Reset state
        setPreviewUrl(null);
        setSelectedFile(null);
        setImageUrl('');
        setUploading(false);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please use an image URL instead.');
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);

    try {
      // Update user profile to remove photo_url
      await UserProfileService.updateStudentProfile(userId, {
        photo_url: undefined,
      });

      toast.success('Profile picture removed');
      onPhotoUpdated?.('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or provide an image URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current/Preview Photo */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || currentPhotoUrl} alt={userName} />
              <AvatarFallback className="text-3xl">{getInitials(userName)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Upload Options */}
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Or divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={uploading || !!selectedFile}
                />
                <Button
                  variant="outline"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl || uploading || !!selectedFile}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected file info */}
            {selectedFile && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          {currentPhotoUrl && (
            <Button
              variant="destructive"
              onClick={handleRemovePhoto}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={uploading || (!selectedFile && !previewUrl)}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

