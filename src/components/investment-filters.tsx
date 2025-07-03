"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BarChart, ShieldCheck, BriefcaseBusiness, Loader2, Wand2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getInvestmentSuggestions } from "@/app/actions";
import type { GenerateInvestmentSuggestionsOutput } from "@/ai/flows/generate-investment-suggestions";

const formSchema = z.object({
  assetType: z.string({ required_error: "Please select an asset type." }),
  riskLevel: z.string({ required_error: "Please select a risk level." }),
  sector: z.string().optional(),
});

interface InvestmentFiltersProps {
  setSuggestions: (suggestions: GenerateInvestmentSuggestionsOutput['suggestions']) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export default function InvestmentFilters({ setSuggestions, setIsLoading, setError }: InvestmentFiltersProps) {
  const t = useTranslations('InvestmentFilters');
  const locale = useLocale();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sector: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await getInvestmentSuggestions({ ...values, locale });
      if (result && result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setError(t('noSuggestionsError'));
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: t('toastErrorTitle'),
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t('cardTitle')}</CardTitle>
        <CardDescription>
          {t('cardDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><BarChart className="mr-2 h-4 w-4" />{t('assetTypeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('assetTypePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stocks">{t('assetTypeStocks')}</SelectItem>
                        <SelectItem value="currencies">{t('assetTypeCurrencies')}</SelectItem>
                        <SelectItem value="funds">{t('assetTypeFunds')}</SelectItem>
                        <SelectItem value="fixed income">{t('assetTypeFixedIncome')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4" />{t('riskLevelLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('riskLevelPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t('riskLevelLow')}</SelectItem>
                        <SelectItem value="medium">{t('riskLevelMedium')}</SelectItem>
                        <SelectItem value="high">{t('riskLevelHigh')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><BriefcaseBusiness className="mr-2 h-4 w-4" />{t('sectorLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('sectorPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {t('submitButton')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
