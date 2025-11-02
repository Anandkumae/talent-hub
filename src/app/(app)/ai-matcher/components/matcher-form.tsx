'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getMatchScore, type MatcherState } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

const initialState: MatcherState = {
  message: null,
  errors: {},
  matchScore: null,
};

export function MatcherForm() {
  const [state, dispatch] = useFormState(getMatchScore, initialState);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state.matchScore !== null) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= state.matchScore!) {
            clearInterval(interval);
            return state.matchScore!;
          }
          return prev + 1;
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [state.matchScore]);

  const handleReset = () => {
    // This is a simple way to reset the form state visually.
    // For a full reset, you might need to manage form fields with React state.
    window.location.reload();
  };

  return (
    <form action={dispatch} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            placeholder="Paste the full job description here..."
            className="min-h-[250px] lg:min-h-[400px] resize-none"
          />
          {state.errors?.jobDescription && (
            <p className="text-sm text-destructive">{state.errors.jobDescription[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="resumeText">Candidate Resume Text</Label>
          <Textarea
            id="resumeText"
            name="resumeText"
            placeholder="Paste the full text from the candidate's resume here..."
            className="min-h-[250px] lg:min-h-[400px] resize-none"
          />
          {state.errors?.resumeText && (
            <p className="text-sm text-destructive">{state.errors.resumeText[0]}</p>
          )}
        </div>
      </div>
      
      {state.message && state.matchScore === null && !state.errors?.jobDescription && !state.errors?.resumeText && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <SubmitButton />
         <Button variant="outline" type="button" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4"/>
          Start Over
        </Button>
      </div>

      {state.matchScore !== null && (
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Match Score</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{Math.round(progress)}%</div>
            <Progress value={progress} className="w-full" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{state.message}</p>
        </div>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          Get Match Score
        </>
      )}
    </Button>
  );
}
