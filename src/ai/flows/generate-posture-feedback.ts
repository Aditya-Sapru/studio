'use server';

/**
 * @fileOverview Generates personalized feedback on user posture based on historical data.
 *
 * - generatePostureFeedback - A function that generates posture feedback.
 * - GeneratePostureFeedbackInput - The input type for the generatePostureFeedback function.
 * - GeneratePostureFeedbackOutput - The return type for the generatePostureFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostureFeedbackInputSchema = z.object({
  userId: z.string().describe('The ID of the user to generate feedback for.'),
  postureData: z.string().describe('Historical posture data for the user in JSON format.'),
});

export type GeneratePostureFeedbackInput = z.infer<typeof GeneratePostureFeedbackInputSchema>;

const GeneratePostureFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the user\'s posture.'),
});

export type GeneratePostureFeedbackOutput = z.infer<typeof GeneratePostureFeedbackOutputSchema>;

export async function generatePostureFeedback(input: GeneratePostureFeedbackInput): Promise<GeneratePostureFeedbackOutput> {
  return generatePostureFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostureFeedbackPrompt',
  input: {schema: GeneratePostureFeedbackInputSchema},
  output: {schema: GeneratePostureFeedbackOutputSchema},
  prompt: `You are a posture expert providing feedback to users based on their historical posture data.\n\nAnalyze the following posture data for user ID {{{userId}}}:\n\n{{{postureData}}}\n\nProvide personalized feedback to the user, highlighting trends and areas for improvement. Focus on actionable insights and positive reinforcement. Keep the feedback concise and easy to understand.\n\nFeedback:`,
});

const generatePostureFeedbackFlow = ai.defineFlow(
  {
    name: 'generatePostureFeedbackFlow',
    inputSchema: GeneratePostureFeedbackInputSchema,
    outputSchema: GeneratePostureFeedbackOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse postureData as JSON; handle potential errors
      JSON.parse(input.postureData);
    } catch (e: any) {
      // Re-throw as a more descriptive error for Genkit to handle
      throw new Error(`Invalid postureData JSON: ${e.message}`);
    }

    const {output} = await prompt(input);
    return output!;
  }
);
