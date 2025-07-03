'use server';

import { z } from 'zod';

const CompanyOverviewSchema = z.object({
  Symbol: z.string(),
  AssetType: z.string(),
  Name: z.string(),
  Description: z.string(),
  CIK: z.string(),
  Exchange: z.string(),
  Currency: z.string(),
  Country: z.string(),
  Sector: z.string(),
  Industry: z.string(),
  Address: z.string(),
  FiscalYearEnd: z.string(),
  LatestQuarter: z.string(),
  MarketCapitalization: z.string(),
  EBITDA: z.string(),
  PERatio: z.string(),
  PEGRatio: z.string(),
  BookValue: z.string(),
  DividendPerShare: z.string(),
  DividendYield: z.string(),
  EPS: z.string(),
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
    return null;
  }
}
