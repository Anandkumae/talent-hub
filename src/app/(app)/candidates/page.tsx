
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { CandidatesDataTable } from './components/data-table';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { columns } from './components/columns';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Candidate, Job, User as UserData } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CandidatesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userData, isLoading: isUserDocLoading } = useDoc<UserData>(userDocRef);
  const userRole = userData?.role;
  const canListCandidates = userRole === 'Admin' || userRole === 'HR';

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore || !canListCandidates) return null;
    return query(collection(firestore, 'candidates'));
  }, [firestore, canListCandidates]);

  const { data: candidates, isLoading: areCandidatesLoading } = useCollection<Candidate>(candidatesQuery);

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'));
  }, [firestore]);
  const { data: jobs, isLoading: areJobsLoading } = useCollection<Job>(jobsQuery);
  
  const isLoading = isUserLoading || isUserDocLoading || (canListCandidates && (areCandidatesLoading || areJobsLoading));

  const data = React.useMemo(() => {
    if (!candidates || !jobs) return [];
    return candidates.map(c => {
      let appliedAtDate;
      if (c.appliedAt && typeof c.appliedAt.toDate === 'function') {
        appliedAtDate = c.appliedAt.toDate();
      } else if (c.appliedAt) {
        appliedAtDate = new Date(c.appliedAt);
      } else {
        appliedAtDate = new Date();
      }
      return {
        ...c,
        jobTitle: jobs.find(j => j.id === c.jobId)?.title || 'N/A',
        appliedAt: !isNaN(appliedAtDate.getTime()) ? appliedAtDate.toISOString() : new Date().toISOString(),
      };
    });
  }, [candidates, jobs]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Candidates">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-8 sm:w-[300px]"/>
          </div>
        </PageHeader>
        <div className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </>
    )
  }

  if (!canListCandidates && !isUserLoading && !isUserDocLoading) {
     return (
       <>
         <PageHeader title="Candidates" />
         <Alert>
           <Users className="h-4 w-4" />
           <AlertTitle>Access Denied</AlertTitle>
           <AlertDescription>
             You do not have permission to view the list of all candidates. This page is for Admin and HR personnel only.
           </AlertDescription>
         </Alert>
       </>
     );
  }

  return (
    <>
      <PageHeader title="Candidates">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search candidates..." className="pl-8 sm:w-[300px]" defaultValue={search}/>
        </div>
      </PageHeader>
      <CandidatesDataTable columns={columns} data={data} search={search} />
    </>
  );
}
