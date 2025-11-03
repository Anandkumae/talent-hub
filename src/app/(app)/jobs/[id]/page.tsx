import { jobs } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Building, ListChecks, Info } from 'lucide-react';
import { ApplyButton } from './components/apply-button';
import { Separator } from '@/components/ui/separator';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobs.find(j => j.id === params.id);
  
  if (!job) {
    notFound();
  }
  
  const postedDate = new Date(job.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={job.title}>
        <Badge variant={job.status === 'Open' ? 'default' : 'secondary'} className={job.status === 'Open' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}>
          {job.status}
        </Badge>
      </PageHeader>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{job.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {job.requirements.map((req, index) => <li key={index}>{req}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
               <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Department:</span>
                <span className="text-muted-foreground">{job.department}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Posted On:</span>
                <span className="text-muted-foreground">{postedDate}</span>
              </div>
               <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Status:</span>
                <span className="text-muted-foreground">{job.status}</span>
              </div>
            </CardContent>
          </Card>
          
          {job.status === 'Open' && (
            <Card>
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
                <CardDescription>Ready to take the next step?</CardDescription>
              </CardHeader>
              <CardContent>
                <ApplyButton job={job} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
