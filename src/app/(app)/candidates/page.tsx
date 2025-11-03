'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CandidatesDataTable } from './components/data-table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { columns } from './components/columns';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Candidate, User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users } from 'lucide-react';


export default function CandidatesPage({ searchParams }: { searchParams: { search: string } }) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userData, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);
  const userRole = userData?.role;
  const canListCandidates = userRole === 'Admin' || userRole === 'HR';

  const candidatesQuery = useMemoFirebase(() => {
    // Only construct the query if the user is an admin/HR
    if (!firestore || !canListCandidates) return null;
    return query(collection(firestore, 'candidates'));
  }, [firestore, canListCandidates]);

  const { data: candidates, isLoading: areCandidatesLoading, error } = useCollection<Candidate>(candidatesQuery);

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'));
  }, [firestore]);
  const { data: jobs, isLoading: areJobsLoading } = useCollection<any>(jobsQuery);
  
  const isLoading = isUserLoading || isUserDocLoading || areCandidatesLoading || areJobsLoading;

  const data = React.useMemo(() => {
    if (!candidates || !jobs) return [];
    return candidates.map(c => {
      const appliedAtDate = c.appliedAt?.seconds ? new Date(c.appliedAt.seconds * 1000) : new Date();
      return {
        ...c,
        jobTitle: jobs.find(j => j.id === c.jobId)?.title || 'N/A',
        appliedAt: appliedAtDate.toISOString(),
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

  // If the user is not an admin, show a message instead of the table.
  // We pass an empty data array to the table component.
  if (!canListCandidates && !isUserLoading) {
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
         <div className="mt-4">
            <CandidatesDataTable columns={columns} data={[]} search={searchParams.search} />
         </div>
       </>
     );
  }

  return (
    <>
      <PageHeader title="Candidates">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search candidates..." className="pl-8 sm:w-[300px]" defaultValue={searchParams.search}/>
        </div>
      </PageHeader>
      <CandidatesDataTable columns={columns} data={data} search={searchParams.search} />
    </>
  );
}
