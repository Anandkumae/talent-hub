import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { JobsDataTable } from './components/data-table';
import { jobs } from '@/lib/data';
import { columns } from './components/columns';
import { Input } from '@/components/ui/input';

export default function JobsPage({ searchParams }: { searchParams: { search: string } }) {
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
      <JobsDataTable columns={columns} data={jobs} search={searchParams.search} />
    </>
  );
}
