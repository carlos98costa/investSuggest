'use server';

/**
 * @fileOverview Generic asset analysis AI agent.
 *
 * - analyzeGenericAsset - A function that analyzes a non-stock asset.
 * - AnalyzeGenericAssetInput - The input type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFromCache, setInCache } from '@/lib/cache';
import { AnalyzeInvestmentOutput, AnalyzeInvestmentOutputSchema } from '../schemas';

const AnalyzeGenericAssetInputSchema = z.object({
  assetType: z.string().describe('The type of asset to analyze (e.g., crypto, currencies, funds, fixed income).'),
  assetName: z.string().describe('The name or symbol of the asset to analyze (e.g., Bitcoin, USD/BRL, VOO).'),
  locale: z.string().describe('The language for the output, specified as a BCP 47 language tag (e.g., en, pt-BR).'),
});
export type AnalyzeGenericAssetInput = z.infer<typeof AnalyzeGenericAssetInputSchema>;

export async function analyzeGenericAsset(input: AnalyzeGenericAssetInput): Promise<AnalyzeInvestmentOutput> {
  return analyzeGenericAssetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeGenericAssetPrompt',
  input: {schema: AnalyzeGenericAssetInputSchema},
  output: {schema: AnalyzeInvestmentOutputSchema},
  prompt: `You are an expert AI financial analyst. Your task is to provide a comprehensive analysis for the specified asset based on its type. You are NOT analyzing a stock, so do not mention stock-specific metrics like P/E ratio unless it's an ETF that has one.

  Asset Name: {{{assetName}}}
  Asset Type: {{{assetType}}}
  Language for response: {{{locale}}}
  
  ## Your Task:
  Based on the asset type, perform a thorough analysis by following the relevant guidelines below. The final output must be a single, valid JSON object matching the output schema.

  1.  **Analysis Section:** Write a detailed analysis (4-6 sentences).
  2.  **Pros Section:** List at least three distinct "pros" (strengths, opportunities).
  3.  **Cons Section:** List at least three distinct "cons" (weaknesses, risks).
  4.  **Recommendation:** Provide a final recommendation.
      - For Currencies, use "buy" (go long on the base currency), "sell" (go short on the base currency), or "hold" (neutral).
      - For other assets, use "buy", "sell", or "hold".
      - Do not translate this field.
  5. **Asset Identification**: Populate 'assetName' with the full name (e.g., Bitcoin) and 'tickerSymbol' with the common symbol (e.g., BTC).
  6.  **Language & Formatting:** All textual content (analysis, pros, cons) MUST be in the specified language ({{{locale}}}).

  ## Analysis Guidelines by Asset Type:
  
  ### Cryptocurrency Analysis (Use for assetType: "crypto")
  -   **Analysis:** Focus on the project's technology, use case, adoption rate, developer activity, and tokenomics (supply, distribution).
  -   **Pros/Cons:** Justify points with data like market capitalization, recent performance (e.g., 90-day change), transaction volume, major partnerships, or security vulnerabilities.

  ### Currency Analysis (Use for assetType: "currencies")
  -   **Analysis:** Focus on macroeconomic factors impacting BOTH currencies in the pair. Discuss central bank policies (interest rates), inflation data, GDP growth, political stability, and trade balances.
  -   **Pros/Cons:** Justify points with specific data, e.g., "The Central Bank of Brazil's recent rate hike makes the BRL more attractive (Pro for selling USD/BRL)" or "High US inflation may lead to Fed tightening, strengthening the USD (Con for selling USD/BRL)."

  ### Fund/ETF Analysis (Use for assetType: "funds")
  -   **Analysis:** Analyze the fund's investment strategy, its top holdings, expense ratio, and historical performance compared to its benchmark index.
  -   **Pros/Cons:** Justify points with data like the expense ratio (lower is better), asset under management (AUM), diversification level, or performance over 1, 3, and 5 years.

  ### Fixed Income Analysis (Use for assetType: "fixed income")
  -   **Analysis:** Analyze the issuer's creditworthiness (e.g., government, corporation), the bond's yield to maturity, duration (interest rate sensitivity), and any special features (e.g., inflation protection for Tesouro IPCA+).
  -   **Pros/Cons:** Justify points with the credit rating, current yield vs. benchmark rates, and the economic outlook for interest rates and inflation.
  `,
});

const analyzeGenericAssetFlow = ai.defineFlow(
  {
    name: 'analyzeGenericAssetFlow',
    inputSchema: AnalyzeGenericAssetInputSchema,
    outputSchema: AnalyzeInvestmentOutputSchema,
  },
  async (input) => {
    const cacheKey = `analysis-${input.assetType}-${input.assetName.replace(/\s+/g, '-').toLowerCase()}-${input.locale}`;
    const cachedResult = getFromCache<AnalyzeInvestmentOutput>(cacheKey);

    if (cachedResult) {
      console.log(`[Cache] HIT for ${cacheKey}`);
      return cachedResult;
    }
    console.log(`[Cache] MISS for ${cacheKey}`);
    
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('The AI failed to generate an analysis for this asset.');
    }
    
    setInCache(cacheKey, output);
    return output;
  }
);
