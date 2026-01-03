"use client";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartPieDonutProps {
  data: { category: string; value: number; fill: string }[];
  config: Record<string, { label: string; color: string }>;
  title?: string;
  description?: string;
}

export function ChartPieDonut({ data, config, title = "Skill Distribution", description = "Performance across different categories" }: ChartPieDonutProps) {
  // Calculate total for percentage display
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.category}</p>
                <p className="text-xs text-gray-500">
                  {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}