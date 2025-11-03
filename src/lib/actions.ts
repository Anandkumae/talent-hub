// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { initializeFirebaseOnServer } from '@/firebase/server';


export async function createUserInFirestore(user: User) {
  const { firestore } = initializeFirebase();
  if (!user || !firestore) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // New user, create a document for them
    const { uid, email, displayName, phoneNumber } = user;
    const isAdmin = email === 'ramashankarsingh841@gmail.com';
    const name = displayName || (email ? email.split('@')[0] : '') || phoneNumber || 'New User';

    try {
      await setDoc(userRef, {
        id: uid,
        name: name,
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
