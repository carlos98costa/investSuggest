"use client";

import * as React from "react";
import { BrainCircuit, PieChart, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";
import type { GeneratePortfolioSuggestionOutput } from "@/ai/flows/generate-portfolio-suggestion";

interface PortfolioResultCardProps {
  portfolio: GeneratePortfolioSuggestionOutput;
}

export default function PortfolioResultCard({ portfolio }: PortfolioResultCardProps) {
  const t = useTranslations('PortfolioResultCard');
  const { summary, portfolio: assets } = portfolio;

  const chartData = assets.map((asset, index) => ({
    name: asset.tickerSymbol,
    value: asset.allocationPercentage,
    fill: `hsl(var(--chart-${index + 1}))`,
    assetName: asset.assetName,
  }));

  const chartConfig = assets.reduce((acc, asset, index) => {
    acc[asset.tickerSymbol] = {
      label: `${asset.tickerSymbol} (${asset.assetName})`,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return acc;
  }, {});

  return (
    <Card className="bg-secondary/30 hover:border-primary/50 transition-all duration-300 w-full">
      <CardHeader>
        <div className="flex items-center">
            <BrainCircuit className="mr-3 h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('aiPortfolioSuggestion')}</CardTitle>
        </div>
        <CardDescription className="pt-2">{t('summary')}</CardDescription>
        <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
          {summary}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2">
                 <h4 className="flex items-center font-semibold text-lg mb-4 text-center justify-center">
                    <PieChart className="mr-2 h-5 w-5 text-accent" />
                    {t('assetAllocation')}
                </h4>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip 
                            cursor={false}
                            content={<ChartTooltipContent 
                                hideLabel
                                formatter={(value, name) => (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold">{chartConfig[name].label}</span>
                                        <span className="text-muted-foreground">{t('allocation')}: {value}%</span>
                                    </div>
                                )}
                            />} 
                        />
                        <Pie 
                            data={chartData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={110} 
                            innerRadius={60}
                            labelLine={false} 
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                                        {name} ({(percent * 100).toFixed(0)}%)
                                    </text>
                                );
                            }}
                        >
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </div>
          <div className="lg:col-span-3">
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">{t('asset')}</TableHead>
                            <TableHead>{t('assetType')}</TableHead>
                            <TableHead className="text-right">{t('allocation')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.map((asset, index) => (
                            <React.Fragment key={index}>
                                <TableRow className="bg-background/20">
                                    <TableCell className="font-medium">
                                        <div>{asset.assetName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{asset.tickerSymbol}</div>
                                    </TableCell>
                                    <TableCell>{asset.assetType}</TableCell>
                                    <TableCell className="text-right font-mono">{asset.allocationPercentage}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3} className="py-2 px-4 bg-background/5">
                                        <p className="text-xs text-muted-foreground"><strong className="text-foreground/80">{t('rationale')}:</strong> {asset.rationale}</p>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
