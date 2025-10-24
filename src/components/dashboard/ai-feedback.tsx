'use client';

import { useState } from 'react';
import { generatePostureFeedback } from '@/ai/flows/generate-posture-feedback';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';

interface AiFeedbackProps {
  postureData: string;
}

export default function AiFeedback({ postureData }: AiFeedbackProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFeedback = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await generatePostureFeedback({
        userId: user.uid,
        postureData: postureData,
      });
      setFeedback(result.feedback);
    } catch (e) {
      setError('Failed to generate feedback. Please try again.');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>AI Posture Coach</CardTitle>
          <CardDescription>
            Get personalized feedback on your daily posture.
          </CardDescription>
        </div>
        <Button onClick={handleGenerateFeedback} disabled={loading} size="sm">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          Analyze My Day
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
           <div className="flex items-center justify-center p-8">
             <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Analyzing your posture data...</span>
             </div>
           </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {feedback && (
          <Alert>
            <BrainCircuit className="h-4 w-4" />
            <AlertTitle>Your Posture Analysis</AlertTitle>
            <AlertDescription>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {feedback}
              </div>
            </AlertDescription>
          </Alert>
        )}
         {!loading && !feedback && !error && (
             <div className="text-center text-sm text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                Click the "Analyze My Day" button to get your personalized feedback.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
