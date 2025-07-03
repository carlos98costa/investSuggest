<<<<<<< HEAD
'use server';

import { z } from 'zod';

const CompanyOverviewSchema = z.object({
  Symbol: z.string(),
  AssetType: z.string(),
  Name: z.string(),
  Description: z.string(),
  CIK: z.string(),
=======
import { z } from 'zod';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Zod schemas for validation
export const CompanyOverviewSchema = z.object({
  Symbol: z.string(),
  Name: z.string(),
  Description: z.string(),
>>>>>>> e51fb4d (I see this error with the app, reported by NextJS, please fix it. The er)
  Exchange: z.string(),
  Currency: z.string(),
  Country: z.string(),
  Sector: z.string(),
  Industry: z.string(),
<<<<<<< HEAD
  Address: z.string(),
  FiscalYearEnd: z.string(),
  LatestQuarter: z.string(),
=======
>>>>>>> e51fb4d (I see this error with the app, reported by NextJS, please fix it. The er)
  MarketCapitalization: z.string(),
  EBITDA: z.string(),
  PERatio: z.string(),
  PEGRatio: z.string(),
  BookValue: z.string(),
  DividendPerShare: z.string(),
  DividendYield: z.string(),
  EPS: z.string(),
<<<<<<< HEAD
  RevenuePerShareTTM: z.string(),
  ProfitMargin: z.string(),
  OperatingMarginTTM: z.string(),
  ReturnOnAssetsTTM: z.string(),
  ReturnOnEquityTTM: z.string(),
  RevenueTTM: z.string(),
  GrossProfitTTM: z.string(),
  DilutedEPSTTM: z.string(),
  QuarterlyEarningsGrowthYOY: z.string(),
  QuarterlyRevenueGrowthYOY: z.string(),
  AnalystTargetPrice: z.string(),
  TrailingPE: z.string(),
  ForwardPE: z.string(),
  PriceToSalesRatioTTM: z.string(),
  PriceToBookRatio: z.string(),
  EVToRevenue: z.string(),
  EVToEBITDA: z.string(),
  Beta: z.string(),
  '52WeekHigh': z.string(),
  '52WeekLow': z.string(),
  '50DayMovingAverage': z.string(),
  '200DayMovingAverage': z.string(),
  SharesOutstanding: z.string(),
  DividendDate: z.string(),
  ExDividendDate: z.string(),
  // Response can be empty if the symbol is not found
}).passthrough();

export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;

export async function getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('Alpha Vantage API key is not configured.');
  }

  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Alpha Vantage API request failed with status: ${response.status}`);
      return null;
    }
    const data = await response.json();

    // If the API returns an empty object, it means the symbol was not found.
    if (Object.keys(data).length === 0) {
      console.warn(`No data found for symbol: ${symbol}`);
      return null;
    }
    
    // The API might return an error message in the response body
    if (data.Note || data['Error Message']) {
        console.error('Alpha Vantage API error:', data.Note || data['Error Message']);
        return null;
    }

    const parsedData = CompanyOverviewSchema.safeParse(data);
    if (!parsedData.success) {
        console.error('Failed to parse Alpha Vantage company overview data:', parsedData.error);
        return null;
    }

    return parsedData.data;
  } catch (error) {
    console.error('Error fetching company overview from Alpha Vantage:', error);
=======
  ReturnOnEquityTTM: z.string(),
  PriceToBookRatio: z.string(),
  '52WeekHigh': z.string(),
  '52WeekLow': z.string(),
}).partial().passthrough(); // Use partial and passthrough for flexibility

export const GlobalQuoteSchema = z.object({
  'Global Quote': z.object({
    '01. symbol': z.string(),
    '05. price': z.string(),
    '08. previous close': z.string(),
    '09. change': z.string(),
    '10. change percent': z.string(),
    '06. volume': z.string(),
  }).partial().passthrough(),
});

export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;
export type GlobalQuote = z.infer<typeof GlobalQuoteSchema>;

export async function getFinancialData(symbol: string): Promise<{ overview: CompanyOverview; quote: GlobalQuote } | null> {
  try {
    const overviewPromise = fetch(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`);
    const quotePromise = fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);

    const [overviewRes, quoteRes] = await Promise.all([overviewPromise, quotePromise]);
    const overviewResponse = await overviewRes.json();
    const quoteResponse = await quoteRes.json();
    
    // Handle API errors or limits
    if (overviewResponse.Note || quoteResponse.Note || overviewResponse.Information || quoteResponse.Information) {
      console.warn(`Alpha Vantage API limit reached or other notice for symbol: ${symbol}`, overviewResponse, quoteResponse);
      return null;
    }
    
    // Check for empty responses which can happen for invalid symbols
    if (Object.keys(overviewResponse).length === 0 || !quoteResponse['Global Quote'] || Object.keys(quoteResponse['Global Quote']).length === 0) {
        console.error(`No data returned for symbol: ${symbol}`);
        return null;
    }
    
    const overview = CompanyOverviewSchema.parse(overviewResponse);
    const quote = GlobalQuoteSchema.parse(quoteResponse);
    
    return { overview, quote };
  } catch (error) {
    console.error(`Error fetching or parsing financial data for ${symbol}:`, error);
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.issues);
    }
>>>>>>> e51fb4d (I see this error with the app, reported by NextJS, please fix it. The er)
    return null;
  }
}
