'use server';

/**
 * @fileOverview Investment suggestion AI agent.
 *
 * - generateInvestmentSuggestions - A function that generates investment suggestions.
 * - GenerateInvestmentSuggestionsInput - The input type for the generateInvestmentSuggestions function.
 * - GenerateInvestmentSuggestionsOutput - The return type for the generateInvestmentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInvestmentSuggestionsInputSchema = z.object({
  assetType: z.string().describe('The type of asset to generate suggestions for (e.g., stocks, crypto, currencies, funds, fixed income).'),
  riskLevel: z.string().describe('The risk level for the investment suggestions (e.g., low, medium, high).'),
  sector: z.string().describe('The sector to focus the investment suggestions on (e.g., technology, healthcare, energy).').optional(),
  locale: z.string().describe('The language for the output, specified as a BCP 47 language tag (e.g., en, pt-BR).'),
});
export type GenerateInvestmentSuggestionsInput = z.infer<typeof GenerateInvestmentSuggestionsInputSchema>;

const GenerateInvestmentSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      assetName: z.string().describe('The name of the asset.'),
      tickerSymbol: z.string().describe('The ticker symbol of the asset.'),
      recommendation: z.string().describe('The AI recommendation for the asset. Must be one of "buy", "sell", or "hold".'),
      rationale: z.string().describe('The rationale behind the recommendation, including key financial metrics.'),
    })
  ).describe('A list of investment suggestions based on the provided criteria.'),
});
export type GenerateInvestmentSuggestionsOutput = z.infer<typeof GenerateInvestmentSuggestionsOutputSchema>;

export async function generateInvestmentSuggestions(input: GenerateInvestmentSuggestionsInput): Promise<GenerateInvestmentSuggestionsOutput> {
  return generateInvestmentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvestmentSuggestionsPrompt',
  input: {schema: GenerateInvestmentSuggestionsInputSchema},
  output: {schema: GenerateInvestmentSuggestionsOutputSchema},
  prompt: `You are an expert AI investment advisor. Your goal is to provide high-quality, data-driven investment suggestions based on up-to-date financial data and market trends.

  Generate exactly three investment suggestions based on the following criteria:

  Asset Type: {{{assetType}}}
  Risk Level: {{{riskLevel}}}
  Sector: {{#if sector}}{{{sector}}}{{else}}Any{{/if}}
  Language for response: {{{locale}}}

  **CRITICAL INSTRUCTIONS**:
  1.  **Recommendation:** The 'recommendation' field MUST be one of 'buy', 'sell', or 'hold'. DO NOT TRANSLATE this value.
  2.  **Rationale Language:** ALL text in the 'rationale' field MUST be in the requested language: {{{locale}}}.
  3.  **Data-Driven Rationale:** The 'rationale' for each suggestion must be concise (2-3 sentences) but packed with specific, plausible data points and metrics relevant to the asset type. Do not use vague statements.

  **Rationale Content Guidelines by Asset Type:**
  -   **Stocks, Funds, Fixed Income:** The rationale MUST include at least three of the following metrics: P/E Ratio, P/B Ratio, Dividend Yield, ROE (Return on Equity), EBITDA, recent revenue growth, or debt-to-equity ratio.
      *Example Rationale (for a 'buy' recommendation):* "With a low P/E ratio of 15 and a strong ROE of 22%, the company shows significant value. Recent quarterly earnings grew by 18%, and its Dividend Yield of 3.5% provides stable returns."
  -   **Cryptocurrencies:** The rationale MUST include metrics relevant to crypto, such as market capitalization, recent performance (e.g., 30-day change), project fundamentals (e.g., technology, adoption rate), or tokenomics (e.g., supply schedule).
      *Example Rationale (for a 'buy' recommendation):* "The project has a solid market cap of $5B and has seen a 40% price increase in the last 60 days. Its recent mainnet upgrade successfully increased transaction speed, driving developer adoption."
  -   **Currencies:** The rationale MUST focus on macroeconomic factors, such as central bank interest rates, inflation data, GDP growth, and significant geopolitical events impacting the currency pair.
      *Example Rationale (for a 'buy' recommendation on USD/JPY):* "The US Federal Reserve's recent hawkish stance on interest rates contrasts with the Bank of Japan's continued dovish policy, creating a strong potential for USD appreciation. US inflation remains under control while its GDP growth is steady."

  4.  **JSON Format:** Format your entire response as a single JSON object that strictly matches the provided output schema. Do not include any text or explanations outside of the JSON object.
  `,
});

const generateInvestmentSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateInvestmentSuggestionsFlow',
    inputSchema: GenerateInvestmentSuggestionsInputSchema,
    outputSchema: GenerateInvestmentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
