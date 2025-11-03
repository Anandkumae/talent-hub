'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { createJob, type CreateJobState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialState: CreateJobState = {
  message: null,
  errors: {},
};

export default function CreateJobPage() {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR'];
  const { user } = useUser();
  const router = useRouter();

  // Bind the userId to the createJob server action
  const createJobWithUserId = createJob.bind(null, user?.uid ?? '');
  const [state, dispatch] = useFormState(createJobWithUserId, initialState);
  
  if (!user) {
    // You can also show a loading spinner while user is being checked
    return (
       <div className="max-w-4xl mx-auto">
        <PageHeader title="Create New Job Posting" />
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You must be logged in and have Admin or HR privileges to create a job.
            </AlertDescription>
        </Alert>
       </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Create New Job Posting" />
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Fill out the form below to create a new job posting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" placeholder="e.g. Senior Frontend Engineer" />
               {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="department">Department</Label>
               <Select name="department">
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
              </Select>
              {state.errors?.department && <p className="text-sm text-destructive">{state.errors.department[0]}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" name="description" placeholder="Provide a detailed job description..." className="min-h-32" />
               {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" placeholder="List key requirements, one per line..." className="min-h-24" />
              <p className="text-sm text-muted-foreground">Enter each requirement on a new line.</p>
              {state.errors?.requirements && <p className="text-sm text-destructive">{state.errors.requirements[0]}</p>}
            </div>
            
            {state.message && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/jobs">Cancel</Link>
              </Button>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" aria-disabled={pending}>
            {pending ? (
                <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
            ) : "Create Job"}
        </Button>
    )
}
