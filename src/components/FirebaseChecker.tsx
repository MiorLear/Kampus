import React from 'react';
import { auth, db } from '../lib/firebase';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function FirebaseChecker() {
  const checkFirebaseConfig = () => {
    const config = auth.app.options;
    const requiredFields = [
      'apiKey',
      'authDomain', 
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId'
    ];
    
    const issues: string[] = [];
    const checks: { field: string; status: 'ok' | 'error' | 'placeholder' }[] = [];
    
    requiredFields.forEach(field => {
      const value = (config as any)[field];
      if (!value) {
        issues.push(`Missing ${field}`);
        checks.push({ field, status: 'error' });
      } else if (value.includes('placeholder') || value === '123456789') {
        issues.push(`${field} is using placeholder value`);
        checks.push({ field, status: 'placeholder' });
      } else {
        checks.push({ field, status: 'ok' });
      }
    });
    
    return { issues, checks };
  };

  const { issues, checks } = checkFirebaseConfig();
  const hasIssues = issues.length > 0;

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasIssues ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Firebase Configuration
        </CardTitle>
        <CardDescription>
          Status of your Firebase setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasIssues && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Firebase is not properly configured. Please update your .env file with real Firebase credentials.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {checks.map(({ field, status }) => (
            <div key={field} className="flex items-center justify-between">
              <span className="text-sm">{field}:</span>
              <div className="flex items-center gap-1">
                {status === 'ok' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                {status === 'placeholder' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                <span className={`text-xs ${
                  status === 'ok' ? 'text-green-600' : 
                  status === 'error' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {status === 'ok' ? 'OK' : 
                   status === 'error' ? 'Missing' : 
                   'Placeholder'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {hasIssues && (
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>To fix this:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Go to Firebase Console (console.firebase.google.com)</li>
              <li>Create or select your project</li>
              <li>Go to Project Settings → General → Your apps</li>
              <li>Copy the config values to your .env file</li>
              <li>Enable Authentication and Firestore</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}