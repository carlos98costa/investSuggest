import { config } from 'dotenv';
config();

import '@/ai/flows/generate-investment-suggestions.ts';
import '@/ai/flows/summarize-company-reports.ts';
import '@/ai/flows/analyze-investment.ts';
import '@/ai/flows/generate-portfolio-suggestion.ts';
