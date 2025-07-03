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
  prompt: `You are an AI investment advisor that provides investment suggestions based on the latest financial data.

  Provide investment suggestions for the following criteria:

  Asset Type: {{{assetType}}}
  Risk Level: {{{riskLevel}}}
  Sector: {{#if sector}}{{{sector}}}{{else}}Any{{/if}}
  Language for response: {{{locale}}}

  Follow these guidelines when creating the suggestions:
  - Provide a list of investment suggestions with the asset name, ticker symbol, recommendation, and rationale.
  - The 'recommendation' field MUST be one of 'buy', 'sell', or 'hold'. Do not translate this field.
  - The 'rationale' field MUST be written in the language specified by the 'Language for response' field above.
  - Ensure that the suggestions align with the specified asset type, risk level, and sector (if provided).
  - Emphasize that these are not personalized investment advice and that investing involves risks.
  - Suggest at least three investment opportunities.

  The content of the rationale depends on the Asset Type:
  - If the Asset Type is "stocks", "funds", or "fixed income", the rationale should include key financial metrics such as P/E, P/B, and Dividend Yield.
  - If the Asset Type is "crypto" or "currencies", the rationale should include information relevant to that asset class, such as project fundamentals, market capitalization, and recent performance for crypto, or economic factors for currencies.

  Format your response as a JSON object that matches the GenerateInvestmentSuggestionsOutputSchema schema. Adhere to the descriptions in the schema closely.
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
