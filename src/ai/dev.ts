import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-daily-posture.ts';
import '@/ai/flows/generate-posture-feedback.ts';