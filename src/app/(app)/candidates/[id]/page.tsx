'use client';
import { jobs } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import UpdateStatus from './components/update-status';
import { Separator } from '@/components/ui/separator';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Candidate } from '@/lib/definitions';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewResumeButton } from './components/view-resume-button';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const candidateRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'candidates', params.id);
  }, [firestore, params.id]);

  const { data: candidate, isLoading } = useDoc<Candidate>(candidateRef);
  
  if (isLoading) {
    return <PageHeader title="Loading..." />;
  }

  if (!candidate) {
    notFound();
  }

  const job = jobs.find(j => j.id === candidate.jobId);
  const appliedDate = candidate.appliedAt?.seconds ? new Date(candidate.appliedAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A';

  return (
    <>
      <PageHeader title="Candidate Profile" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border">
                 <AvatarImage
                  src={`https://picsum.photos/seed/${candidate.email}/200/200`}
                  alt={candidate.name}
                  data-ai-hint="person face"
                />
                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4" /> Applied for {job?.title || 'Unknown Job'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4"/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              </div>
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <span>Applied on {appliedDate}</span>
              </div>
              <UpdateStatus currentStatus={candidate.status} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
                <ViewResumeButton resumePath={candidate.resumeUrl} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
