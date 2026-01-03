"use client"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartAreaStackedProps {
    data: Array<{
        month: string;
        [key: string]: string | number;
    }>;
    config: Record<string, { label: string; color: string }>;
    title?: string;
    description?: string;
}

export function ChartAreaStacked({
    data, 
    config, 
    title = "Area Chart - Stacked",
    description = "Showing total visitors for the last 6 months"
}: ChartAreaStackedProps) {
    // Get all data keys except month
    const dataKeys = data.length > 0 
        ? Object.keys(data[0]).filter(key => key !== 'month')
        : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value: string) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        {dataKeys.map((key) => (
                            <Area
                                key={key}
                                dataKey={key}
                                type="natural"
                                fill={`var(--color-${key})`}
                                fillOpacity={0.4}
                                stroke={`var(--color-${key})`}
                                stackId="a"
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            January - June 2024
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}