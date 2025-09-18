import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { signUpEmail } from '../services/auth';
import { Loader2 } from 'lucide-react';

export function TestRegistration() {
  const [formData, setFormData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'student' as const
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleTestRegistration = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      console.log('Testing registration with:', formData);
      const user = await signUpEmail(formData.email, formData.password, formData.role, formData.name);
      setResult(`Registration successful! User ID: ${user.uid}`);
    } catch (err: any) {
      console.error('Test registration failed:', err);
      setError(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Test Registration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-name">Name</Label>
          <Input
            id="test-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-email">Email</Label>
          <Input
            id="test-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-password">Password</Label>
          <Input
            id="test-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>

        <Button onClick={handleTestRegistration} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Registration
        </Button>

        {result && (
          <Alert>
            <AlertDescription className="text-green-600">{result}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}