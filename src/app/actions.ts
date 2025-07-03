'use server';

import { 
  generateInvestmentSuggestions, 
  GenerateInvestmentSuggestionsInput 
} from '@/ai/flows/generate-investment-suggestions';
import {
  analyzeInvestment,
  AnalyzeInvestmentInput,
} from '@/ai/flows/analyze-investment';
import { z } from 'zod';

const suggestionFormSchema = z.object({
  assetType: z.string().min(1, 'Asset type is required.'),
  riskLevel: z.string().min(1, 'Risk level is required.'),
  sector: z.string().optional(),
  locale: z.string(),
});

const analysisFormSchema = z.object({
  tickerSymbol: z.string().min(1, 'Ticker symbol is required.'),
  locale: z.string(),
});

export async function getInvestmentSuggestions(formData: GenerateInvestmentSuggestionsInput) {
  const validatedData = suggestionFormSchema.safeParse(formData);

  if (!validatedData.success) {
    const errorMessages = validatedData.error.errors.map(e => e.message).join(', ');
    throw new Error(`Invalid input: ${errorMessages}`);
  }

  try {
    const suggestions = await generateInvestmentSuggestions(validatedData.data);
    return suggestions;
  } catch (error) {
    console.error("Error generating investment suggestions:", error);
    throw new Error('Failed to communicate with the AI service. Please try again later.');
  }
}

export async function getInvestmentAnalysis(formData: AnalyzeInvestmentInput) {
  const validatedData = analysisFormSchema.safeParse(formData);

  if (!validatedData.success) {
    const errorMessages = validatedData.error.errors.map(e => e.message).join(', ');
    throw new Error(`Invalid input: ${errorMessages}`);
  }

  try {
    const analysis = await analyzeInvestment(validatedData.data);
    return analysis;
  } catch (error) {
    console.error("Error generating investment analysis:", error);
    throw new Error('Failed to communicate with the AI service. Please try again later.');
  }
}
