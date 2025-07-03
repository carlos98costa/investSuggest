"use client";

import { TrendingUp, TrendingDown, Minus, BrainCircuit } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SuggestionCardProps {
  suggestion: {
    assetName: string;
    tickerSymbol: string;
    recommendation: string;
    rationale: string;
  };
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const t = useTranslations('SuggestionCard');
  const { assetName, tickerSymbol, recommendation, rationale } = suggestion;

  const getRecommendationStyle = (rec: string) => {
    switch (rec.toLowerCase()) {
      case "buy":
        return {
          variant: "default",
          icon: <TrendingUp className="h-4 w-4" />,
          className: "bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30",
        };
      case "sell":
        return {
          variant: "destructive",
          icon: <TrendingDown className="h-4 w-4" />,
          className: "bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/30",
        };
      case "hold":
      default:
        return {
          variant: "secondary",
          icon: <Minus className="h-4 w-4" />,
          className: "bg-gray-600/20 text-gray-400 border-gray-600/30 hover:bg-gray-600/30",
        };
    }
  };

  const getRecommendationKey = (rec: string): 'buy' | 'sell' | 'hold' => {
    const lowerRec = rec.toLowerCase();
    if (lowerRec === 'buy') return 'buy';
    if (lowerRec === 'sell') return 'sell';
    return 'hold';
  };

  const recommendationStyle = getRecommendationStyle(recommendation);
  const localizedRecommendation = t(getRecommendationKey(recommendation));

  return (
    <Card className="flex flex-col h-full bg-secondary/30 hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl">{assetName}</CardTitle>
                <CardDescription className="font-mono text-sm text-primary">{tickerSymbol}</CardDescription>
            </div>
            <Badge variant={recommendationStyle.variant} className={`${recommendationStyle.className} gap-1 shrink-0`}>
                {recommendationStyle.icon}
                <span>{localizedRecommendation}</span>
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Separator className="my-4" />
        <div className="space-y-4">
          <h4 className="flex items-center font-semibold text-base">
            <BrainCircuit className="mr-2 h-5 w-5 text-accent" />
            {t('aiRationale')}
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {rationale}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
