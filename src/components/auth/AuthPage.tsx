import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Logo } from '../Logo';
import { Mail, Lock, User, CheckCircle, Loader2 } from 'lucide-react';
import { signUpEmail, signInEmail, signInGoogle } from '../../services/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { FirebaseChecker } from '../FirebaseChecker';
import { TestRegistration } from '../TestRegistration';
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type Role
} from '../../lib/validations';

const instituteLogoUrl = 'https://images.unsplash.com/photo-1621008945448-513cef3a463d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0aXR1dGUlMjBlZHVjYXRpb24lMjBsb2dvfGVufDF8fHx8MTc1NzI4NTgzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

type AuthState = 'login' | 'register' | 'forgot-password' | 'email-verification' | 'password-reset-sent';

interface AuthPageProps {
  authState: AuthState;
  onAuthStateChange: (state: AuthState) => void;
}

export function AuthPage({ authState, onAuthStateChange }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student' as Role,
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      await signInEmail(data.email, data.password);
      // The AuthContext will handle the redirect automatically
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    console.log('Registration form submitted:', data);
    setLoading(true);
    setError('');
    
    try {
      console.log('Calling signUpEmail...');
      await signUpEmail(data.email, data.password, data.role || 'student', data.name);
      console.log('Registration successful, showing email verification');
      setResetEmail(data.email);
      onAuthStateChange('email-verification');
    } catch (err: any) {
      console.error('Registration failed:', err);
      
      // Show more detailed error message
      let errorMessage = getFirebaseErrorMessage(err.code || err.message);
      if (err.message?.includes('Firebase is not properly configured')) {
        errorMessage = 'Firebase is not configured. Please set up your Firebase credentials in the .env file.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, data.email);
      setResetEmail(data.email);
      onAuthStateChange('password-reset-sent');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInGoogle();
      // The AuthContext will handle the redirect automatically
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/configuration-not-found':
        return 'Authentication not configured. Please check your Firebase setup';
      default:
        return 'An error occurred. Please try again';
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
              We've sent a verification link to {resetEmail}. Please check your email and verify your account before logging in.
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

  if (authState === 'password-reset-sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Password Reset Sent</CardTitle>
            <CardDescription>
              We've sent a password reset link to {resetEmail}. Check your email and follow the instructions to reset your password.
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

  const renderLoginField = (name: keyof LoginFormData, label: string, type: string, icon: React.ReactNode, placeholder: string) => {
    const fieldError = loginForm.formState.errors[name];
    
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="relative">
          {icon}
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            className="pl-10"
            {...loginForm.register(name)}
          />
        </div>
        {fieldError && (
          <p className="text-sm text-destructive">{fieldError.message?.toString()}</p>
        )}
      </div>
    );
  };

  const renderRegisterField = (name: keyof RegisterFormData, label: string, type: string, icon: React.ReactNode, placeholder: string) => {
    const fieldError = registerForm.formState.errors[name];
    
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="relative">
          {icon}
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            className="pl-10"
            {...registerForm.register(name)}
          />
        </div>
        {fieldError && (
          <p className="text-sm text-destructive">{fieldError.message?.toString()}</p>
        )}
      </div>
    );
  };

  const renderForgotField = (name: keyof ForgotPasswordFormData, label: string, type: string, icon: React.ReactNode, placeholder: string) => {
    const fieldError = forgotPasswordForm.formState.errors[name];
    
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="relative">
          {icon}
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            className="pl-10"
            {...forgotPasswordForm.register(name)}
          />
        </div>
        {fieldError && (
          <p className="text-sm text-destructive">{fieldError.message?.toString()}</p>
        )}
      </div>
    );
  };

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
              authState === 'login' ? loginForm.handleSubmit(handleLogin) :
              authState === 'register' ? registerForm.handleSubmit(handleRegister) :
              forgotPasswordForm.handleSubmit(handleForgotPassword)
            } className="space-y-4">
              
              {authState === 'register' && renderRegisterField(
                'name',
                'Full Name',
                'text',
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Enter your full name'
              )}

              {authState === 'login' && renderLoginField(
                'email',
                'Email',
                'email',
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Enter your email'
              )}

              {authState === 'register' && renderRegisterField(
                'email',
                'Email',
                'email',
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Enter your email'
              )}

              {authState === 'forgot-password' && renderForgotField(
                'email',
                'Email',
                'email',
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Enter your email'
              )}

              {authState === 'login' && renderLoginField(
                'password',
                'Password',
                'password',
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Enter your password'
              )}

              {authState === 'register' && renderRegisterField(
                'password',
                'Password',
                'password',
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Enter your password'
              )}

              {authState === 'register' && renderRegisterField(
                'confirmPassword',
                'Confirm Password',
                'password',
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
                'Confirm your password'
              )}

              {authState === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={registerForm.watch('role') || 'student'}
                    onValueChange={(value: Role) => registerForm.setValue('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  {registerForm.formState.errors.role && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.role.message}</p>
                  )}
                </div>
              )}

              {authState === 'login' && (
                <div className="space-y-2">
                  <Label htmlFor="role">Login as</Label>
                  <Select
                    value={loginForm.watch('role') || 'student'}
                    onValueChange={(value: Role) => loginForm.setValue('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  {loginForm.formState.errors.role && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.role.message}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authState === 'login' && (loading ? 'Signing In...' : 'Sign In')}
                {authState === 'register' && (loading ? 'Creating Account...' : 'Create Account')}
                {authState === 'forgot-password' && (loading ? 'Sending...' : 'Send Reset Link')}
              </Button>
            </form>

            {authState === 'login' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"></path>
                    </svg>
                  )}
                  Sign in with Google
                </Button>
              </>
            )}

            <div className="text-center space-y-2">
              {authState === 'login' && (
                <>
                  <Button 
                    variant="link" 
                    onClick={() => onAuthStateChange('forgot-password')}
                    className="text-sm"
                    disabled={loading}
                  >
                    Forgot your password?
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      onClick={() => onAuthStateChange('register')}
                      className="p-0 h-auto"
                      disabled={loading}
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
                    disabled={loading}
                  >
                    Sign in
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Firebase Configuration Checker - only show if there are config issues */}
        <FirebaseChecker />

        {/* Test Registration - only in development */}
        {import.meta.env.DEV && (
          <TestRegistration />
        )}
      </div>
    </div>
  );
}