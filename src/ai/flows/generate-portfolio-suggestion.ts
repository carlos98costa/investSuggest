'use server';

/**
 * @fileOverview Diversified portfolio suggestion AI agent.
 *
 * - generatePortfolioSuggestion - A function that generates a diversified portfolio suggestion.
 * - GeneratePortfolioSuggestionInput - The input type for the function.
 * - GeneratePortfolioSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePortfolioSuggestionInputSchema = z.object({
  investmentAmount: z.number().describe('The total amount of money to invest.'),
  riskLevel: z.string().describe('The desired risk level for the portfolio (e.g., low, medium, high).'),
  locale: z.string().describe('The language for the output, specified as a BCP 47 language tag (e.g., en, pt-BR).'),
});
export type GeneratePortfolioSuggestionInput = z.infer<typeof GeneratePortfolioSuggestionInputSchema>;

const PortfolioItemSchema = z.object({
    assetName: z.string().describe("The full name of the asset (e.g., Apple Inc., Bitcoin, Vanguard S&P 500 ETF)."),
    tickerSymbol: z.string().describe("The ticker symbol for the asset (e.g., AAPL, BTC, VOO)."),
    assetType: z.string().describe('The type of asset (e.g., Stock, Cryptocurrency, ETF, Fund, Bond).'),
    allocationPercentage: z.number().describe("The percentage of the total investment amount to allocate to this asset. Must be a number."),
    rationale: z.string().describe("A brief, data-driven rationale (1-2 sentences) for including this asset in the portfolio, explaining how it fits the risk profile."),
});

const GeneratePortfolioSuggestionOutputSchema = z.object({
  summary: z.string().describe("A brief summary (2-3 sentences) of the portfolio strategy, explaining how it aligns with the user's risk level and goals."),
  portfolio: z.array(PortfolioItemSchema).describe("An array of assets making up the diversified portfolio. The sum of all allocationPercentage values MUST equal 100."),
});
export type GeneratePortfolioSuggestionOutput = z.infer<typeof GeneratePortfolioSuggestionOutputSchema>;

export async function generatePortfolioSuggestion(input: GeneratePortfolioSuggestionInput): Promise<GeneratePortfolioSuggestionOutput> {
  return generatePortfolioSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePortfolioSuggestionPrompt',
  input: {schema: GeneratePortfolioSuggestionInputSchema},
  output: {schema: GeneratePortfolioSuggestionOutputSchema},
  prompt: `You are an expert financial advisor AI. Your task is to create a diversified investment portfolio for a user based on their investment amount and risk level.

  User's Input:
  - Investment Amount: {{{investmentAmount}}}
  - Risk Level: {{{riskLevel}}}
  - Language for response: {{{locale}}}

  **CRITICAL INSTRUCTIONS:**
  1.  **Diversification:** The portfolio MUST be diversified across different asset classes (e.g., stocks, ETFs, cryptocurrencies, bonds) appropriate for the specified risk level.
      - **Low Risk:** Focus on stable assets like government bonds, blue-chip stocks with strong dividends, and broad-market ETFs. Minimal exposure to high-volatility assets like crypto.
      - **Medium Risk:** A balanced mix of growth stocks, international ETFs, some corporate bonds, and a small allocation to major cryptocurrencies (like Bitcoin/Ethereum).
      - **High Risk:** Higher allocation to growth stocks, tech sector, emerging markets, and a more significant (but still managed) portion in cryptocurrencies.
  2.  **Number of Assets:** The portfolio should contain between 4 and 6 distinct assets.
  3.  **Allocation Sum:** The 'allocationPercentage' for all assets in the portfolio MUST sum up to exactly 100.
  4.  **Rationale:** The 'rationale' for each asset must be concise, data-driven, and in the specified language ({{{locale}}}).
  5.  **Summary:** The 'summary' must explain the overall strategy and how it meets the user's risk profile, also in the specified language ({{{locale}}}).
  6.  **JSON Format:** Your entire response must be a single, valid JSON object that strictly matches the provided output schema. Do not include any text or explanations outside of the JSON object.
  7.  **Brazilian Context**: As the target user is in Brazil, any "Fixed Income" or "Bond" suggestions MUST be specific to the Brazilian market. This includes government bonds (e.g., Tesouro Selic, Tesouro IPCA+), bank-issued securities (CDBs), and high-yield, high-liquidity savings products (like 'Caixinhas' from fintechs). For stocks, prioritize suggesting Brazilian assets (listed on B3) or BDRs, but you can include key international stocks where relevant.
  `,
});

const generatePortfolioSuggestionFlow = ai.defineFlow(
  {
    name: 'generatePortfolioSuggestionFlow',
    inputSchema: GeneratePortfolioSuggestionInputSchema,
    outputSchema: GeneratePortfolioSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a portfolio suggestion.');
    }
    // Ensure the total allocation is 100%
    const totalAllocation = output.portfolio.reduce((sum, item) => sum + item.allocationPercentage, 0);
    if (Math.round(totalAllocation) !== 100) {
        // This is a fallback in case the model doesn't follow instructions.
        // A more robust solution might normalize the values.
        throw new Error(`The AI generated a portfolio with a total allocation of ${totalAllocation}%, which is not 100%. Please try again.`);
    }
    return output;
  }
);
