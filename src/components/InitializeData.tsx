import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { SeedService } from '../services/seed.service';
import { Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';

interface InitializeDataProps {
  userId: string;
  userName: string;
  userRole: 'student' | 'teacher' | 'admin';
  onComplete?: () => void;
}

export function InitializeData({ userId, userName, userRole, onComplete }: InitializeDataProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await SeedService.seedSampleData(userId, userName, userRole);
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setError('Failed to initialize sample data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-16 w-16 text-primary" />
          </div>
          <CardTitle>Welcome to Kampus!</CardTitle>
          <CardDescription>
            Would you like to initialize your account with sample data?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Sample data initialized successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <>
              <div className="text-sm text-muted-foreground space-y-2">
                {userRole === 'teacher' && (
                  <p>
                    As a teacher, we'll create sample courses and evaluations for you to explore.
                  </p>
                )}
                {userRole === 'admin' && (
                  <p>
                    As an admin, we'll create sample courses and data to help you get started.
                  </p>
                )}
                {userRole === 'student' && (
                  <p>
                    You can skip this step and browse courses created by teachers.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInitialize}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Initialize Sample Data
                </Button>
                <Button
                  onClick={() => onComplete?.()}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
