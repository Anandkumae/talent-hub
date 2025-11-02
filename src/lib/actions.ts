// @ts-nocheck
'use server';

import { aiResumeMatcher } from '@/ai/flows/ai-resume-matcher';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Mock authentication
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // In a real app, you'd validate credentials here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('User authenticated');
  } catch (error) {
     if (error.type === 'CredentialsSignin') {
      return 'Invalid credentials.';
    }
    throw error;
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
