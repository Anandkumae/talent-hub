
'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate, createUserInFirestore } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, LogIn, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, type Auth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user && firestore) {
      const checkUserRoleAndRedirect = async () => {
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
          router.push('/my-applications');
        }
      };

      if (!isUserLoading) {
        checkUserRoleAndRedirect();
      }
    }
  }, [user, isUserLoading, router, firestore]);

  const onSocialLogin = async (providerId: 'google') => {
    if (!auth) {
        setAuthError('Authentication service is not available. Please try again later.');
        return;
    }
    setAuthError(null);
    let provider;
    switch (providerId) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      default:
        setAuthError('Invalid sign-in provider.');
        return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserInFirestore(result.user);
    } catch (error: any) {
      console.error('Social Sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setAuthError('An account already exists with the same email address but different sign-in credentials.');
      } else {
        setAuthError(`Sign-in with ${providerId} failed. Please try again.`);
      }
    }
  };

  const setupRecaptcha = () => {
    if (!auth) return;
    // Clean up previous verifier if it exists
    if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
    }
    
    if (recaptchaContainerRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }
  };

  const handlePhoneSignIn = async () => {
    setAuthError(null);
    if (!auth) {
      setAuthError('Authentication service not available.');
      return;
    }
    
    // Setup reCAPTCHA on demand
    setupRecaptcha();

    const verifier = recaptchaVerifierRef.current;
    if (!verifier) {
      setAuthError('reCAPTCHA not initialized. Please wait a moment and try again.');
      return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (error: any)
    {
      console.error('Phone sign-in error:', error);
      setAuthError('Failed to send OTP. Please check the phone number and try again.');
    }
  };

  const handleOtpVerify = async () => {
    setAuthError(null);
    if (!confirmationResult) {
      setAuthError('OTP not sent yet.');
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      await createUserInFirestore(result.user);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      if (error.code === 'auth/code-expired') {
        setAuthError('Verification code has expired. Please send a new one.');
      } else {
        setAuthError('Failed to verify OTP. Please try again.');
      }
    }
  };


  const finalErrorMessage = errorMessage || authError;

  if (isUserLoading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <div className="animate-pulse">Loading...</div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center bg-primary/10 text-primary rounded-lg p-3 mb-4 w-fit mx-auto">
            <Briefcase className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Internal Talent Hub</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
            </form>

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
            
            {!otpSent ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+1 555-555-5555" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                  <Button variant="outline" onClick={handlePhoneSignIn}>
                    <Phone className="mr-2 h-4 w-4" /> Send Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex gap-2">
                  <Input 
                    id="otp" 
                    name="otp" 
                    type="text" 
                    placeholder="Enter OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required 
                  />
                  <Button onClick={handleOtpVerify}>Verify</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sent OTP to {phone}. <Button variant="link" className="p-0 h-auto" onClick={() => setOtpSent(false)}>Change number?</Button>
                </p>
              </div>
            )}
            
            <Button variant="outline" className="w-full" onClick={() => onSocialLogin('google')}>
              <FaGoogle className="mr-2 h-4 w-4" /> Sign in with Google
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
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Log In with Email</>}
    </Button>
  );
}
