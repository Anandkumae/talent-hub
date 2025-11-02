
'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate, createUserInFirestore } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const [socialError, setSocialError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      if (user && firestore) {
        // Ensure user document is created before redirecting
        await createUserInFirestore(user);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'Admin' || userData.role === 'HR' || userData.role === 'Manager') {
            router.push('/dashboard');
          } else {
            router.push('/my-applications');
          }
        } else {
          // If user doc still doesn't exist, default to non-admin view
          // This might happen if firestore write is slow
          router.push('/my-applications');
        }
      }
    };

    if (!isUserLoading) {
      checkUserRoleAndRedirect();
    }
  }, [user, isUserLoading, router, firestore]);

  const onSocialLogin = async (providerId: 'google' | 'github' | 'twitter') => {
    if (!auth) {
        setSocialError('Authentication service is not available. Please try again later.');
        return;
    }
    setSocialError(null);
    let provider;
    switch (providerId) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'github':
        provider = new GithubAuthProvider();
        break;
      case 'twitter':
        provider = new TwitterAuthProvider();
        break;
      default:
        setSocialError('Invalid sign-in provider.');
        return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserInFirestore(result.user);
      // onAuthStateChanged in the provider will handle the redirect via useEffect
    } catch (error: any) {
      console.error('Social Sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setSocialError('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setSocialError('An account already exists with the same email address but different sign-in credentials.');
      } else {
        setSocialError(`Sign-in with ${providerId} failed. Please try again.`);
      }
    }
  };

  const finalErrorMessage = errorMessage || socialError;

  if (isUserLoading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <div className="animate-pulse">Loading...</div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center bg-primary/10 text-primary rounded-lg p-3 mb-4 w-fit mx-auto">
            <Briefcase className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Internal Talent Hub</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            <LoginButton />
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Forgot password?</Link>
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
             <Button variant="outline" className="w-full" onClick={() => onSocialLogin('google')} suppressHydrationWarning>
               <FaGoogle className="h-4 w-4" />
             </Button>
             <Button variant="outline" className="w-full" onClick={() => onSocialLogin('github')} suppressHydrationWarning>
               <FaGithub className="h-4 w-4" />
             </Button>
             <Button variant="outline" className="w-full" onClick={() => onSocialLogin('twitter')} suppressHydrationWarning>
               <FaTwitter className="h-4 w-4" />
             </Button>
          </div>
            {finalErrorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{finalErrorMessage}</AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending} suppressHydrationWarning>
      {pending ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Log In</>}
    </Button>
  );
}
