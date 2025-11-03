'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CandidatesDataTable } from './components/data-table';
import { jobs } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { columns } from './components/columns';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Candidate } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function CandidatesPage({ searchParams }: { searchParams: { search: string } }) {
  const firestore = useFirestore();

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'candidates'));
  }, [firestore]);

  const { data: candidates, isLoading } = useCollection<Candidate>(candidatesQuery);

  const data = React.useMemo(() => {
    if (!candidates) return [];
    return candidates.map(c => {
      const appliedAtDate = c.appliedAt?.seconds ? new Date(c.appliedAt.seconds * 1000) : null;
      return {
        ...c,
        jobTitle: jobs.find(j => j.id === c.jobId)?.title || 'N/A',
        appliedAt: appliedAtDate ? appliedAtDate.toISOString() : new Date().toISOString(),
      };
    });
  }, [candidates]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Candidates">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-8 sm:w-[300px]"/>
          </div>
        </PageHeader>
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Candidates">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search candidates..." className="pl-8 sm:w-[300px]"/>
        </div>
      </PageHeader>
      <CandidatesDataTable columns={columns} data={data} search={searchParams.search} />
    </>
  );
}
