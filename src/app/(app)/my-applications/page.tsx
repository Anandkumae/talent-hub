'use client';
import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase, AlertTriangle } from 'lucide-react';
import type { Candidate, Job } from '@/lib/definitions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const statusStyles: Record<Candidate['status'], string> = {
    Applied: 'bg-blue-500/20 text-blue-700 border-blue-500/20 hover:bg-blue-500/30',
    Shortlisted: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/30',
    Interviewed: 'bg-purple-500/20 text-purple-700 border-purple-500/20 hover:bg-purple-500/30',
    Hired: 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30',
    Rejected: 'bg-red-500/20 text-red-700 border-red-500/20 hover:bg-red-500/30',
};

export default function MyApplicationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'candidates'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: applications, isLoading, error } = useCollection<Candidate>(candidatesQuery);

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'));
  }, [firestore]);
  const { data: jobs, isLoading: areJobsLoading } = useCollection<Job>(jobsQuery);

  const getJobTitle = (jobId: string) => {
    if (areJobsLoading) return 'Loading...';
    const job = jobs?.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});
  }

  const overallLoading = isLoading || areJobsLoading;

  return (
    <>
      <PageHeader title="My Applications" />
      
      {overallLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Applications</AlertTitle>
            <AlertDescription>
                Could not load your applications. This might be due to a permission issue. Please contact support if this persists.
                <pre className="mt-2 text-xs bg-muted p-2 rounded">{error.message}</pre>
            </AlertDescription>
        </Alert>
      )}

      {!overallLoading && !error && (
        <div className="space-y-4">
          {applications && applications.length > 0 ? (
            applications.map(app => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{getJobTitle(app.jobId)}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        Applied on {formatDate(app.appliedAt)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={statusStyles[app.status]}>
                        {app.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
             <Card className="flex flex-col items-center justify-center p-10 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>No Applications Found</CardTitle>
                <CardDescription className="mt-2">You haven&apos;t applied for any jobs yet.</CardDescription>
                <Button asChild className="mt-4">
                    <Link href="/jobs">Browse Jobs</Link>
                </Button>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
