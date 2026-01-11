// src/app/(main)/scheduled-interview/[interview_id]/details/_components/interview-analytics.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eachMonthOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns";
import { Award, BarChart3, Brain, Lightbulb, MessageCircle, PieChart, Star, Target, TrendingUp, Users } from "lucide-react";
import { ChartAreaStacked } from "./charts/chart-area-stacked";
import { ChartBarMultiple } from "./charts/chart-bar-multiple";
import { ChartLineDots } from "./charts/chart-line-dots";
import { ChartPieDonut } from "./charts/chart-pie-donut";
import { ChartRadialText } from "./charts/chart-radial-text";
import { CandidatePerformance, InterviewConversation, InterviewFeedback } from "./types";

interface InterviewAnalyticsProps {
    interviews: any[];
    candidatePerformances: CandidatePerformance[];
    feedbacks: InterviewFeedback[];
    conversations: InterviewConversation[];
}

export function InterviewAnalytics({ interviews, candidatePerformances, feedbacks, conversations }: InterviewAnalyticsProps) {

    // Calculate monthly trends with real data
    const getMonthlyData = () => {
        const last6Months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        return last6Months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const monthInterviews = interviews.filter(i => {
                const date = parseISO(i.created_at);
                return date >= monthStart && date <= monthEnd;
            });

            const monthPerformances = candidatePerformances.filter(p => {
                const date = parseISO(p.interview.created_at);
                return date >= monthStart && date <= monthEnd;
            });

            const monthRatings = monthPerformances
                .map(p => p.avgRating)
                .filter(r => r > 0);

            const avgRating = monthRatings.length > 0
                ? monthRatings.reduce((a, b) => a + b, 0) / monthRatings.length
                : 0;

            const completedCount = monthPerformances.length;
            const completionRate = monthInterviews.length > 0
                ? (completedCount / monthInterviews.length) * 100
                : 0;

            return {
                month: format(month, 'MMM'),
                interviews: monthInterviews.length,
                candidates: monthPerformances.length,
                avgRating: Number(avgRating.toFixed(1)),
                completionRate: Number(completionRate.toFixed(1))
            };
        });
    };

    // Calculate rating distribution from candidate performances
    const getRatingDistribution = () => {
        const distribution = {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0
        };

        candidatePerformances.forEach(performance => {
            const rating = performance.avgRating || 0;
            if (rating >= 8) distribution.excellent++;
            else if (rating >= 6) distribution.good++;
            else if (rating >= 4) distribution.average++;
            else if (rating > 0) distribution.poor++;
        });

        return distribution;
    };

    // Calculate skill-wise performance from candidate performances
    const getSkillPerformance = () => {
        if (candidatePerformances.length === 0) return [];

        const technicalAvg = candidatePerformances.reduce((sum, p) => sum + (p.technicalRating || 0), 0) / candidatePerformances.length;
        const communicationAvg = candidatePerformances.reduce((sum, p) => sum + (p.communicationRating || 0), 0) / candidatePerformances.length;
        const problemSolvingAvg = candidatePerformances.reduce((sum, p) => sum + (p.problemSolvingRating || 0), 0) / candidatePerformances.length;
        const experienceAvg = candidatePerformances.reduce((sum, p) => sum + (p.experienceRating || 0), 0) / candidatePerformances.length;

        return [
            { skill: 'Technical Skills', rating: Number(technicalAvg.toFixed(1)), count: candidatePerformances.length },
            { skill: 'Communication', rating: Number(communicationAvg.toFixed(1)), count: candidatePerformances.length },
            { skill: 'Problem Solving', rating: Number(problemSolvingAvg.toFixed(1)), count: candidatePerformances.length },
            { skill: 'Experience', rating: Number(experienceAvg.toFixed(1)), count: candidatePerformances.length }
        ];
    };

    // Position-wise analytics
    const getPositionStats = () => {
        const positionMap = new Map<string, {
            total: number;
            candidates: number;
            totalRating: number;
            ratingCount: number;
            recommended: number;
        }>();

        candidatePerformances.forEach(performance => {
            const position = performance.interview.jobPosition;
            if (!positionMap.has(position)) {
                positionMap.set(position, {
                    total: 0,
                    candidates: 0,
                    totalRating: 0,
                    ratingCount: 0,
                    recommended: 0
                });
            }
            const stats = positionMap.get(position)!;
            stats.total++;
            stats.candidates++;

            if (performance.avgRating > 0) {
                stats.totalRating += performance.avgRating;
                stats.ratingCount++;
            }

            if (performance.feedback?.recommended) stats.recommended++;
        });

        return Array.from(positionMap.entries())
            .map(([position, stats]) => ({
                position,
                count: stats.total,
                candidates: stats.candidates,
                avgRating: stats.ratingCount > 0 ? Number((stats.totalRating / stats.ratingCount).toFixed(1)) : 0,
                recommendationRate: stats.candidates > 0 ? Number(((stats.recommended / stats.candidates) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    // Interview type distribution
    const getTypeDistribution = () => {
        const types = interviews.reduce((acc: Record<string, number>, interview) => {
            const type = interview.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(types).map(([type, count]) => ({
            type,
            count: count as number,
            percentage: interviews.length > 0 ? Number(((count as number / interviews.length) * 100).toFixed(1)) : 0
        }));
    };

    const monthlyData = getMonthlyData();
    const ratingDistribution = getRatingDistribution();
    const skillPerformance = getSkillPerformance();
    const positionStats = getPositionStats();
    const typeDistribution = getTypeDistribution();

    // Calculate overall metrics
    const totalRatings = candidatePerformances.filter(p => p.avgRating > 0);
    const averageRating = totalRatings.length > 0
        ? totalRatings.reduce((sum, p) => sum + p.avgRating, 0) / totalRatings.length
        : 0;

    const recommendationRate = candidatePerformances.length > 0
        ? (candidatePerformances.filter(p => p.feedback?.recommended).length / candidatePerformances.length) * 100
        : 0;

    // Chart configurations
    const areaChartConfig = {
        interviews: { label: "Interviews", color: "hsl(var(--chart-1))" },
        candidates: { label: "Candidates", color: "hsl(var(--chart-2))" },
    };

    const lineChartConfig = {
        avgRating: { label: "Avg Rating", color: "hsl(var(--chart-3))" },
    };

    const donutData = [
        { category: "Excellent (8-10)", value: ratingDistribution.excellent, fill: "hsl(var(--chart-1))" },
        { category: "Good (6-7.9)", value: ratingDistribution.good, fill: "hsl(var(--chart-2))" },
        { category: "Average (4-5.9)", value: ratingDistribution.average, fill: "hsl(var(--chart-3))" },
        { category: "Poor (0-3.9)", value: ratingDistribution.poor, fill: "hsl(var(--chart-4))" },
    ];

    const donutConfig = {
        excellent: { label: "Excellent", color: "hsl(var(--chart-1))" },
        good: { label: "Good", color: "hsl(var(--chart-2))" },
        average: { label: "Average", color: "hsl(var(--chart-3))" },
        poor: { label: "Poor", color: "hsl(var(--chart-4))" },
    };

    const skillChartData = skillPerformance.map(skill => ({
        skill: skill.skill,
        rating: skill.rating
    }));

    const skillChartConfig = {
        rating: { label: "Rating", color: "hsl(var(--chart-1))" }
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageRating.toFixed(1)}
                            <span className="text-sm text-gray-500">/10</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">From {totalRatings.length} candidates</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recommendation Rate</CardTitle>
                        <Target className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recommendationRate.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {candidatePerformances.filter(p => p.feedback?.recommended).length} of {candidatePerformances.length} candidates
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversations.length}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Across {candidatePerformances.length} candidates
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Position</CardTitle>
                        <Award className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {positionStats[0]?.position?.split(' ').slice(0, 2).join(' ') || "N/A"}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {positionStats[0]?.count || 0} candidates
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different analytics views */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full md:w-auto grid-cols-3">
                    <TabsTrigger value="overview" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="distribution" className="gap-2">
                        <PieChart className="w-4 h-4" />
                        Distribution
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChartAreaStacked
                            data={monthlyData}
                            config={areaChartConfig}
                            title="Interview Trends"
                            description="Monthly interview and candidate counts over the last 6 months"
                        />
                        <ChartLineDots
                            data={monthlyData}
                            config={lineChartConfig}
                            title="Rating Trends"
                            description="Average candidate ratings by month"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Performance Summary</CardTitle>
                            <CardDescription>Detailed month-by-month breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {monthlyData.map((month, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <span className="text-lg font-bold text-blue-600">{month.month}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{month.interviews} Interviews</p>
                                                <p className="text-sm text-gray-500">{month.candidates} Candidates completed</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="font-bold">{month.avgRating}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">{month.completionRate}% completed</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChartRadialText
                            value={recommendationRate}
                            label="Recommendation Rate"
                            description="Percentage of candidates recommended for hire"
                        />

                        <ChartBarMultiple
                            data={skillChartData}
                            config={skillChartConfig}
                            title="Skill Performance"
                            description="Average ratings across different skill categories"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Positions by Performance</CardTitle>
                            <CardDescription>Most active roles with detailed metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {positionStats.map((stat, index) => (
                                    <div key={stat.position} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-white">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{stat.position}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {stat.count} candidates
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="font-bold">{stat.avgRating}</span>
                                                </div>
                                                <p className="text-sm text-green-600">{stat.recommendationRate}% recommended</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                style={{ width: `${(stat.count / Math.max(...positionStats.map(s => s.count))) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {positionStats.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No position data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {skillPerformance.map((skill) => (
                            <Card key={skill.skill}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{skill.skill}</CardTitle>
                                    {skill.skill === 'Technical Skills' && <Brain className="w-4 h-4 text-blue-500" />}
                                    {skill.skill === 'Communication' && <MessageCircle className="w-4 h-4 text-green-500" />}
                                    {skill.skill === 'Problem Solving' && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                                    {skill.skill === 'Experience' && <Award className="w-4 h-4 text-purple-500" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{skill.rating}/10</div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                        <div
                                            className={`h-full rounded-full ${skill.rating >= 7 ? 'bg-green-500' :
                                                skill.rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${skill.rating * 10}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Distribution Tab */}
                <TabsContent value="distribution" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ChartPieDonut
                            data={donutData}
                            config={donutConfig}
                            title="Rating Distribution"
                            description="Candidate performance breakdown by rating ranges"
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Interview Types</CardTitle>
                                <CardDescription>Distribution by interview format</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {typeDistribution.map((type) => (
                                        <div key={type.type} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${type.type === 'technical' ? 'bg-blue-500' :
                                                        type.type === 'behavioral' ? 'bg-green-500' :
                                                            type.type === 'mixed' ? 'bg-purple-500' : 'bg-gray-500'
                                                        }`} />
                                                    <span className="font-medium capitalize">{type.type}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold">{type.count}</span>
                                                    <span className="text-gray-500">({type.percentage}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className={`h-full rounded-full ${type.type === 'technical' ? 'bg-blue-500' :
                                                        type.type === 'behavioral' ? 'bg-green-500' :
                                                            type.type === 'mixed' ? 'bg-purple-500' : 'bg-gray-500'
                                                        }`}
                                                    style={{ width: `${type.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Insights</CardTitle>
                            <CardDescription>Key findings from the data</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 border rounded-lg bg-blue-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-blue-900">Best Performing Month</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {monthlyData.reduce((max, m) => m.avgRating > max.avgRating ? m : max, monthlyData[0])?.month || 'N/A'}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Average rating: {monthlyData.reduce((max, m) => m.avgRating > max.avgRating ? m : max, monthlyData[0])?.avgRating || 0}
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg bg-green-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-900">Most Active Position</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-600 truncate">
                                        {positionStats[0]?.position || 'N/A'}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {positionStats[0]?.candidates || 0} candidates • {positionStats[0]?.avgRating || 0} avg rating
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg bg-purple-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="w-5 h-5 text-purple-600" />
                                        <span className="font-semibold text-purple-900">Top Skill</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {skillPerformance.reduce((max, s) => s.rating > max.rating ? s : max, skillPerformance[0])?.skill || 'N/A'}
                                    </p>
                                    <p className="text-sm text-purple-700">
                                        {skillPerformance.reduce((max, s) => s.rating > max.rating ? s : max, skillPerformance[0])?.rating || 0}/10 average
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg bg-yellow-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-5 h-5 text-yellow-600" />
                                        <span className="font-semibold text-yellow-900">Success Rate</span>
                                    </div>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {recommendationRate.toFixed(0)}%
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        {candidatePerformances.filter(p => p.feedback?.recommended).length} candidates recommended
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
