import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CandidatesDataTable } from './components/data-table';
import { candidates, jobs } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { columns } from './components/columns';

export default function CandidatesPage({ searchParams }: { searchParams: { search: string } }) {
  const data = candidates.map(c => ({
    ...c,
    jobTitle: jobs.find(j => j.id === c.jobId)?.title || 'N/A',
  }));

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
