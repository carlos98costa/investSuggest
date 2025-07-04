"use client";

import { TrendingUp, TrendingDown, Minus, BrainCircuit, CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AnalyzeInvestmentOutput } from "@/ai/schemas";

interface AnalysisResultCardProps {
  analysis: AnalyzeInvestmentOutput;
}

export default function AnalysisResultCard({ analysis }: AnalysisResultCardProps) {
  const t = useTranslations('AnalysisResultCard');
  const { assetName, tickerSymbol, recommendation, analysis: analysisText, pros, cons } = analysis;

  const getRecommendationStyle = (rec: string) => {
    switch (rec.toLowerCase()) {
      case "buy":
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          className: "bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30",
        };
      case "sell":
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          className: "bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/30",
        };
      case "hold":
      default:
        return {
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
    <Card className="bg-secondary/30 hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{assetName}</CardTitle>
                <CardDescription className="font-mono text-lg text-primary">{tickerSymbol}</CardDescription>
            </div>
            <Badge className={`${recommendationStyle.className} gap-1 text-base px-4 py-2`}>
                {recommendationStyle.icon}
                <span>{localizedRecommendation}</span>
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        <div>
          <h4 className="flex items-center font-semibold text-lg mb-3">
            <BrainCircuit className="mr-2 h-5 w-5 text-accent" />
            {t('aiAnalysis')}
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {analysisText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="flex items-center font-semibold text-lg mb-3">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              {t('pros')}
            </h4>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-start">
                  <span className="text-green-500 mr-2 mt-1 shrink-0">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center font-semibold text-lg mb-3">
              <XCircle className="mr-2 h-5 w-5 text-red-500" />
              {t('cons')}
            </h4>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-start">
                  <span className="text-red-500 mr-2 mt-1 shrink-0">✗</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
