// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, signInWithPopup } from 'firebase/auth';
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

export async function handleSignInWithProvider(providerId: 'google' | 'github' | 'twitter') {
  'use client';
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
      return { error: 'Invalid provider' };
  }

  try {
    const { auth } = initializeFirebase();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle the redirect on success
    return {};
  } catch (error) {
    console.error('Sign-in error:', error);
    // This error will be caught client-side, we can't redirect from here.
    // The page will handle showing an error.
    if (error.code === 'auth/popup-closed-by-user') {
      return { error: 'Sign-in cancelled. Please try again.' };
    }
    return { error: `Sign-in with ${providerId} failed. Please try again.`};
  }
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
