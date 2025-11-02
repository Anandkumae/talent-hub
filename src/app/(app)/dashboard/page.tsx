import React from 'react';
import { Briefcase, Users, CheckCircle, BarChart } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from './components/stat-card';
import { JobsByDepartmentChart } from './components/jobs-by-department-chart';
import { CandidatesByStatusChart } from './components/candidates-by-status-chart';
import { jobs, candidates } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const totalJobs = jobs.length;
  const totalCandidates = candidates.length;
  const hiredCandidates = candidates.filter(c => c.status === 'Hired').length;
  const openJobs = jobs.filter(j => j.status === 'Open').length;

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
            <JobsByDepartmentChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Candidates by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidatesByStatusChart />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
