'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserData } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function CreateJobButton() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<UserData>(userDocRef);

  const isLoading = isUserLoading || (user && isUserDocLoading);

  if (isLoading) {
    return <Skeleton className="h-10 w-32" />;
  }

  const canCreateJobs = user && (userData?.role === 'Admin' || userData?.role === 'HR');

  if (!canCreateJobs) {
    return null;
  }

  return (
    <Button asChild>
      <Link href="/jobs/create">
        <PlusCircle className="mr-2" />
        Create Job
      </Link>
    </Button>
  );
}
