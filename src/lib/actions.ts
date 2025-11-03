// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { initializeFirebaseOnServer } from '@/firebase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';


export async function createUserInFirestore(user: User) {
  const { firestore } = initializeFirebase();
  if (!user || !firestore) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  // Only create the document if it doesn't already exist.
  if (!userDoc.exists()) {
    const { uid, email, displayName, phoneNumber } = user;
    
    // Assign 'Admin' role if the email matches, otherwise default to 'User'.
    const isAdmin = email === 'ramashankarsingh841@gmail.com';
    const role = isAdmin ? 'Admin' : 'User';

    // Create a sensible default name if displayName is not available.
    const name = displayName || (email ? email.split('@')[0] : '') || phoneNumber || 'New User';

    try {
      await setDoc(userRef, {
        id: uid,
        name: name,
        email: email || null,
        phone: phoneNumber || null,
        role: role,
        department: 'N/A', // Default department
        createdAt: serverTimestamp(),
      });
      console.log(`Created user document for ${uid} with role: ${role}`);
    } catch (error) {
      console.error("Error creating user document in Firestore:", error);
      // This error should be handled, perhaps by logging to a more robust service.
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
    // Ensure user document exists after sign-in
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

const JobSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  department: z.string().min(1, 'Department is required.'),
  description: z.string().min(1, 'Description is required.'),
  requirements: z.string().min(1, 'Requirements are required.'),
  postedBy: z.string(), // User ID
});

export type CreateJobState = {
  errors?: {
    title?: string[];
    department?: string[];
    description?: string[];
    requirements?: string[];
  };
  message?: string | null;
};

export async function createJob(userId: string, prevState: CreateJobState, formData: FormData) {
  const validatedFields = JobSchema.safeParse({
    title: formData.get('title'),
    department: formData.get('department'),
    description: formData.get('description'),
    requirements: formData.get('requirements'),
    postedBy: userId,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data. Please check the form and try again.',
    };
  }

  const { title, department, description, requirements, postedBy } = validatedFields.data;
  const requirementsArray = requirements.split('\n').filter(req => req.trim() !== '');

  const { firestore } = await initializeFirebaseOnServer();

  try {
    const jobsCollection = collection(firestore, 'jobs');
    await addDoc(jobsCollection, {
      title,
      department,
      description,
      requirements: requirementsArray,
      postedBy,
      status: 'Open',
      postedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return { message: 'Failed to create job posting. Please try again.' };
  }

  revalidatePath('/jobs');
  redirect('/jobs');
}