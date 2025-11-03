'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ApplyForm } from './apply-form';
import type { Job } from '@/lib/definitions';

export function ApplyButton({ job }: { job: Job }) {
  const { user, isUserLoading } = useUser();
  const [open, setOpen] = React.useState(false);
  
  if (isUserLoading) {
    return <Button disabled>Loading...</Button>;
  }
  
  if (!user) {
    return <Button disabled>Log in to apply</Button>
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            Please confirm your details and upload your resume to apply.
          </DialogDescription>
        </DialogHeader>
        <ApplyForm user={user} job={job} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
