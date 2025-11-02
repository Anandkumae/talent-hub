
// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';


export async function createUserInFirestore(user: User) {
  const { firestore } = initializeFirebase();
  if (!user || !firestore) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // New user, create a document for them
    const { uid, email, displayName } = user;
    const isAdmin = email === 'ramashankarsingh841@gmail.com';

    try {
      await setDoc(userRef, {
        id: uid,
        name: displayName || email,
        email: email,
        role: isAdmin ? 'Admin' : 'User',
        department: 'N/A',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating user document:", error);
      // We might want to handle this more gracefully
    }
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const { auth } = initializeFirebase();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createUserInFirestore(userCredential.user);
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
