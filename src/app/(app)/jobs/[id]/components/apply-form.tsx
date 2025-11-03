'use client';

import { useState, useRef, FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { User } from 'firebase/auth';
import type { Job } from '@/lib/definitions';
import { Send, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { z } from 'zod';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const ApplySchema = z.object({
  jobId: z.string(),
  userId: z.string(),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  resume: z
    .instanceof(File)
    .refine(file => file.size > 0, 'Resume is required.')
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `Max file size is 1MB.`
    ),
});

type FormState = {
  errors: Record<string, string[]> | null;
  message: string | null;
  success: boolean;
};

const initialState: FormState = {
  errors: null,
  message: null,
  success: false,
};

export function ApplyForm({ user, job, setOpen }: { user: User; job: Job; setOpen: (open: boolean) => void }) {
  const [state, setState] = useState<FormState>(initialState);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { firestore, firebaseApp } = useFirebase();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setState(initialState);
    
    if (!firestore || !firebaseApp) {
      setState({ success: false, message: 'Database service is not available.', errors: null });
      setPending(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const resumeFile = formData.get('resume');

    const validatedFields = ApplySchema.safeParse({
      jobId: job.id,
      userId: user.uid,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      resume: resumeFile,
    });

    if (!validatedFields.success) {
      setState({
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid input. Please check the fields.',
        success: false,
      });
      setPending(false);
      return;
    }
    
    const { jobId, userId, name, email, phone, resume } = validatedFields.data;

    try {
      const storage = getStorage(firebaseApp);
      const storagePath = `resumes/${userId}/${resume.name}`;
      
      // 1. Add candidate document to Firestore WITHOUT waiting
      const candidatesCollection = collection(firestore, 'candidates');
      const docPromise = addDocumentNonBlocking(candidatesCollection, {
        jobId,
        userId,
        name,
        email,
        phone,
        resumeUrl: storagePath, // Optimistically store the future path
        skills: [],
        status: 'Applied',
        appliedAt: serverTimestamp(),
      });
      
      // 2. Show success and close modal immediately
      setState({ message: 'Application submitted successfully!', success: true, errors: null });
      setTimeout(() => {
        setOpen(false);
      }, 2000);

      // 3. Upload resume to Firebase Storage in the background
      const storageRef = ref(storage, storagePath);
      uploadBytes(storageRef, resume).then(() => {
        console.log('Resume uploaded successfully in the background.');
      }).catch(uploadError => {
        console.error('Background resume upload failed:', uploadError);
        // Here you might want to add more robust error handling,
        // like updating the Firestore document to indicate the upload failed.
      });


    } catch (error) {
      console.error('Error submitting application:', error);
      setState({ message: 'Failed to submit application. Please try again.', success: false, errors: null });
    } finally {
      // The pending state is set to false almost immediately because we don't await.
      setPending(false);
    }
  };
  
  if (state.success) {
     return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
            <p className="text-sm text-muted-foreground">Your application has been received. You can close this window.</p>
        </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
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
        <Label htmlFor="resume">Resume (PDF, DOC, DOCX)</Label>
        <Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" />
        <p className="text-sm text-muted-foreground">Max file size: 1 MB.</p>
        {state.errors?.resume && <p className="text-sm text-destructive">{state.errors.resume[0]}</p>}
      </div>

      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

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
    </form>
  );
}
