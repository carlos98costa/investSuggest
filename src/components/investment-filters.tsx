"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BarChart, ShieldCheck, BriefcaseBusiness, Loader2, Wand2, Search, LineChart, Wallet, DollarSign } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getInvestmentSuggestions, getInvestmentAnalysis, getPortfolioSuggestion } from "@/app/actions";
import type { GenerateInvestmentSuggestionsOutput } from "@/ai/flows/generate-investment-suggestions";
import type { AnalyzeInvestmentOutput } from "@/ai/flows/analyze-investment";
import type { GeneratePortfolioSuggestionOutput } from "@/ai/flows/generate-portfolio-suggestion";


const formSchema = z.object({
  assetType: z.string().optional(),
  riskLevel: z.string().optional(),
  sector: z.string().optional(),
  tickerSymbol: z.string().optional(),
  investmentAmount: z.coerce.number().optional(),
});

interface InvestmentFiltersProps {
  setSuggestions: (suggestions: GenerateInvestmentSuggestionsOutput['suggestions']) => void;
  setAnalysis: (analysis: AnalyzeInvestmentOutput | null) => void;
  setPortfolio: (portfolio: GeneratePortfolioSuggestionOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

export default function InvestmentFilters({ setSuggestions, setAnalysis, setPortfolio, setIsLoading, setError, clearResults }: InvestmentFiltersProps) {
  const t = useTranslations('InvestmentFilters');
  const locale = useLocale();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suggestions");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sector: "",
      tickerSymbol: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    clearResults();

    try {
      if (activeTab === "suggestions") {
        if (!values.assetType || !values.riskLevel) {
            setError("Asset type and risk level are required for suggestions.");
            toast({
                variant: "destructive",
                title: t('toastErrorTitle'),
                description: "Asset type and risk level are required for suggestions.",
            });
            setIsLoading(false);
            return;
        }
        const result = await getInvestmentSuggestions({ 
          assetType: values.assetType,
          riskLevel: values.riskLevel,
          sector: values.sector,
          locale 
        });
        if (result && result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
        } else {
          setError(t('noSuggestionsError'));
        }
      } else if (activeTab === "analysis") {
        if (!values.tickerSymbol) {
            setError("Ticker symbol is required for analysis.");
            toast({
                variant: "destructive",
                title: t('toastErrorTitle'),
                description: "Ticker symbol is required for analysis.",
            });
            setIsLoading(false);
            return;
        }
        const result = await getInvestmentAnalysis({ tickerSymbol: values.tickerSymbol, locale });
        if (result) {
          setAnalysis(result);
        } else {
          setError(t('noAnalysisError'));
        }
      } else { // activeTab === "portfolio"
        if (!values.investmentAmount || !values.riskLevel) {
            setError("Investment amount and risk level are required for portfolio suggestions.");
            toast({
                variant: "destructive",
                title: t('toastErrorTitle'),
                description: "Investment amount and risk level are required.",
            });
            setIsLoading(false);
            return;
        }
        const result = await getPortfolioSuggestion({ 
          investmentAmount: values.investmentAmount,
          riskLevel: values.riskLevel,
          locale 
        });
        if (result && result.portfolio && result.portfolio.length > 0) {
          setPortfolio(result);
        } else {
          setError(t('noPortfolioError'));
        }
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
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          clearResults();
          form.reset();
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions"><Wand2 className="mr-2 h-4 w-4" />{t('suggestionsTab')}</TabsTrigger>
            <TabsTrigger value="analysis"><Search className="mr-2 h-4 w-4" />{t('analysisTab')}</TabsTrigger>
            <TabsTrigger value="portfolio"><Wallet className="mr-2 h-4 w-4" />{t('portfolioTab')}</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <TabsContent value="suggestions" className="m-0 p-0">
                <div className="space-y-6">
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
                                <SelectItem value="crypto">{t('assetTypeCrypto')}</SelectItem>
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
                </div>
              </TabsContent>
              <TabsContent value="analysis" className="m-0 p-0">
                 <FormField
                    control={form.control}
                    name="tickerSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><LineChart className="mr-2 h-4 w-4" />{t('tickerLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('tickerPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </TabsContent>
              <TabsContent value="portfolio" className="m-0 p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="investmentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />{t('investmentAmountLabel')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder={t('investmentAmountPlaceholder')} 
                              {...field} 
                              value={field.value ?? ''}
                              onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                            />
                          </FormControl>
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
              </TabsContent>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    activeTab === 'suggestions' ? <Wand2 className="mr-2 h-4 w-4" /> : 
                    activeTab === 'analysis' ? <Search className="mr-2 h-4 w-4" /> : 
                    <Wallet className="mr-2 h-4 w-4" />
                  )}
                  {
                    activeTab === 'suggestions' ? t('submitButtonSuggestions') :
                    activeTab === 'analysis' ? t('submitButtonAnalysis') :
                    t('submitButtonPortfolio')
                  }
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
