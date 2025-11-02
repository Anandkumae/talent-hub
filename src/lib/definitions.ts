export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'HR' | 'Manager' | 'Candidate';
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
  postedAt: string;
};

export type CandidateStatus = 'Applied' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected';

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  resumeUrl: string;
  jobId: string;
  status: CandidateStatus;
  appliedAt: string;
};
