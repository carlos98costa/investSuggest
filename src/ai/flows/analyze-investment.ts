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
import { getCompanyOverview } from '@/services/alpha-vantage';

const AnalyzeInvestmentInputSchema = z.object({
  tickerSymbol: z.string().describe('The ticker symbol of the asset to analyze.'),
  locale: z.string().describe('The language for the output, specified as a BCP 47 language tag (e.g., en, pt-BR).'),
});
export type AnalyzeInvestmentInput = z.infer<typeof AnalyzeInvestmentInputSchema>;

// New prompt input schema that includes the fetched financial data.
const AnalyzeInvestmentPromptInputSchema = AnalyzeInvestmentInputSchema.extend({
    companyOverview: z.string().describe('A JSON string containing the company overview and financial data from a real-time API. This should be the primary source of truth for the analysis.')
});

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
  input: {schema: AnalyzeInvestmentPromptInputSchema}, // Use the new extended schema
  output: {schema: AnalyzeInvestmentOutputSchema},
  prompt: `You are an expert AI investment analyst. Your primary task is to provide a detailed, data-driven analysis for the specified stock ticker using the real-time financial data provided.

  Ticker Symbol: {{{tickerSymbol}}}
  Language for response: {{{locale}}}

  **Primary Data Source (Real-Time Financial Data):**
  \`\`\`json
  {{{companyOverview}}}
  \`\`\`

  **Analysis Guidelines:**
  1.  **Base Your Analysis on Provided Data:** Use the JSON data above as the single source of truth for all financial metrics and company information.
  2.  **Comprehensive Analysis:** Generate a detailed analysis covering the company's business model (from the 'Description' field), market position, financial performance, and growth prospects. Reference key metrics from the data, such as 'PERatio', 'PriceToBookRatio', 'DividendYield', 'ReturnOnEquityTTM', and 'QuarterlyRevenueGrowthYOY'.
  3.  **Pros and Cons:** List at least three distinct "pros" (strengths/opportunities) and three distinct "cons" (weaknesses/risks). These must be directly supported by the provided data.
  4.  **Recommendation:** Conclude with a clear recommendation: "buy", "sell", or "hold". This field MUST NOT be translated.
  5.  **Language:** All textual output (analysis, pros, cons) must be in the specified language ({{{locale}}}).
  6.  **Disclaimer:** Emphasize that this is not personalized investment advice and that investing involves risks.

  Format your response as a JSON object that matches the AnalyzeInvestmentOutputSchema schema. Adhere to the descriptions in the schema closely. If the provided data is sparse or empty, indicate that an analysis could not be performed due to lack of data.
  `,
});

const analyzeInvestmentFlow = ai.defineFlow(
  {
    name: 'analyzeInvestmentFlow',
    inputSchema: AnalyzeInvestmentInputSchema,
    outputSchema: AnalyzeInvestmentOutputSchema,
  },
  async (input) => {
    const overview = await getCompanyOverview(input.tickerSymbol);

    if (!overview) {
        throw new Error(`Could not retrieve financial data for ticker: ${input.tickerSymbol}. The symbol may be invalid or the data provider is unavailable.`);
    }

    const {output} = await prompt({
        ...input,
        companyOverview: JSON.stringify(overview, null, 2),
    });

    if (!output) {
      throw new Error('The AI failed to generate an analysis.');
    }
    
    // Use the accurate name from the API response
    return {
        ...output,
        assetName: overview.Name || output.assetName,
        tickerSymbol: input.tickerSymbol,
    };
  }
);
