'use client';

import React from 'react';
import { Briefcase, Users, CheckCircle, BarChart } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from './components/stat-card';
import { JobsByDepartmentChart } from './components/jobs-by-department-chart';
import { CandidatesByStatusChart } from './components/candidates-by-status-chart';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Job, Candidate } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const firestore = useFirestore();

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'jobs');
  }, [firestore]);
  const { data: jobs, isLoading: jobsLoading } = useCollection<Job>(jobsQuery);

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'candidates');
  }, [firestore]);
  const { data: candidates, isLoading: candidatesLoading } = useCollection<Candidate>(candidatesQuery);

  const isLoading = jobsLoading || candidatesLoading;
  
  const totalJobs = jobs?.length || 0;
  const totalCandidates = candidates?.length || 0;
  const hiredCandidates = candidates?.filter(c => c.status === 'Hired').length || 0;
  const openJobs = jobs?.filter(j => j.status === 'Open').length || 0;
  
  if (isLoading) {
    return (
        <>
            <PageHeader title="Dashboard" />
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
             </div>
             <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="lg:col-span-4 h-96 w-full" />
                <Skeleton className="lg:col-span-3 h-96 w-full" />
             </div>
        </>
    )
  }

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Jobs" value={totalJobs} icon={Briefcase} />
        <StatCard title="Total Candidates" value={totalCandidates} icon={Users} />
        <StatCard title="Hired Candidates" value={hiredCandidates} icon={CheckCircle} />
        <StatCard title="Open Positions" value={openJobs} icon={BarChart} />
      </div>
      <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Jobs by Department</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <JobsByDepartmentChart jobs={jobs || []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Candidates by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidatesByStatusChart candidates={candidates || []} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
