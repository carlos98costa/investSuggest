'use server';

/**
 * @fileOverview Specific investment analysis AI agent.
 *
 * - analyzeInvestment - A function that analyzes a specific investment.
 * - AnalyzeInvestmentInput - The input type for the analyzeInvestment function.
 * - AnalyzeInvestmentOutput - The return type for the analyzeInvestment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInvestmentInputSchema = z.object({
  tickerSymbol: z.string().describe('The ticker symbol of the asset to analyze.'),
  locale: z.string().describe('The language for the output, specified as a BCP 47 language tag (e.g., en, pt-BR).'),
});
export type AnalyzeInvestmentInput = z.infer<typeof AnalyzeInvestmentInputSchema>;

const AnalyzeInvestmentOutputSchema = z.object({
  assetName: z.string().describe('The name of the asset.'),
  tickerSymbol: z.string().describe('The ticker symbol of the asset.'),
  recommendation: z.string().describe('The AI recommendation for the asset. Must be one of "buy", "sell", or "hold".'),
  analysis: z.string().describe('A detailed analysis of the investment, including its business, market position, and financial health.'),
  pros: z.array(z.string()).describe('A list of potential pros or strengths for this investment.'),
  cons: z.array(z.string()).describe('A list of potential cons or risks for this investment.'),
});
export type AnalyzeInvestmentOutput = z.infer<typeof AnalyzeInvestmentOutputSchema>;

export async function analyzeInvestment(input: AnalyzeInvestmentInput): Promise<AnalyzeInvestmentOutput> {
  return analyzeInvestmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInvestmentPrompt',
  input: {schema: AnalyzeInvestmentInputSchema},
  output: {schema: AnalyzeInvestmentOutputSchema},
  prompt: `You are an expert AI investment analyst. Provide a detailed analysis for the specified stock ticker.

  Ticker Symbol: {{{tickerSymbol}}}
  Language for response: {{{locale}}}

  Follow these guidelines for the analysis:
  - Provide a detailed analysis covering the company's business model, market leadership, financial performance (mentioning key metrics like P/E, P/B, and Dividend Yield if available), and growth prospects.
  - List at least three distinct "pros" (strengths or opportunities).
  - List at least three distinct "cons" (weaknesses or risks).
  - Provide a final recommendation: "buy", "sell", or "hold". Do not translate this field.
  - All textual content (analysis, pros, cons) MUST be in the specified language.
  - Emphasize that this is not personalized investment advice and that investing involves risks.

  Format your response as a JSON object that matches the AnalyzeInvestmentOutputSchema schema. Adhere to the descriptions in the schema closely.
  `,
});

const analyzeInvestmentFlow = ai.defineFlow(
  {
    name: 'analyzeInvestmentFlow',
    inputSchema: AnalyzeInvestmentInputSchema,
    outputSchema: AnalyzeInvestmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
