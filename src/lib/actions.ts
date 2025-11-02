// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const { auth } = initializeFirebase();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
     if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            return 'Invalid email address. Please try again.';
          case 'auth/wrong-password':
            return 'Invalid password. Please try again.';
          case 'auth/invalid-credential':
            return 'Invalid credentials. Please try again.';
          default:
            return `An error occurred: ${error.message}`;
        }
    }
    return 'An unexpected error occurred. Please try again.';
  }
  redirect('/dashboard');
}

export async function signInWithGoogle() {
  try {
    const { auth } = initializeFirebase();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google sign-in error:', error);
    // The user might close the popup, which can be an error.
    // We can redirect them back to the login page with an error message.
    return redirect('/login?error=google-signin-failed');
  }
  redirect('/dashboard');
}


const MatcherSchema = z.object({
  jobDescription: z.string().min(100, 'Job description must be at least 100 characters.'),
  resumeText: z.string().min(100, 'Resume text must be at least 100 characters.'),
});

export type MatcherState = {
  errors?: {
    jobDescription?: string[];
    resumeText?: string[];
  };
  message?: string | null;
  matchScore?: number | null;
};

export async function getMatchScore(prevState: MatcherState, formData: FormData) {
  const validatedFields = MatcherSchema.safeParse({
    jobDescription: formData.get('jobDescription'),
    resumeText: formData.get('resumeText'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input. Please check the fields.',
      matchScore: null,
    };
  }

  try {
    const { jobDescription, resumeText } = validatedFields.data;
    const result = await aiResumeMatcher({ jobDescription, resumeText });
    return {
      message: 'Successfully matched resume.',
      matchScore: result.matchScore,
      errors: {},
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred while matching the resume. Please try again.',
      matchScore: null,
      errors: {},
    };
  }
}
