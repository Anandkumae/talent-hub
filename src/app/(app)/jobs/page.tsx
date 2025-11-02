import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { JobsDataTable } from './components/data-table';
import { jobs } from '@/lib/data';

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Job Postings">
        <Button asChild>
          <Link href="/jobs/create">
            <PlusCircle className="mr-2" />
            Create Job
          </Link>
        </Button>
      </PageHeader>
      <JobsDataTable data={jobs} />
    </>
  );
}
