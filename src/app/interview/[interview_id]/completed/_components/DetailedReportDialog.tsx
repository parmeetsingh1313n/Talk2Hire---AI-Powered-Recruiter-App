// src/components/detailed-report-dialog.tsx
"use client";
import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    MessageCircle,
    Star,
    TrendingUp,
    Zap,
    Users,
    Lightbulb,
    Target,
    CheckCircle2,
    AlertCircle,
    X
} from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { ChartPieDonut } from "./ChartPieDonut";
import { ConversationRecord, getStoredConversationHistory } from "../../../../../../services/groqService";

interface DetailedReportDialogProps {
    interviewId: string;
    trigger?: React.ReactNode;
}

export function DetailedReportDialog({ interviewId, trigger }: DetailedReportDialogProps) {
    const [conversationHistory, setConversationHistory] = useState<ConversationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [overallStats, setOverallStats] = useState({
        technical: 0,
        communication: 0,
        problemSolving: 0,
        experience: 0,
        overall: 0
    });

    useEffect(() => {
        loadConversationHistory();
    }, [interviewId]);

    const loadConversationHistory = async () => {
        try {
            setLoading(true);
            // Use getStoredConversationHistory instead of getConversationHistory
            const history = await getStoredConversationHistory(interviewId);
            setConversationHistory(history);

            // Calculate overall stats
            if (history.length > 0) {
                const stats = history.reduce((acc: any, record: any) => ({
                    technical: acc.technical + (record.technical_skill_rating || 0),
                    communication: acc.communication + (record.communication_rating || 0),
                    problemSolving: acc.problemSolving + (record.problem_solving_rating || 0),
                    experience: acc.experience + (record.experience_relevance_rating || 0),
                    overall: acc.overall + (record.overall_rating || 0)
                }), { technical: 0, communication: 0, problemSolving: 0, experience: 0, overall: 0 });

                const count = history.length;
                setOverallStats({
                    technical: Math.round(stats.technical / count),
                    communication: Math.round(stats.communication / count),
                    problemSolving: Math.round(stats.problemSolving / count),
                    experience: Math.round(stats.experience / count),
                    overall: Math.round(stats.overall / count)
                });
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return "text-green-600";
        if (rating >= 6) return "text-yellow-600";
        return "text-red-600";
    };

    const getRatingBg = (rating: number) => {
        if (rating >= 8) return "bg-green-100 text-green-800";
        if (rating >= 6) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const chartData = [
        { category: "Technical Skills", value: overallStats.technical, fill: "var(--color-technical)" },
        { category: "Communication", value: overallStats.communication, fill: "var(--color-communication)" },
        { category: "Problem Solving", value: overallStats.problemSolving, fill: "var(--color-problemSolving)" },
        { category: "Experience", value: overallStats.experience, fill: "var(--color-experience)" },
    ];

    const chartConfig = {
        technical: {
            label: "Technical Skills",
            color: "var(--chart-1)",
        },
        communication: {
            label: "Communication",
            color: "var(--chart-2)",
        },
        problemSolving: {
            label: "Problem Solving",
            color: "var(--chart-3)",
        },
        experience: {
            label: "Experience Relevance",
            color: "var(--chart-4)",
        },
    };

    if (loading) {
        return (
            <Drawer>
                <DrawerTrigger asChild>
                    {trigger || <Button variant="outline">See Detailed Report</Button>}
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh]">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading detailed report...</p>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                {trigger || <Button variant="outline">See Detailed Report</Button>}
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] overflow-hidden">
                <div className="overflow-y-auto">
                    <DrawerHeader className="text-left pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <DrawerTitle className="text-2xl flex items-center gap-2">
                                    <MessageCircle className="w-6 h-6" />
                                    Interview Detailed Analysis Report
                                </DrawerTitle>
                                <DrawerDescription className="mt-2">
                                    Comprehensive analysis of your interview performance with question-by-question feedback
                                </DrawerDescription>
                            </div>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    <div className="space-y-6 p-6">
                        {/* Overall Performance Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Overall Performance Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Ratings Overview */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg">Skill Ratings</h4>
                                        {[
                                            { label: "Technical Skills", value: overallStats.technical, icon: Zap },
                                            { label: "Communication", value: overallStats.communication, icon: MessageCircle },
                                            { label: "Problem Solving", value: overallStats.problemSolving, icon: Lightbulb },
                                            { label: "Experience Relevance", value: overallStats.experience, icon: Users },
                                        ].map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-medium">{label}</span>
                                                    </div>
                                                    <Badge className={getRatingBg(value)}>
                                                        {value}/10
                                                    </Badge>
                                                </div>
                                                <Progress value={value * 10} className="h-2" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Donut Chart */}
                                    <div className="flex flex-col items-center justify-center">
                                        <ChartPieDonut data={chartData} config={chartConfig} />
                                        <div className="text-center mt-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Star className="w-5 h-5 text-yellow-500" />
                                                <span className="text-2xl font-bold">{overallStats.overall}/10</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Overall Score</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question-by-Question Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Detailed Question Analysis
                                </CardTitle>
                                <CardDescription>
                                    {conversationHistory.length} questions analyzed with personalized feedback
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {conversationHistory.map((record, index) => (
                                        <AccordionItem key={record.id || index} value={`item-${record.id || index}`}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex items-start gap-4 text-left">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-blue-600">
                                                            {record.question_sequence}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {record.question_type}
                                                            </Badge>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-yellow-500" />
                                                                <span className={`text-sm font-semibold ${getRatingColor(record.overall_rating || 0)}`}>
                                                                    {record.overall_rating}/10
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-medium truncate">
                                                            {record.ai_question}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                                                    {/* Question & Answer Section */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                                                <MessageCircle className="w-4 h-4" />
                                                                Your Answer
                                                            </h4>
                                                            <div className="bg-white p-3 rounded border text-sm">
                                                                {record.candidate_answer || "No answer provided"}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                Expected Answer
                                                            </h4>
                                                            <div className="bg-green-50 p-3 rounded border text-sm">
                                                                {record.expected_answer}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* AI Response */}
                                                    {record.ai_response && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                                                <Users className="w-4 h-4" />
                                                                Interviewer's Response
                                                            </h4>
                                                            <div className="bg-blue-50 p-3 rounded border text-sm">
                                                                {record.ai_response}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Ratings Grid */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {[
                                                            { label: "Technical", value: record.technical_skill_rating, icon: Zap },
                                                            { label: "Communication", value: record.communication_rating, icon: MessageCircle },
                                                            { label: "Problem Solving", value: record.problem_solving_rating, icon: Lightbulb },
                                                            { label: "Experience", value: record.experience_relevance_rating, icon: Users },
                                                        ].map(({ label, value, icon: Icon }) => (
                                                            <div key={label} className="text-center p-3 bg-white rounded-lg border">
                                                                <Icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                                                <div className="text-2xl font-bold text-gray-800">{value || 0}</div>
                                                                <div className="text-xs text-gray-600">{label}</div>
                                                                <div className="text-xs text-gray-500">/10</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Improvement Feedback */}
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Improvement Feedback
                                                        </h4>
                                                        <div className="bg-yellow-50 p-3 rounded border text-sm">
                                                            {record.improvement_feedback}
                                                        </div>
                                                    </div>

                                                    {/* Analysis Insights */}
                                                    {record.analysis_insights && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                                                <Lightbulb className="w-4 h-4" />
                                                                Key Insights
                                                            </h4>
                                                            <div className="bg-purple-50 p-3 rounded border text-sm">
                                                                {record.analysis_insights}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Keywords Matched */}
                                                    {record.keywords_matched && record.keywords_matched.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                                                Keywords Identified
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {record.keywords_matched.map((keyword, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {keyword}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>

                                {conversationHistory.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No conversation analysis available yet.</p>
                                        <p className="text-sm">Complete an interview to see detailed feedback.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}