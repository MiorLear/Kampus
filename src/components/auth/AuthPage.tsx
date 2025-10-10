import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Logo } from '../Logo';
import { Mail, Lock, User, CheckCircle, Loader2 } from 'lucide-react';
import { AuthService, UserRole } from '../../services/auth.service';
import { toast } from 'sonner@2.0.3';

const instituteLogoUrl = 'https://images.unsplash.com/photo-1621008945448-513cef3a463d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0aXR1dGUlMjBlZHVjYXRpb24lMjBsb2dvfGVufDF8fHx8MTc1NzI4NTgzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

type AuthState = 'login' | 'register' | 'forgot-password' | 'email-verification';

interface AuthPageProps {
  authState: AuthState;
  onAuthStateChange: (state: AuthState) => void;
}

export function AuthPage({ authState, onAuthStateChange }: AuthPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await AuthService.login(formData.email, formData.password);
      toast.success('Login successful!');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await AuthService.register(formData.email, formData.password, formData.name, formData.role);
      toast.success('Account created! Please check your email for verification.');
      onAuthStateChange('email-verification');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await AuthService.resetPassword(formData.email);
      toast.success('Password reset email sent!');
      onAuthStateChange('email-verification');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (authState === 'email-verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onAuthStateChange('login')} 
              variant="outline" 
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-6">
            <img src={instituteLogoUrl} alt="Key Institute" className="h-20 w-20 rounded-lg object-cover" />
          </div>
          <Logo size="lg" className="mb-4 justify-center md:justify-start flex" />
          <h1 className="mb-2 text-foreground">Learning Management System</h1>
          <p className="text-muted-foreground">
            Empowering education through technology. Join thousands of students and educators in our learning community.
          </p>
        </div>

        {/* Right side - Forms */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              {authState === 'login' && 'Welcome Back'}
              {authState === 'register' && 'Create Account'}
              {authState === 'forgot-password' && 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {authState === 'login' && 'Sign in to your Kampus account'}
              {authState === 'register' && 'Join the Kampus learning community'}
              {authState === 'forgot-password' && 'Enter your email to receive a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={
              authState === 'login' ? handleLogin : 
              authState === 'register' ? handleRegister : 
              handleForgotPassword
            } className="space-y-4">
              
              {authState === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              {authState !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {authState === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authState === 'login' && 'Sign In'}
                {authState === 'register' && 'Create Account'}
                {authState === 'forgot-password' && 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center space-y-2">
              {authState === 'login' && (
                <>
                  <Button 
                    variant="link" 
                    onClick={() => onAuthStateChange('forgot-password')}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      onClick={() => onAuthStateChange('register')}
                      className="p-0 h-auto"
                    >
                      Sign up
                    </Button>
                  </div>
                </>
              )}

              {(authState === 'register' || authState === 'forgot-password') && (
                <div className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button 
                    variant="link" 
                    onClick={() => onAuthStateChange('login')}
                    className="p-0 h-auto"
                  >
                    Sign in
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}