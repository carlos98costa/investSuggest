import { z } from 'zod';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Zod schemas for validation
const CompanyOverviewSchema = z.object({
  Symbol: z.string().optional(),
  Name: z.string().optional(),
  Description: z.string().optional(),
  Exchange: z.string().optional(),
  Currency: z.string().optional(),
  Country: z.string().optional(),
  Sector: z.string().optional(),
  Industry: z.string().optional(),
  MarketCapitalization: z.string().optional(),
  EBITDA: z.string().optional(),
  PERatio: z.string().optional(),
  PEGRatio: z.string().optional(),
  BookValue: z.string().optional(),
  DividendPerShare: z.string().optional(),
  DividendYield: z.string().optional(),
  EPS: z.string().optional(),
  ReturnOnEquityTTM: z.string().optional(),
  PriceToBookRatio: z.string().optional(),
  '52WeekHigh': z.string().optional(),
  '52WeekLow': z.string().optional(),
}).catchall(z.any());


const GlobalQuoteSchema = z.object({
  'Global Quote': z.object({
    '01. symbol': z.string(),
    '05. price': z.string().optional(),
    '08. previous close': z.string().optional(),
    '09. change': z.string().optional(),
    '10. change percent': z.string().optional(),
    '06. volume': z.string().optional(),
  }).catchall(z.any()),
}).catchall(z.any());

const FinancialReportSchema = z.object({
  fiscalDateEnding: z.string(),
  reportedCurrency: z.string(),
  totalRevenue: z.string().optional(),
  grossProfit: z.string().optional(),
  operatingIncome: z.string().optional(),
  netIncome: z.string().optional(),
  totalAssets: z.string().optional(),
  totalCurrentAssets: z.string().optional(),
  totalLiabilities: z.string().optional(),
  totalCurrentLiabilities: z.string().optional(),
  totalShareholderEquity: z.string().optional(),
  operatingCashflow: z.string().optional(),
  capitalExpenditures: z.string().optional(),
  cashflowFromInvestment: z.string().optional(),
  cashflowFromFinancing: z.string().optional(),
}).catchall(z.any());

const IncomeStatementSchema = z.object({
  symbol: z.string(),
  annualReports: z.array(FinancialReportSchema),
  quarterlyReports: z.array(FinancialReportSchema),
}).catchall(z.any());

const BalanceSheetSchema = z.object({
  symbol: z.string(),
  annualReports: z.array(FinancialReportSchema),
  quarterlyReports: z.array(FinancialReportSchema),
}).catchall(z.any());

const CashFlowSchema = z.object({
  symbol: z.string(),
  annualReports: z.array(FinancialReportSchema),
  quarterlyReports: z.array(FinancialReportSchema),
}).catchall(z.any());

export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;
export type GlobalQuote = z.infer<typeof GlobalQuoteSchema>;
export type IncomeStatement = z.infer<typeof IncomeStatementSchema>;
export type BalanceSheet = z.infer<typeof BalanceSheetSchema>;
export type CashFlow = z.infer<typeof CashFlowSchema>;

async function fetchAndValidate(url: string, schema: z.ZodSchema, symbol: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed for ${schema.description} at ${url}. Status: ${response.status}`);
  }
  const data = await response.json();
  
  if (data.Note) {
    throw new Error('API rate limit reached for financial data provider. Please try again later.');
  }

  if (data.Information || (data.Symbol && Object.keys(data).length <= 1) || Object.keys(data).length === 0) {
     throw new Error(`Invalid or no data for ticker symbol: ${symbol} from ${url}. The provider may not recognize this symbol.`);
  }

  try {
    return schema.parse(data);
  } catch(error) {
     if (error instanceof z.ZodError) {
      console.error(`Zod validation errors for ${url}:`, error.issues);
      throw new Error(`Data validation failed for ${symbol}. The data from the provider was in an unexpected format.`);
    }
    throw error;
  }
}

export async function getFinancialData(symbol: string): Promise<{ 
  overview: CompanyOverview; 
  quote: GlobalQuote;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlow;
}> {
  if (!API_KEY || API_KEY === 'demo') {
      console.warn('Using demo API key for Alpha Vantage. Data may be limited.');
  }
  
  try {
    const overviewPromise = fetchAndValidate(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`, CompanyOverviewSchema, symbol);
    const quotePromise = fetchAndValidate(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`, GlobalQuoteSchema, symbol);
    const incomePromise = fetchAndValidate(`${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`, IncomeStatementSchema, symbol);
    const balancePromise = fetchAndValidate(`${BASE_URL}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${API_KEY}`, BalanceSheetSchema, symbol);
    const cashflowPromise = fetchAndValidate(`${BASE_URL}?function=CASH_FLOW&symbol=${symbol}&apikey=${API_KEY}`, CashFlowSchema, symbol);

    const [overview, quote, incomeStatement, balanceSheet, cashFlow] = await Promise.all([
        overviewPromise, 
        quotePromise,
        incomePromise,
        balancePromise,
        cashflowPromise
    ]);
    
    return { overview, quote, incomeStatement, balanceSheet, cashFlow };

  } catch (error) {
    if (error instanceof Error) {
        console.error(`Error fetching financial data for ${symbol}:`, error.message);
        throw error; // Re-throw the specific error
    }
    throw new Error(`An unexpected error occurred while fetching financial data for ${symbol}.`);
  }
}
