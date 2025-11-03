import type { Job, Candidate } from './definitions';

// This data is now used as a fallback or for initial structure,
// but the primary data source will be Firestore.

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    description: 'We are looking for a an experienced Frontend Engineer to join our team...',
    requirements: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    status: 'Open',
    postedAt: '2024-05-01',
    postedBy: 'admin-user-id',
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    description: 'We are seeking a Product Manager to own the roadmap for our core product...',
    requirements: ['Agile', 'JIRA', 'Market Research'],
    status: 'Open',
    postedAt: '2024-05-10',
    postedBy: 'admin-user-id',
  },
];

export const candidates: Candidate[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '123-456-7890',
    skills: ['React', 'TypeScript', 'Node.js'],
    resumeUrl: '/resume-placeholder.pdf',
    jobId: '1',
    userId: 'user-alice-id',
    status: 'Shortlisted',
    appliedAt: { seconds: 1672617600, nanoseconds: 0 },
  },
];
