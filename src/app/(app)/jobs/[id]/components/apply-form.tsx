'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { applyForJob, type ApplyState } from '@/lib/actions';
import type { User } from 'firebase/auth';
import type { Job } from '@/lib/definitions';
import { Upload, Send, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const initialState: ApplyState = {
  message: null,
  errors: {},
  success: false,
};

export function ApplyForm({ user, job, setOpen }: { user: User; job: Job; setOpen: (open: boolean) => void }) {
  const [state, dispatch] = useActionState(applyForJob, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      // Close dialog on successful submission
      const timer = setTimeout(() => {
        setOpen(false);
      }, 2000); // Wait 2 seconds to show success message
      return () => clearTimeout(timer);
    }
  }, [state.success, setOpen]);
  
  if (state.success) {
     return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
            <p className="text-sm text-muted-foreground">You will be redirected shortly.</p>
        </div>
    );
  }

  return (
    <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
      <input type="hidden" name="jobId" value={job.id} />
      <input type="hidden" name="userId" value={user.uid} />
      
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" defaultValue={user.displayName ?? ''} />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email ?? ''} />
         {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={user.phoneNumber ?? ''} placeholder="Your phone number" />
        {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="resume">Resume (PDF)</Label>
        <Input id="resume" name="resume" type="file" accept=".pdf" />
        {state.errors?.resume && <p className="text-sm text-destructive">{state.errors.resume[0]}</p>}
      </div>

      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Submit Application
        </>
      )}
    </Button>
  );
}
