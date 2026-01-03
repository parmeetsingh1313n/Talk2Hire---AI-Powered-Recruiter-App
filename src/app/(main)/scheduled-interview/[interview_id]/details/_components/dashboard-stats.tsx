// src/app/(main)/scheduled-interview/[interview_id]/details/_components/dashboard-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, TrendingDown, Minus } from "lucide-react";

interface DashboardStatsProps {
    totalInterviews: number;
    completedInterviews: number;
    todayInterviews: number;
    totalCandidates: number;
    avgCompletionRate: number;
}

export function DashboardStats({
    totalInterviews,
    completedInterviews,
    todayInterviews,
    totalCandidates,
    avgCompletionRate
}: DashboardStatsProps) {
    // Calculate trends (you can make these real by comparing with previous period data)
    const getTrendIcon = (value: number) => {
        if (value > 0) return <TrendingUp className="w-3 h-3 text-green-600" />;
        if (value < 0) return <TrendingDown className="w-3 h-3 text-red-600" />;
        return <Minus className="w-3 h-3 text-gray-600" />;
    };

    const getTrendColor = (value: number) => {
        if (value > 0) return "text-green-600";
        if (value < 0) return "text-red-600";
        return "text-gray-600";
    };

    const stats = [
        {
            title: "Total Interviews",
            value: totalInterviews,
            icon: Briefcase,
            description: "All scheduled",
            color: "bg-blue-500",
            bgColor: "bg-blue-50",
            trend: 12,
            trendLabel: "vs last month"
        },
        {
            title: "Completed",
            value: completedInterviews,
            icon: CheckCircle,
            description: `${avgCompletionRate.toFixed(1)}% rate`,
            color: "bg-green-500",
            bgColor: "bg-green-50",
            trend: 8,
            trendLabel: "vs last month"
        },
        {
            title: "Today's Interviews",
            value: todayInterviews,
            icon: Clock,
            description: "Scheduled today",
            color: "bg-yellow-500",
            bgColor: "bg-yellow-50",
            trend: 0,
            trendLabel: "today"
        },
        {
            title: "Total Candidates",
            value: totalCandidates,
            icon: Users,
            description: "Participated",
            color: "bg-purple-500",
            bgColor: "bg-purple-50",
            trend: 15,
            trendLabel: "vs last month"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: `var(--${stat.color})` }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        <p className="text-xs text-gray-500">{stat.description}</p>
                        <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(stat.trend)}`}>
                            {getTrendIcon(stat.trend)}
                            <span>
                                {stat.trend > 0 ? '+' : ''}{stat.trend}% {stat.trendLabel}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}