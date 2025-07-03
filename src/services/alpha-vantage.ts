import { z } from 'zod';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Zod schemas for validation
export const CompanyOverviewSchema = z.object({
  Symbol: z.string(),
  Name: z.string(),
  Description: z.string(),
  Exchange: z.string(),
  Currency: z.string(),
  Country: z.string(),
  Sector: z.string(),
  Industry: z.string(),
  MarketCapitalization: z.string(),
  EBITDA: z.string(),
  PERatio: z.string(),
  PEGRatio: z.string(),
  BookValue: z.string(),
  DividendPerShare: z.string(),
  DividendYield: z.string(),
  EPS: z.string(),
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
    return null;
  }
}
