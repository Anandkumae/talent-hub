
// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';


export async function createUserInFirestore(user: User) {
  const { firestore } = initializeFirebase();
  if (!user || !firestore) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // New user, create a document for them
    const { uid, email, displayName, phoneNumber } = user;
    const isAdmin = email === 'ramashankarsingh841@gmail.com';
    const name = displayName || email?.split('@')[0] || phoneNumber;

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


const ApplySchema = z.object({
  jobId: z.string(),
  userId: z.string(),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  resume: z.any(), // For now, we'll just check that a file is present
});

export type ApplyState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    resume?: string[];
    jobId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function applyForJob(prevState: ApplyState, formData: FormData) {
  const { firestore } = initializeFirebase();
  const validatedFields = ApplySchema.safeParse({
    jobId: formData.get('jobId'),
    userId: formData.get('userId'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    resume: formData.get('resume'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input. Please check the fields.',
      success: false,
    };
  }
  
  const { jobId, userId, name, email, phone, resume } = validatedFields.data;

  if (!resume || resume.size === 0) {
    return {
       errors: { resume: ['Resume is required.'] },
       message: 'Please upload your resume.',
       success: false,
    }
  }

  try {
    // In a real app, you would upload the resume to Firebase Storage
    // and get a download URL. For now, we'll use a placeholder.
    const resumeUrl = `/resumes/${userId}/${resume.name}`;

    await addDoc(collection(firestore, 'candidates'), {
      jobId,
      userId,
      name,
      email,
      phone,
      resumeUrl,
      skills: [], // Skills could be parsed from resume in a more advanced version
      status: 'Applied',
      appliedAt: serverTimestamp(),
    });

    return { message: 'Application submitted successfully!', success: true, errors: {} };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { message: 'Failed to submit application. Please try again.', success: false, errors: {} };
  }
}
