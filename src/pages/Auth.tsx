import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { z } from 'zod';
import { AUTH_PROVIDERS_ENABLED } from '@/config/authConfig';

type AuthMode = 'email-password';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [mode] = useState<AuthMode>('email-password');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Email/Password Sign In
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    
    const newErrors: { email?: string; password?: string } = {};
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Try signing in.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created! Check your email to confirm.');
        navigate('/');
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  // Email/Password Form (only visible form now)
  const renderEmailPasswordMode = () => (
    <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          className={`h-12 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          className={`h-12 rounded-xl ${errors.password ? 'border-destructive' : ''}`}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSignUp ? (
          'Create Account'
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-primary hover:underline"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-4xl">🐱</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isSignUp 
                ? 'Start your cozy habit journey' 
                : 'Sign in to continue your journey'}
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="ios-card p-6">
          {renderEmailPasswordMode()}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          <p>
            By continuing, you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-primary hover:underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button onClick={() => navigate('/privacy')} className="text-primary hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
