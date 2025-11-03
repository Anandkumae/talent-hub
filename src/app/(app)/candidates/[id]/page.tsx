'use client';
import { candidates, jobs } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, FileText, Briefcase } from 'lucide-react';
import UpdateStatus from './components/update-status';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = candidates.find(c => c.id === params.id);
  
  if (!candidate) {
    notFound();
  }

  const job = jobs.find(j => j.id === candidate.jobId);
  const appliedDate = new Date(candidate.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

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
                  <Briefcase className="h-4 w-4" /> Applied for {job?.title}
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
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Applied on {appliedDate}</p>
              <UpdateStatus currentStatus={candidate.status} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
                <Button className="w-full" asChild>
                  <Link href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2" />
                    View Resume
                  </Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
