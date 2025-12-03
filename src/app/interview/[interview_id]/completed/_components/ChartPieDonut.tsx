// src/components/ChartPieDonut.tsx
"use client";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartPieDonutProps {
    data: { category: string; value: number; fill: string }[];
    config: any;
}

export function ChartPieDonut({ data, config }: ChartPieDonutProps) {
    return (
        <Card className="flex flex-col w-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Performance across different categories</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="category"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}