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
    // Redirect is handled by the page's effect hook
  } catch (error) {
     if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
          default:
            return `An error occurred: ${error.message}`;
        }
    }
    return 'An unexpected error occurred. Please try again.';
  }
  // This redirect will be handled by the effect on the page
  // redirect('/dashboard');
}


export async function handleSignInWithProvider(providerId: 'google' | 'github' | 'twitter') {
  // This function is now designed to be called from the client,
  // but since it's in a 'use server' file, we need a way for the client to trigger it
  // without it executing fully on the server. The actual sign-in popup
  // must happen on the client. The page itself will handle this.
  // This function can be a placeholder or removed if client handles everything.
  // For now, we will leave it but the logic is moved to the client component.
  return { error: 'This action should be handled on the client.' };
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
