// src/app/(main)/scheduled-interview/[interview_id]/details/_components/charts/chart-bar-multiple.tsx
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface ChartBarMultipleProps {
    data: Array<{
        skill: string;
        rating: number;
    }>;
    config: Record<string, { label: string; color: string }>;
    title?: string;
    description?: string;
}

export function ChartBarMultiple({
    data,
    config,
    title = "Bar Chart - Multiple",
    description = "Performance metrics across categories"
}: ChartBarMultipleProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                            right: 12,
                            left: 12,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="skill"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="rating"
                            fill="var(--color-rating)"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Performance metrics <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Based on all candidate evaluations
                </div>
            </CardFooter>
        </Card>
    );
}