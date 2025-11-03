'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Search } from 'lucide-react';
import { JobsDataTable } from './components/data-table';
import { columns } from './components/columns';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Job } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateJobButton } from './components/create-job-button';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const firestore = useFirestore();
  
  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'));
  }, [firestore]);

  const { data: jobs, isLoading: areJobsLoading } = useCollection<Job>(jobsQuery);

  const data = React.useMemo(() => {
    if (!jobs) return [];
    return jobs.map(job => {
      let postedAtDate;
      if (job.postedAt && typeof job.postedAt.toDate === 'function') {
        // Firestore Timestamp
        postedAtDate = job.postedAt.toDate();
      } else if (job.postedAt) {
        // String date
        postedAtDate = new Date(job.postedAt);
      } else {
        postedAtDate = new Date();
      }
      return {
          ...job,
          postedAt: postedAtDate.toISOString(),
      }
    })
  }, [jobs]);

  if (areJobsLoading) {
    return (
      <>
        <PageHeader title="Job Postings">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." className="pl-8 sm:w-[300px]"/>
            </div>
             <Skeleton className="h-10 w-32" />
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

  return (
    <>
      <PageHeader title="Job Postings">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-8 sm:w-[300px]" 
              defaultValue={search}
            />
          </div>
          <CreateJobButton />
        </div>
      </PageHeader>
      <JobsDataTable columns={columns} data={data} search={search} />
    </>
  );
}
