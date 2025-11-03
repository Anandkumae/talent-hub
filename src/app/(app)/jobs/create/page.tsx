'use client';

import React from 'react';
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

export default function CreateJobPage() {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
  
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Create New Job Posting" />
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Fill out the form below to create a new job posting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" placeholder="Provide a detailed job description..." className="min-h-32" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" placeholder="List key requirements, one per line..." className="min-h-24" />
              <p className="text-sm text-muted-foreground">Enter each requirement on a new line.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/jobs">Cancel</Link>
              </Button>
              <Button>Create Job</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
