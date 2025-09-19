import React from 'react';
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
import { isFirebaseConfigured } from '../../lib/firebase';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  emailVerificationSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type EmailVerificationFormData,
} from '../../lib/validations';

const instituteLogoUrl =
  'https://images.unsplash.com/photo-1621008945448-513cef3a463d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0aXR1dGUlMjBlZHVjYXRpb24lMjBsb2dvfGVufDF8fHx8MTc1NzI4NTgzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

const authErrorMessage = (err: any): string => {
  const code = err?.code || '';
  const MAP: Record<string, string> = {
    'auth/invalid-email': 'El correo no es válido.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/user-disabled': 'La cuenta está deshabilitada.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo más tarde.',
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/network-request-failed': 'Error de red. Revisa tu conexión.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
    'auth/cancelled-popup-request': 'Se canceló el intento anterior de inicio de sesión.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  };
  return MAP[code] ?? (err?.message || 'Ocurrió un error. Intenta de nuevo.');
};

type AuthState = 'login' | 'register' | 'forgot-password' | 'email-verification';
type UserRole = 'student' | 'teacher' | 'admin';
type AnyValues = Record<string, any>;

interface AuthPageProps {
  authState: AuthState;
  onAuthStateChange: (state: AuthState) => void;
  onLogin: (email: string, password: string, role?: UserRole) => Promise<void>;
  onRegister: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onGoogleSignIn: (role?: UserRole) => Promise<void>;
}

export function AuthPage({
  authState,
  onAuthStateChange,
  onLogin,
  onRegister,
  onForgotPassword,
  onGoogleSignIn,
}: AuthPageProps) {
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const getFormConfig = () => {
    switch (authState) {
      case 'login':
        return {
          schema: loginSchema,
          defaultValues: { email: '', password: '', role: 'student' as UserRole } satisfies LoginFormData & AnyValues,
        };
      case 'register':
        return {
          schema: registerSchema,
          defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'student' as UserRole,
          } satisfies RegisterFormData & AnyValues,
        };
      case 'forgot-password':
        return {
          schema: forgotPasswordSchema,
          defaultValues: { email: '' } satisfies ForgotPasswordFormData & AnyValues,
        };
      case 'email-verification':
        return {
          schema: emailVerificationSchema,
          defaultValues: { email: '' } satisfies EmailVerificationFormData & AnyValues,
        };
      default:
        return {
          schema: loginSchema,
          defaultValues: { email: '', password: '', role: 'student' as UserRole } satisfies LoginFormData & AnyValues,
        };
    }
  };

  const { schema, defaultValues } = getFormConfig();

  const form = useForm<AnyValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as AnyValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  React.useEffect(() => {
    form.reset(defaultValues as AnyValues);
  }, [authState]);

  const onSubmit = async (data: AnyValues) => {
    setIsLoading(true);
    setError('');
    try {
      if (authState === 'login') {
        const email = String(data.email || '').trim();
        const password = String(data.password || '');
        const role = (data.role as UserRole) || 'student';
        await onLogin(email, password, role);
      }
      if (authState === 'register') {
        const name = String(data.name || '').trim();
        const email = String(data.email || '').trim();
        const password = String(data.password || '');
        const role = (data.role as UserRole) || 'student';
        await onRegister(name, email, password, role);
      }
      if (authState === 'forgot-password') {
        const email = String(data.email || '').trim();
        await onForgotPassword(email);
        onAuthStateChange('email-verification');
      }
      if (authState === 'email-verification') {
        setError('Revisa tu correo y haz clic en el enlace de verificación.');
      }
    } catch (err: any) {
      setError(authErrorMessage(err));
      if (authState === 'login') {
        form.setValue('password', '');
        form.clearErrors('password');
        form.setFocus('password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const role = (form.getValues('role') as UserRole) || 'student';
      await onGoogleSignIn(role);
    } catch (err: any) {
      setError(authErrorMessage(err));
    } finally {
      setIsLoading(false);
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
              We've sent a verification link to {form.getValues('email') || 'your email address'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Please check your email and click the verification link to complete your registration.
            </div>
            <Button onClick={() => onAuthStateChange('login')} variant="outline" className="w-full">
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
            {!isFirebaseConfigured && (
              <Alert variant="destructive">
                <AlertDescription>
                  Firebase is not configured. Please add your credentials to the .env file (see SETUP.md).
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {...form.register('name')}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{(form.formState.errors as AnyValues).name?.message}</p>
                  )}
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
                    {...form.register('email')}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{(form.formState.errors as AnyValues).email?.message}</p>
                )}
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
                      {...form.register('password')}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{(form.formState.errors as AnyValues).password?.message}</p>
                  )}
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
                      {...form.register('confirmPassword')}
                    />
                  </div>
                  {(form.formState.errors as AnyValues).confirmPassword && (
                    <p className="text-sm text-red-500">
                      {(form.formState.errors as AnyValues).confirmPassword?.message}
                    </p>
                  )}
                </div>
              )}

              {authState === 'login' && (
                <div className="space-y-2">
                  <Label htmlFor="role">Login as</Label>
                  <Select
                    value={form.watch('role')}
                    onValueChange={(value: UserRole) => form.setValue('role', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !isFirebaseConfigured}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authState === 'login' && 'Sign In'}
                {authState === 'register' && 'Create Account'}
                {authState === 'forgot-password' && 'Send Reset Link'}
              </Button>

              {authState !== 'forgot-password' && (
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
                    disabled={isLoading || !isFirebaseConfigured}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Google
                  </Button>
                </>
              )}
            </form>

            <div className="text-center space-y-2">
              {authState === 'login' ? (
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
              ) : (
                (authState === 'register' || authState === 'forgot-password') && (
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
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
