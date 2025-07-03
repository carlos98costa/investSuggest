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
import { getFinancialData, CompanyOverviewSchema, GlobalQuoteSchema } from '@/services/alpha-vantage';

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

const PromptInputSchema = z.object({
    locale: z.string(),
    overview: CompanyOverviewSchema,
    quote: GlobalQuoteSchema.shape['Global Quote']
});

const prompt = ai.definePrompt({
  name: 'analyzeInvestmentWithDataPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzeInvestmentOutputSchema},
  prompt: `You are an expert AI investment analyst. Provide a detailed analysis for the specified stock ticker using the provided real-time and fundamental data.

  Language for response: {{{locale}}}
  
  Asset Information:
  - Company Name: {{{overview.Name}}}
  - Ticker Symbol: {{{overview.Symbol}}}
  - Exchange: {{{overview.Exchange}}}
  - Sector: {{{overview.Sector}}}
  - Industry: {{{overview.Industry}}}
  - Description: {{{overview.Description}}}

  Real-time Quote:
  - Current Price: {{{quote.['05. price']}}} {{{overview.Currency}}}
  - Previous Close: {{{quote.['08. previous close']}}}
  - Change: {{{quote.['09. change']}}} ({{{quote.['10. change percent']}}})
  - Volume: {{{quote.['06. volume']}}}

  Fundamental Data:
  - Market Capitalization: {{{overview.MarketCapitalization}}}
  - P/E Ratio: {{{overview.PERatio}}}
  - P/B Ratio: {{{overview.PriceToBookRatio}}}
  - EPS: {{{overview.EPS}}}
  - Dividend Yield: {{{overview.DividendYield}}}
  - Return on Equity (ROE): {{{overview.ReturnOnEquityTTM}}}
  - EBITDA: {{{overview.EBITDA}}}
  - 52 Week High: {{{overview.['52WeekHigh']}}}
  - 52 Week Low: {{{overview.['52WeekLow']}}}

  Follow these guidelines for the analysis:
  - Based on all the provided data, provide a detailed analysis covering the company's business model, market leadership, financial health, and growth prospects.
  - List at least three distinct "pros" (strengths or opportunities), using the provided data to support them.
  - List at least three distinct "cons" (weaknesses or risks), using the provided data to support them.
  - Provide a final recommendation: "buy", "sell", or "hold". Do not translate this field.
  - All textual content (analysis, pros, cons) MUST be in the specified language.
  - For the assetName in the output, use the 'Name' from the provided data.
  - For the tickerSymbol in the output, use the 'Symbol' from the provided data.
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
  async (input) => {
    const financialData = await getFinancialData(input.tickerSymbol);

    if (!financialData || !financialData.quote['Global Quote']) {
      throw new Error(`Could not retrieve financial data for ${input.tickerSymbol}. The symbol might be invalid or the API limit may have been reached.`);
    }
    
    const { output } = await prompt({
        locale: input.locale,
        overview: financialData.overview,
        quote: financialData.quote['Global Quote'],
    });
    return output!;
  }
);
