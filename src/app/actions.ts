'use server';

import { 
  generateInvestmentSuggestions, 
  GenerateInvestmentSuggestionsInput 
} from '@/ai/flows/generate-investment-suggestions';
import { z } from 'zod';

const formSchema = z.object({
  assetType: z.string().min(1, 'Asset type is required.'),
  riskLevel: z.string().min(1, 'Risk level is required.'),
  sector: z.string().optional(),
  locale: z.string(),
});

export async function getInvestmentSuggestions(formData: GenerateInvestmentSuggestionsInput) {
  const validatedData = formSchema.safeParse(formData);

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
