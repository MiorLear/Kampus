import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Logo } from '../Logo';
import { Mail, Lock, User, CheckCircle, Loader2, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { AuthService, UserRole } from '../../services/auth.service';
import { toast } from 'sonner';
import { Chrome } from 'lucide-react';

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
      // The useAuth hook will detect the auth state change via onAuthStateChanged
      // App.tsx will automatically redirect to the dashboard when user is available
      // No need to manually redirect - React state will handle it
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await AuthService.loginWithGoogle();
      toast.success('Login successful!');
      // The useAuth hook will detect the auth state change via onAuthStateChanged
      // App.tsx will automatically redirect to the dashboard when user is available
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      toast.error(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    // If password is not available, we need to ask for it
    if (!formData.password) {
      setError('Please enter your password to resend the verification email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await AuthService.resendVerificationEmail(formData.email, formData.password);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
      toast.error(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (authState === 'email-verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="border-2 border-blue-100 shadow-xl overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                  <Mail className="h-20 w-20 relative z-10 animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center text-white mb-2">
                Verifica tu correo electrónico
              </CardTitle>
              <CardDescription className="text-center text-blue-100 mt-2">
                Hemos enviado un enlace de verificación a
              </CardDescription>
              <div className="text-center mt-3">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-lg inline-block">
                  {formData.email}
                </span>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Instrucciones con iconos */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 mt-0.5">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Revisa tu bandeja de entrada
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Haz clic en el enlace de verificación que enviamos a tu correo para activar tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex-shrink-0 mt-0.5">
                    <Mail className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      ¿No encuentras el correo?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Revisa tu carpeta de <strong>spam</strong> o <strong>correo no deseado</strong>. 
                      El correo puede tardar unos minutos en llegar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex-shrink-0 mt-0.5">
                    <Lock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Importante
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      No podrás iniciar sesión hasta que verifiques tu correo electrónico.
                    </p>
                  </div>
                </div>
              </div>

              {/* Errores */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo de contraseña para reenvío */}
              {!formData.password && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label htmlFor="resend-password" className="text-sm font-medium text-gray-700">
                    ¿No recibiste el correo? Ingresa tu contraseña para reenviarlo
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resend-password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      className="pl-10 bg-white"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleResendVerification}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading || !formData.password}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reenviar correo de verificación
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, password: '' }));
                    onAuthStateChange('login');
                  }} 
                  variant="outline" 
                  className="w-full border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </div>

              {/* Información adicional */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  El enlace de verificación expira en 1 hora. 
                  Si necesitas ayuda, contacta al soporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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

            {authState !== 'forgot-password' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Chrome className="mr-2 h-4 w-4" />
                  )}
                  {authState === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
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
