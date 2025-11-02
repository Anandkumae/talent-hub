'use server';

/**
 * @fileOverview This file defines a Genkit flow for matching candidate resumes to job descriptions and providing a match score.
 *
 * - aiResumeMatcher - A function that accepts a job description and a candidate resume, and returns a match score (out of 100).
 * - AIRecruitMatcherInput - The input type for the aiResumeMatcher function, containing the job description and resume data.
 * - AIRecruitMatcherOutput - The return type for the aiResumeMatcher function, containing the match score.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIRecruitMatcherInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full job description of the job posting.'),
  resumeText: z.string().describe('The full text content of the candidate resume.'),
});
export type AIRecruitMatcherInput = z.infer<typeof AIRecruitMatcherInputSchema>;

const AIRecruitMatcherOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A numerical score (0-100) representing how well the candidate resume matches the job description. Higher score indicates a better match.'
    ),
});
export type AIRecruitMatcherOutput = z.infer<typeof AIRecruitMatcherOutputSchema>;

export async function aiResumeMatcher(input: AIRecruitMatcherInput): Promise<AIRecruitMatcherOutput> {
  return aiResumeMatcherFlow(input);
}

const aiResumeMatcherPrompt = ai.definePrompt({
  name: 'aiResumeMatcherPrompt',
  input: {schema: AIRecruitMatcherInputSchema},
  output: {schema: AIRecruitMatcherOutputSchema},
  prompt: `You are an AI resume matching expert. Given a job description and a candidate's resume, you will determine how well the resume matches the job description.

  Provide a match score between 0 and 100. A higher score indicates a stronger match. Do not explain your reasoning.

  Job Description: {{{jobDescription}}}

  Candidate Resume: {{{resumeText}}}

  Match Score: `,
});

const aiResumeMatcherFlow = ai.defineFlow(
  {
    name: 'aiResumeMatcherFlow',
    inputSchema: AIRecruitMatcherInputSchema,
    outputSchema: AIRecruitMatcherOutputSchema,
  },
  async input => {
    const {output} = await aiResumeMatcherPrompt(input);
    return output!;
  }
);
