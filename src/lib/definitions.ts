export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'HR' | 'Manager' | 'User';
  avatarUrl: string;
};

export type JobStatus = 'Open' | 'Closed';

export type Job = {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  status: JobStatus;
  postedAt: any; // Allow for Firestore Timestamp
  postedBy: string;
};

export type CandidateStatus = 'Applied' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected';

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  // This will now be a path to a file in Firebase Storage, not a Data URL
  resumeUrl: string; 
  jobId: string;
  userId: string;
  status: CandidateStatus;
  // This can be a Firestore Timestamp or a string
  appliedAt: any; 
};
