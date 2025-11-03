
'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Candidate, User as UserType } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, User as UserIcon, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ViewResumeButton } from '@/app/(app)/candidates/[id]/components/view-resume-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const latestApplicationQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'candidates'),
      where('userId', '==', user.uid),
      orderBy('appliedAt', 'desc'),
      limit(1)
    );
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<UserType>(userDocRef);
  const { data: applicationData, isLoading: isAppLoading } = useCollection<Candidate>(latestApplicationQuery);

  const isLoading = isUserLoading || isUserDocLoading || isAppLoading;
  const latestApplication = applicationData?.[0];

  if (isLoading) {
    return (
      <>
        <PageHeader title="My Profile" />
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
             <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
            <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!user || !userData) {
    return (
       <Alert variant="destructive">
            <UserIcon className="h-4 w-4" />
            <AlertTitle>Not Logged In</AlertTitle>
            <AlertDescription>
                You must be logged in to view your profile.
            </AlertDescription>
        </Alert>
    );
  }
  
  const profileUser = {
      name: userData.name,
      email: userData.email,
      phone: latestApplication?.phone,
      skills: latestApplication?.skills,
      resumeUrl: latestApplication?.resumeUrl,
  }

  return (
    <>
      <PageHeader title="My Profile" />
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20 border">
            <AvatarImage
              src={`https://picsum.photos/seed/${profileUser.email}/200/200`}
              alt={profileUser.name}
              data-ai-hint="person face"
            />
            <AvatarFallback>{profileUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profileUser.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" /> {profileUser.email}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {profileUser.phone && (
             <div className="flex items-center gap-4 text-sm">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Phone:</span>
                <span className="text-muted-foreground">{profileUser.phone}</span>
            </div>
          )}

          {profileUser.skills && profileUser.skills.length > 0 && (
             <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                {profileUser.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
                </div>
            </div>
          )}
          
           {profileUser.resumeUrl && (
             <div>
                <h3 className="font-semibold mb-2">Resume</h3>
                <ViewResumeButton resumePath={profileUser.resumeUrl} />
            </div>
          )}

          {!latestApplication && (
             <Alert>
                <UserIcon className="h-4 w-4" />
                <AlertTitle>Complete Your Profile</AlertTitle>
                <AlertDescription>
                    Your phone number, skills, and resume are sourced from your latest job application. Apply for a job to see them here.
                </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>
    </>
  );
}
