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
import { getFinancialData } from '@/services/alpha-vantage';

const AnalyzeInvestmentInputSchema = z.object({
  tickerSymbol: z.string().describe('The ticker symbol of the asset to analyze.'),
  locale: z.string().describe('The language for the output, specified as a BCP 47 language tag (e.g., en, pt-BR).'),
});
export type AnalyzeInvestmentInput = z.infer<typeof AnalyzeInvestmentInputSchema>;


const ComprehensiveFinancialDataSchema = z.object({
    locale: z.string(),
    // From overview
    assetName: z.string(),
    tickerSymbol: z.string(),
    exchange: z.string(),
    sector: z.string(),
    industry: z.string(),
    description: z.string(),
    currency: z.string(),
    marketCap: z.string(),
    peRatio: z.string(),
    pbRatio: z.string(),
    eps: z.string(),
    dividendYield: z.string(),
    roe: z.string(),
    ebitda: z.string(),
    week52High: z.string(),
    week52Low: z.string(),
    // From quote
    price: z.string(),
    previousClose: z.string(),
    change: z.string(),
    changePercent: z.string(),
    volume: z.string(),
    // From Income Statement (Latest Annual)
    totalRevenue: z.string(),
    grossProfit: z.string(),
    operatingIncome: z.string(),
    netIncome: z.string(),
    // From Balance Sheet (Latest Annual)
    totalAssets: z.string(),
    totalLiabilities: z.string(),
    shareholderEquity: z.string(),
    // From Cash Flow (Latest Annual)
    operatingCashflow: z.string(),
    capitalExpenditures: z.string(),
    freeCashFlow: z.string(),
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
  name: 'analyzeInvestmentWithDataPrompt',
  input: {schema: ComprehensiveFinancialDataSchema},
  output: {schema: AnalyzeInvestmentOutputSchema},
  prompt: `You are an expert AI investment analyst. Your task is to provide a comprehensive, data-driven analysis for the specified stock ticker using the provided real-time, fundamental, and detailed financial statement data.

  Language for response: {{{locale}}}
  
  ## Company & Market Information
  - Company Name: {{{assetName}}}
  - Ticker Symbol: {{{tickerSymbol}}}
  - Exchange: {{{exchange}}}
  - Sector: {{{sector}}}
  - Industry: {{{industry}}}
  - Description: {{{description}}}

  ## Real-Time Quote & Key Metrics
  - Current Price: {{{price}}} {{{currency}}}
  - Previous Close: {{{previousClose}}}
  - Change: {{{change}}} ({{{changePercent}}})
  - Volume: {{{volume}}}
  - 52 Week High: {{{week52High}}}
  - 52 Week Low: {{{week52Low}}}
  - Market Capitalization: {{{marketCap}}}
  - P/E Ratio: {{{peRatio}}}
  - P/B Ratio: {{{pbRatio}}}
  - EPS: {{{eps}}}
  - Dividend Yield: {{{dividendYield}}}
  - Return on Equity (ROE): {{{roe}}}
  - EBITDA: {{{ebitda}}}

  ## Financial Statement Highlights (Latest Annual Report)
  ### Income Statement
  - Total Revenue: {{{totalRevenue}}}
  - Gross Profit: {{{grossProfit}}}
  - Operating Income: {{{operatingIncome}}}
  - Net Income: {{{netIncome}}}
  ### Balance Sheet
  - Total Assets: {{{totalAssets}}}
  - Total Liabilities: {{{totalLiabilities}}}
  - Total Shareholder Equity: {{{shareholderEquity}}}
  ### Cash Flow
  - Operating Cash Flow: {{{operatingCashflow}}}
  - Capital Expenditures: {{{capitalExpenditures}}}
  - Free Cash Flow: {{{freeCashFlow}}}
  
  ## Your Task:
  Based on ALL the provided data, perform a thorough fundamental analysis.

  1.  **Analysis Section:** Write a detailed analysis (4-6 sentences). Cover the company's business model, market position, profitability, financial health (debt levels, asset base), and cash flow generation. Integrate the financial statement data to support your points.
  2.  **Pros Section:** List at least three distinct "pros" (strengths, opportunities). Each point MUST be justified with specific data from the financial statements or key metrics provided (e.g., "Strong profitability demonstrated by a high Net Income of X," or "Healthy balance sheet with Total Assets far exceeding Total Liabilities.").
  3.  **Cons Section:** List at least three distinct "cons" (weaknesses, risks). Each point MUST be justified with specific data (e.g., "High debt levels are a concern, as shown by the Total Liabilities of Y," or "Negative Free Cash Flow indicates potential issues with funding operations.").
  4.  **Recommendation:** Provide a final, one-word recommendation: "buy", "sell", or "hold". Do not translate this field.
  5.  **Language & Formatting:** All textual content (analysis, pros, cons) MUST be in the specified language ({{{locale}}}). The final output must be a single, valid JSON object matching the output schema.
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

    const latestAnnualIncomeStatement = financialData.incomeStatement?.annualReports?.[0];
    const latestAnnualBalanceSheet = financialData.balanceSheet?.annualReports?.[0];
    const latestAnnualCashFlow = financialData.cashFlow?.annualReports?.[0];
    
    const operatingCashflow = parseFloat(latestAnnualCashFlow?.operatingCashflow ?? '0');
    const capitalExpenditures = parseFloat(latestAnnualCashFlow?.capitalExpenditures ?? '0');
    const freeCashFlow = operatingCashflow - capitalExpenditures;

    const cleanedData = {
        locale: input.locale,
        // Overview
        assetName: financialData.overview.Name ?? 'N/A',
        tickerSymbol: financialData.overview.Symbol ?? 'N/A',
        exchange: financialData.overview.Exchange ?? 'N/A',
        sector: financialData.overview.Sector ?? 'N/A',
        industry: financialData.overview.Industry ?? 'N/A',
        description: financialData.overview.Description ?? 'No description available.',
        currency: financialData.overview.Currency ?? 'N/A',
        marketCap: financialData.overview.MarketCapitalization ?? 'N/A',
        peRatio: financialData.overview.PERatio ?? 'N/A',
        pbRatio: financialData.overview.PriceToBookRatio ?? 'N/A',
        eps: financialData.overview.EPS ?? 'N/A',
        dividendYield: financialData.overview.DividendYield ?? 'N/A',
        roe: financialData.overview.ReturnOnEquityTTM ?? 'N/A',
        ebitda: financialData.overview.EBITDA ?? 'N/A',
        week52High: financialData.overview['52WeekHigh'] ?? 'N/A',
        week52Low: financialData.overview['52WeekLow'] ?? 'N/A',
        // Quote
        price: financialData.quote['Global Quote']['05. price'] ?? 'N/A',
        previousClose: financialData.quote['Global Quote']['08. previous close'] ?? 'N/A',
        change: financialData.quote['Global Quote']['09. change'] ?? 'N/A',
        changePercent: financialData.quote['Global Quote']['10. change percent'] ?? 'N/A',
        volume: financialData.quote['Global Quote']['06. volume'] ?? 'N/A',
        // Financial Statements
        totalRevenue: latestAnnualIncomeStatement?.totalRevenue ?? 'N/A',
        grossProfit: latestAnnualIncomeStatement?.grossProfit ?? 'N/A',
        operatingIncome: latestAnnualIncomeStatement?.operatingIncome ?? 'N/A',
        netIncome: latestAnnualIncomeStatement?.netIncome ?? 'N/A',
        totalAssets: latestAnnualBalanceSheet?.totalAssets ?? 'N/A',
        totalLiabilities: latestAnnualBalanceSheet?.totalLiabilities ?? 'N/A',
        shareholderEquity: latestAnnualBalanceSheet?.totalShareholderEquity ?? 'N/A',
        operatingCashflow: latestAnnualCashFlow?.operatingCashflow ?? 'N/A',
        capitalExpenditures: latestAnnualCashFlow?.capitalExpenditures ?? 'N/A',
        freeCashFlow: isNaN(freeCashFlow) ? 'N/A' : freeCashFlow.toString(),
    };
    
    const { output } = await prompt(cleanedData);
    
    if (!output) {
      throw new Error('The AI failed to generate an analysis.');
    }

    return output;
  }
);
