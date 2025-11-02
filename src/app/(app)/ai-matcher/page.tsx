import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MatcherForm } from './components/matcher-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AiMatcherPage() {
  return (
    <>
      <PageHeader title="AI Resume Matcher" />
      <Card>
        <CardHeader>
          <CardTitle>Analyze Resume-Job Fit</CardTitle>
          <CardDescription>
            Paste a job description and a candidate's resume to get an AI-powered match score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatcherForm />
        </CardContent>
      </Card>
    </>
  );
}
