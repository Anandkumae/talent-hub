'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { JobsDataTable } from './components/data-table';
import { columns } from './components/columns';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Job } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';


export default function JobsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const firestore = useFirestore();

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'));
  }, [firestore]);

  const { data: jobs, isLoading } = useCollection<Job>(jobsQuery);

  const data = React.useMemo(() => {
    if (!jobs) return [];
    return jobs.map(job => {
        const postedAtDate = job.postedAt?.seconds ? new Date(job.postedAt.seconds * 1000) : new Date();
        return {
            ...job,
            postedAt: postedAtDate.toISOString(),
        }
    })
  }, [jobs]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Job Postings">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." className="pl-8 sm:w-[300px]"/>
            </div>
            <Button asChild>
              <Link href="/jobs/create">
                <PlusCircle className="mr-2" />
                Create Job
              </Link>
            </Button>
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
            <Input placeholder="Search jobs..." className="pl-8 sm:w-[300px]" defaultValue={search}/>
          </div>
          <Button asChild>
            <Link href="/jobs/create">
              <PlusCircle className="mr-2" />
              Create Job
            </Link>
          </Button>
        </div>
      </PageHeader>
      <JobsDataTable columns={columns} data={data} search={search} />
    </>
  );
}
