'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function ViewResumeButton({ resumePath }: { resumePath: string }) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { firebaseApp } = useFirebase();

  const handleFetchUrl = async () => {
    if (!firebaseApp) {
      setError('Firebase not available.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, resumePath);
      const url = await getDownloadURL(storageRef);
      setDownloadUrl(url);
    } catch (e: any) {
      console.error("Error fetching resume URL:", e);
      if (e.code === 'storage/object-not-found') {
        setError('Resume file not found.');
      } else {
        setError('Could not get resume link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resumePath) {
        handleFetchUrl();
    }
  }, [resumePath, firebaseApp]);


  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <RefreshCw className="mr-2 animate-spin" />
        Loading Resume...
      </Button>
    );
  }
  
  if (error) {
     return (
       <div className="text-destructive text-sm flex items-center gap-2">
         <AlertTriangle className="h-4 w-4" /> 
         <span>{error}</span>
       </div>
     )
  }

  if (!downloadUrl) {
    return (
         <Button disabled className="w-full">
            No Resume Available
        </Button>
    )
  }

  return (
    <Button className="w-full" asChild>
      <Link href={downloadUrl} target="_blank" rel="noopener noreferrer">
        <FileText className="mr-2" />
        View Resume
      </Link>
    </Button>
  );
}
