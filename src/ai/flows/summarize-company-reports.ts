// This is an AI-powered agent that summarizes company reports and news articles.
// It takes a URL as input and returns a summary of the content at that URL.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCompanyReportsInputSchema = z.object({
  url: z.string().describe('The URL of the company report or news article.'),
});

export type SummarizeCompanyReportsInput = z.infer<typeof SummarizeCompanyReportsInputSchema>;

const SummarizeCompanyReportsOutputSchema = z.object({
  summary: z.string().describe('The summary of the company report or news article.'),
});

export type SummarizeCompanyReportsOutput = z.infer<typeof SummarizeCompanyReportsOutputSchema>;

export async function summarizeCompanyReports(input: SummarizeCompanyReportsInput): Promise<SummarizeCompanyReportsOutput> {
  return summarizeCompanyReportsFlow(input);
}

const summarizeCompanyReportsPrompt = ai.definePrompt({
  name: 'summarizeCompanyReportsPrompt',
  input: {schema: SummarizeCompanyReportsInputSchema},
  output: {schema: SummarizeCompanyReportsOutputSchema},
  prompt: `You are an AI expert in summarization. You will receive the content of a company report or news article from the URL provided and summarize it.

URL: {{{url}}}

Summary: `,
});

const summarizeCompanyReportsFlow = ai.defineFlow(
  {
    name: 'summarizeCompanyReportsFlow',
    inputSchema: SummarizeCompanyReportsInputSchema,
    outputSchema: SummarizeCompanyReportsOutputSchema,
  },
  async input => {
    const {output} = await summarizeCompanyReportsPrompt(input);
    return output!;
  }
);
