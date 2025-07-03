"use client";

import { useState } from "react";
import { Rocket, Lightbulb } from "lucide-react";
import { useTranslations } from 'next-intl';

import InvestmentFilters from "@/components/investment-filters";
import SuggestionCard from "@/components/suggestion-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateInvestmentSuggestionsOutput } from "@/ai/flows/generate-investment-suggestions";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "@/components/language-switcher";

export default function Home() {
  const [suggestions, setSuggestions] = useState<GenerateInvestmentSuggestionsOutput['suggestions']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 pt-6 flex justify-end">
        <LanguageSwitcher />
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        <InvestmentFilters
          setSuggestions={setSuggestions}
          setIsLoading={setIsLoading}
          setError={setError}
        />

        <div className="mt-8">
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16 bg-card border border-destructive/50 rounded-lg">
              <p className="text-destructive font-semibold">{t('errorOccurred')}</p>
              <p className="text-muted-foreground mt-2">{error}</p>
            </div>
          )}

          {!isLoading && !error && suggestions.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <Card className="w-full">
              <CardContent className="text-center py-16">
                  <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                    <Lightbulb className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">{t('readyForIdeasTitle')}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {t('readyForIdeasSubtitle')}
                  </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>
          {t.rich('disclaimer', {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </footer>
    </div>
  );
}
