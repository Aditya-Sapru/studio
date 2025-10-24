'use server';

/**
 * @fileOverview Summarizes a user's daily posture, including average sitting time,
 * longest standing period, and detected anomalies.
 *
 * - summarizeDailyPosture - A function that summarizes the daily posture.
 * - SummarizeDailyPostureInput - The input type for the summarizeDailyPosture function.
 * - SummarizeDailyPostureOutput - The return type for the summarizeDailyPosture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyPostureInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  date: z.string().describe('The date for which to summarize posture data (YYYY-MM-DD).'),
  postureData: z.array(
    z.object({
      timestamp: z.string(),
      sitting: z.boolean(),
    })
  ).describe('Array of posture data for the specified date.'),
});
export type SummarizeDailyPostureInput = z.infer<typeof SummarizeDailyPostureInputSchema>;

const SummarizeDailyPostureOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s daily posture.'),
});
export type SummarizeDailyPostureOutput = z.infer<typeof SummarizeDailyPostureOutputSchema>;

export async function summarizeDailyPosture(input: SummarizeDailyPostureInput): Promise<SummarizeDailyPostureOutput> {
  return summarizeDailyPostureFlow(input);
}

const summarizeDailyPosturePrompt = ai.definePrompt({
  name: 'summarizeDailyPosturePrompt',
  input: {schema: SummarizeDailyPostureInputSchema},
  output: {schema: SummarizeDailyPostureOutputSchema},
  prompt: `You are an AI assistant that summarizes daily posture data for users.

  Given the following posture data for user {{userId}} on {{date}}, provide a summary that includes:

  - Average sitting time
  - Longest standing period
  - Any detected anomalies or unusual patterns

  Posture Data:
  {{#each postureData}}
  - Timestamp: {{timestamp}}, Sitting: {{sitting}}
  {{/each}}

  Summary:`,
});

const summarizeDailyPostureFlow = ai.defineFlow(
  {
    name: 'summarizeDailyPostureFlow',
    inputSchema: SummarizeDailyPostureInputSchema,
    outputSchema: SummarizeDailyPostureOutputSchema,
  },
  async input => {
    const {output} = await summarizeDailyPosturePrompt(input);
    return output!;
  }
);
