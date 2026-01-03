// src/app/(main)/scheduled-interview/[interview_id]/details/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    ArrowLeft, Calendar, Clock, User, Briefcase, FileText, Star,
    MessageSquare, Download, Copy, CheckCircle, XCircle, Users,
    PieChart, Home, Brain, TrendingUp, Award, BarChart3
} from "lucide-react";
import { supabase } from "../../../../../../services/supabaseClient";
import { InterviewConversation } from "./_components/types";


export default function InterviewDetailsPage() {
    const params = useParams();
    const interviewId = params.interview_id as string;

    const [interview, setInterview] = useState<any | null>(null);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [conversations, setConversations] = useState<InterviewConversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviewDetails();
    }, [interviewId]);

    const fetchInterviewDetails = async () => {
        try {
            const [interviewRes, feedbacksRes, conversationsRes] = await Promise.all([
                supabase.from('Interviews').select('*').eq('interview_id', interviewId).single(),
                supabase.from('Interview-Feedback').select('*').eq('interview_id', interviewId),
                supabase.from('Interview-Conversation').select('*').eq('interview_id', interviewId)
            ]);

            setInterview(interviewRes.data);
            setFeedbacks(feedbacksRes.data || []);
            setConversations(conversationsRes.data || []);
        } catch (error) {
            console.error('Error fetching interview details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getQuestionText = (question: any): string => {
        if (typeof question === 'string') return question;
        if (question?.question) return question.question;
        return JSON.stringify(question).slice(0, 100);
    };

    const getJobDescriptionText = (description: any): string => {
        if (typeof description === 'string') return description;
        if (description?.description) return description.description;
        return JSON.stringify(description).slice(0, 200);
    };

    const calculateDetailedRating = (feedback: any) => {
        try {
            if (!feedback.feedback?.rating) return null;
            const ratingObj = feedback.feedback.rating;
            const ratings = Object.entries(ratingObj)
                .filter(([_, value]) => typeof value === 'number')
                .map(([key, value]) => ({
                    category: key.replace(/([A-Z])/g, ' $1').trim(),
                    rating: value as number
                }));
            
            const avg = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;

            return { ratings, average: avg };
        } catch (error) {
            return null;
        }
    };

    const getCandidateConversationStats = (candidateEmail: string) => {
        const candidateConvs = conversations;
        if (candidateConvs.length === 0) return null;

        return {
            total: candidateConvs.length,
            avgTechnical: candidateConvs.reduce((s, c) => s + (c.technical_skill_rating || 0), 0) / candidateConvs.length,
            avgCommunication: candidateConvs.reduce((s, c) => s + (c.communication_rating || 0), 0) / candidateConvs.length,
            avgProblemSolving: candidateConvs.reduce((s, c) => s + (c.problem_solving_rating || 0), 0) / candidateConvs.length,
            avgExperience: candidateConvs.reduce((s, c) => s + (c.experience_relevance_rating || 0), 0) / candidateConvs.length,
            avgOverall: candidateConvs.reduce((s, c) => s + (c.overall_rating || 0), 0) / candidateConvs.length
        };
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Not Found</h2>
                    <p className="text-gray-600 mb-6">The requested interview could not be found.</p>
                    <Button asChild>
                        <Link href="/scheduled-interview">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Interviews
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    let questionListArray: any[] = [];
    try {
        if (typeof interview.questionList === 'string') {
            questionListArray = JSON.parse(interview.questionList);
        } else if (Array.isArray(interview.questionList)) {
            questionListArray = interview.questionList;
        }
    } catch (error) {
        questionListArray = [];
    }

    // Calculate aggregate stats
    const totalResponses = conversations.length;
    const avgOverallRating = totalResponses > 0
        ? conversations.reduce((s, c) => s + (c.overall_rating || 0), 0) / totalResponses
        : 0;

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/scheduled-interview">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Interview Details</h1>
                        <p className="text-gray-600">ID: {interview.interview_id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Link
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            Total Candidates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{feedbacks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-500" />
                            Total Responses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalResponses}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            Avg Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgOverallRating.toFixed(1)}/10</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                            Recommended
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {feedbacks.filter(f => f.recommended).length}/{feedbacks.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        {interview.jobPosition}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {getJobDescriptionText(interview.jobDescription)}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-lg px-3 py-1">
                                    {interview.type}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        Date
                                    </div>
                                    <p className="font-medium">
                                        {format(new Date(interview.schedule_date), 'PPP')}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        Time
                                    </div>
                                    <p className="font-medium">{interview.schedule_time}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        Duration
                                    </div>
                                    <p className="font-medium">{interview.duration}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FileText className="w-4 h-4" />
                                        Questions
                                    </div>
                                    <p className="font-medium">{questionListArray.length}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-3">Questions List</h3>
                                <div className="grid gap-2">
                                    {questionListArray.map((question, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <Badge variant="outline" className="mt-1 shrink-0">
                                                {index + 1}
                                            </Badge>
                                            <p className="text-sm flex-1">{getQuestionText(question)}</p>
                                        </div>
                                    ))}
                                    {questionListArray.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No questions available</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Candidates Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Performance</CardTitle>
                            <CardDescription>Detailed feedback for each candidate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feedbacks.map((feedback) => {
                                    const ratingData = calculateDetailedRating(feedback);
                                    const stats = getCandidateConversationStats(feedback.userEmail);

                                    return (
                                        <div key={feedback.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{feedback.userName || feedback.userEmail.split('@')[0]}</p>
                                                        <p className="text-sm text-gray-500">{feedback.userEmail}</p>
                                                    </div>
                                                </div>
                                                {feedback.recommended ? (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Recommended
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Not Recommended
                                                    </Badge>
                                                )}
                                            </div>

                                            {stats && (
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                        <Brain className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                                                        <div className="text-lg font-bold">{stats.avgTechnical.toFixed(1)}</div>
                                                        <div className="text-xs text-gray-600">Technical</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <MessageSquare className="w-4 h-4 mx-auto mb-1 text-green-600" />
                                                        <div className="text-lg font-bold">{stats.avgCommunication.toFixed(1)}</div>
                                                        <div className="text-xs text-gray-600">Communication</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                        <Award className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
                                                        <div className="text-lg font-bold">{stats.avgProblemSolving.toFixed(1)}</div>
                                                        <div className="text-xs text-gray-600">Problem Solving</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                        <BarChart3 className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                                                        <div className="text-lg font-bold">{stats.avgExperience.toFixed(1)}</div>
                                                        <div className="text-xs text-gray-600">Experience</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                                        <Star className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                                                        <div className="text-lg font-bold">{stats.avgOverall.toFixed(1)}</div>
                                                        <div className="text-xs text-gray-600">Overall</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>{stats?.total || 0} responses</span>
                                                <span className="mx-2">•</span>
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(new Date(feedback.created_at), 'MMM dd, yyyy')}</span>
                                            </div>

                                            {feedback.feedback?.summary && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-sm text-gray-700">{feedback.feedback.summary}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="flex-1">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            View Full Feedback
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Detailed Feedback</DialogTitle>
                                                            <DialogDescription>
                                                                Complete evaluation for {feedback.userName || feedback.userEmail}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            {ratingData && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {ratingData.ratings.map((rating) => (
                                                                        <div key={rating.category} className="p-4 bg-gray-50 rounded-lg">
                                                                            <div className="text-sm text-gray-600 capitalize">{rating.category}</div>
                                                                            <div className="text-2xl font-bold mt-1">{rating.rating}</div>
                                                                            <div className="text-sm text-gray-500">/10</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {feedback.feedback?.summary && (
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Summary</h4>
                                                                    <p className="text-gray-700">{feedback.feedback.summary}</p>
                                                                </div>
                                                            )}
                                                            {feedback.feedback?.recommendationMsg && (
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Recommendation</h4>
                                                                    <p className="text-gray-700">{feedback.feedback.recommendationMsg}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    );
                                })}
                                {feedbacks.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="w-12 h-12 opacity-50 mx-auto mb-2" />
                                        <p>No candidates have completed this interview yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Candidates</span>
                                    <span className="font-bold">{feedbacks.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Recommended</span>
                                    <span className="font-bold text-green-600">
                                        {feedbacks.filter(f => f.recommended).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Not Recommended</span>
                                    <span className="font-bold text-red-600">
                                        {feedbacks.filter(f => !f.recommended).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Responses</span>
                                    <span className="font-bold">{totalResponses}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Avg Rating</span>
                                    <span className="font-bold">{avgOverallRating.toFixed(1)}/10</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <Download className="w-4 h-4" />
                                Export All Data
                            </Button>
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <Copy className="w-4 h-4" />
                                Copy Interview Link
                            </Button>
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <Calendar className="w-4 h-4" />
                                Reschedule
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}