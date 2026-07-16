// src/app/(main)/scheduled-interview/page.tsx
"use client";

import { format, isPast, isToday, parseISO } from "date-fns";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Briefcase, Calendar, CalendarDays, CheckCircle, ChevronRight, Clock, Clock4, Download, Filter, Search, User, Users, XCircle, Award, Star, TrendingUp, Target } from "lucide-react";
import { supabase } from "../../../../services/supabaseClient";
import { DashboardStats } from "./[interview_id]/details/_components/dashboard-stats";
import { InterviewAnalytics } from "./[interview_id]/details/_components/interview-analytics";
import { CandidatePerformance, Interview, InterviewConversation, InterviewFeedback } from "./[interview_id]/details/_components/types";
import { useUser } from '@/app/provider';

export default function ScheduledInterviewsPage() {
    const { user } = useUser() as {
        user: {
            email?: string,
            name?: string,
            picture?: string
        }
    };

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
    const [conversations, setConversations] = useState<InterviewConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [candidatePerformances, setCandidatePerformances] = useState<CandidatePerformance[]>([]);

    // New filters for Candidates tab
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [recommendationFilter, setRecommendationFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<string>("all");

    useEffect(() => {
        if (user?.email) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            // Fetch interviews ONLY for the logged-in user
            const { data: interviewsData, error: interviewsError } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user?.email)  // Filter by logged-in user's email
                .order('created_at', { ascending: false });

            if (interviewsError) {
                console.error('Error fetching interviews:', interviewsError);
                return;
            }

            if (interviewsData) {
                setInterviews(interviewsData);

                // Get interview IDs for fetching related data
                const interviewIds = interviewsData.map(i => i.interview_id);

                // Fetch feedbacks for these interviews
                const { data: feedbacksData } = await supabase
                    .from('Interview-Feedback')
                    .select('*')
                    .in('interview_id', interviewIds);

                // Fetch conversations for these interviews
                const { data: conversationsData } = await supabase
                    .from('Interview-Conversation')
                    .select('*')
                    .in('interview_id', interviewIds);

                if (feedbacksData) setFeedbacks(feedbacksData);
                if (conversationsData) setConversations(conversationsData);

                // Calculate performances
                const performances = calculateCandidatePerformances(
                    interviewsData,
                    feedbacksData || [],
                    conversationsData || []
                );
                setCandidatePerformances(performances);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique positions from candidate performances
    const uniquePositions = useMemo(() => {
        const positions = candidatePerformances
            .map(p => p.interview.jobPosition)
            .filter((value, index, self) => self.indexOf(value) === index);
        return positions.sort();
    }, [candidatePerformances]);

    // Filter candidate performances based on all criteria
    const filteredCandidatePerformances = useMemo(() => {
        return candidatePerformances.filter(performance => {
            // Filter by position
            const matchesPosition = positionFilter === "all" || performance.interview.jobPosition === positionFilter;

            // Filter by recommendation
            let matchesRecommendation = true;
            if (recommendationFilter === "recommended") {
                matchesRecommendation = performance.feedback?.recommended === true;
            } else if (recommendationFilter === "not-recommended") {
                matchesRecommendation = performance.feedback?.recommended === false;
            }

            // Filter by rating
            let matchesRating = true;
            if (ratingFilter === "excellent" && performance.avgRating < 8) matchesRating = false;
            if (ratingFilter === "good" && (performance.avgRating < 6 || performance.avgRating >= 8)) matchesRating = false;
            if (ratingFilter === "average" && (performance.avgRating < 4 || performance.avgRating >= 6)) matchesRating = false;
            if (ratingFilter === "poor" && performance.avgRating >= 4) matchesRating = false;

            return matchesPosition && matchesRecommendation && matchesRating;
        });
    }, [candidatePerformances, positionFilter, recommendationFilter, ratingFilter]);

    // Get candidate email from feedback for a specific performance
    const getCandidateEmail = (performance: CandidatePerformance): string => {
        return performance.feedback?.userEmail || performance.interview.userEmail || 'No email';
    };

    // Get candidate name from feedback for a specific performance
    const getCandidateName = (performance: CandidatePerformance): string => {
        return performance.feedback?.userName ||
            getCandidateEmail(performance).split('@')[0] ||
            'Candidate';
    };

    const calculateCandidatePerformances = (
        interviewsData: Interview[],
        feedbacksData: InterviewFeedback[],
        conversationsData: InterviewConversation[]
    ): CandidatePerformance[] => {
        const performances: CandidatePerformance[] = [];

        for (const interview of interviewsData) {
            const interviewFeedbacks = feedbacksData.filter(f => f.interview_id === interview.interview_id);

            for (const feedback of interviewFeedbacks) {
                // Get conversations for this specific feedback using interview_feedback_id
                const candidateConversations = conversationsData.filter(
                    c => c.interview_feedback_id === feedback.id
                );

                // Calculate average rating from Interview-Feedback table's rating JSON
                let avgRating = 0;
                let technicalRating = 0;
                let communicationRating = 0;
                let problemSolvingRating = 0;
                let experienceRating = 0;

                if (feedback.feedback?.rating) {
                    const rating = feedback.feedback.rating;
                    technicalRating = rating.technicalSkills || 0;
                    communicationRating = rating.communication || 0;
                    problemSolvingRating = rating.problemSolving || 0;
                    experienceRating = rating.experience || 0;

                    // Calculate overall average (assuming ratings are out of 10)
                    const ratingsArray = [
                        technicalRating,
                        communicationRating,
                        problemSolvingRating,
                        experienceRating
                    ].filter(r => r > 0);

                    if (ratingsArray.length > 0) {
                        avgRating = ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length;
                    }
                } else {
                    // Fallback to conversation ratings if feedback rating doesn't exist
                    if (candidateConversations.length > 0) {
                        technicalRating = candidateConversations.reduce((sum, c) => sum + (c.technical_skill_rating || 0), 0) / candidateConversations.length;
                        communicationRating = candidateConversations.reduce((sum, c) => sum + (c.communication_rating || 0), 0) / candidateConversations.length;
                        problemSolvingRating = candidateConversations.reduce((sum, c) => sum + (c.problem_solving_rating || 0), 0) / candidateConversations.length;
                        experienceRating = candidateConversations.reduce((sum, c) => sum + (c.experience_relevance_rating || 0), 0) / candidateConversations.length;
                        avgRating = candidateConversations.reduce((sum, c) => sum + (c.overall_rating || 0), 0) / candidateConversations.length;
                    }
                }

                performances.push({
                    interview,
                    feedback,
                    conversations: candidateConversations,
                    conversationCount: candidateConversations.length,
                    avgRating,
                    technicalRating,
                    communicationRating,
                    problemSolvingRating,
                    experienceRating
                });
            }
        }

        return performances;
    };

    const getInterviewStatus = (scheduleDate: string, scheduleTime: string) => {
        try {
            const scheduleDateTime = parseISO(`${scheduleDate}T${scheduleTime}`);
            if (isPast(scheduleDateTime)) return "completed";
            if (isToday(scheduleDateTime)) return "today";
            return "upcoming";
        } catch (error) {
            return "unknown";
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            completed: <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>,
            today: <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Today</Badge>,
            upcoming: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Upcoming</Badge>,
        };
        return badges[status as keyof typeof badges] || <Badge variant="outline">Unknown</Badge>;
    };

    const getJobDescriptionText = (description: any): string => {
        if (typeof description === 'string') return description;
        if (description?.description) return description.description;
        if (description?.text) return description.text;
        return JSON.stringify(description).slice(0, 100);
    };

    const filteredInterviews = interviews.filter(interview => {
        const matchesSearch =
            interview.jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.interview_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === "all" || interview.type === typeFilter;
        const status = getInterviewStatus(interview.schedule_date, interview.schedule_time);
        const matchesStatus = statusFilter === "all" || status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => getInterviewStatus(i.schedule_date, i.schedule_time) === "completed").length;
    const todayInterviews = interviews.filter(i => getInterviewStatus(i.schedule_date, i.schedule_time) === "today").length;
    const totalCandidates = candidatePerformances.length;
    const avgCompletionRate = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;

    // Get stats for candidates tab
    const recommendedCandidates = candidatePerformances.filter(p => p.feedback?.recommended).length;
    const averageRating = candidatePerformances.length > 0
        ? candidatePerformances.reduce((sum, p) => sum + p.avgRating, 0) / candidatePerformances.length
        : 0;
    const topPosition = uniquePositions.length > 0
        ? uniquePositions[0]
        : "No positions";

    // If user is not logged in, show loading
    if (!user?.email) {
        return (
            <div className="container mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Scheduled Interviews</h1>
                    <p className="text-gray-600">Manage and monitor your interview sessions</p>
                    <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Logged in as: {user.email}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="gap-2" asChild>
                        <Link href="/dashboard/create-interview">
                            <Calendar className="w-4 h-4" />
                            Schedule New
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <DashboardStats
                totalInterviews={totalInterviews}
                completedInterviews={completedInterviews}
                todayInterviews={todayInterviews}
                totalCandidates={totalCandidates}
                avgCompletionRate={avgCompletionRate}
            />

            {/* Main Content */}
            <Tabs defaultValue="interviews" className="space-y-6">
                <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="interviews" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Interviews
                    </TabsTrigger>
                    <TabsTrigger value="candidates" className="gap-2">
                        <Users className="w-4 h-4" />
                        Candidates
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Calendar
                    </TabsTrigger>
                </TabsList>

                {/* Interviews Tab */}
                <TabsContent value="interviews" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Your Interviews</CardTitle>
                                    <CardDescription>Manage scheduled interviews and view details</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search interviews..."
                                            className="pl-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <Filter className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <div className="p-2 space-y-2">
                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Status</SelectItem>
                                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                                        <SelectItem value="today">Today</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Types</SelectItem>
                                                        <SelectItem value="technical">Technical</SelectItem>
                                                        <SelectItem value="behavioral">Behavioral</SelectItem>
                                                        <SelectItem value="mixed">Mixed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Schedule</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInterviews.map((interview) => (
                                                <TableRow key={interview.id}>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p className="font-semibold">{interview.jobPosition}</p>
                                                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                                                {getJobDescriptionText(interview.jobDescription)}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            <div>
                                                                <p className="font-medium">{interview.userEmail.split('@')[0]}</p>
                                                                <p className="text-xs text-gray-500">{interview.userEmail}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm">{format(parseISO(interview.schedule_date), 'MMM dd, yyyy')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm">{interview.schedule_time}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{interview.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(getInterviewStatus(interview.schedule_date, interview.schedule_time))}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock4 className="w-4 h-4 text-gray-400" />
                                                            <span>{interview.duration}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/scheduled-interview/${interview.interview_id}/details`}>
                                                                View Details
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredInterviews.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Briefcase className="w-12 h-12 opacity-50" />
                                                            <p>No interviews found</p>
                                                            <p className="text-sm">
                                                                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                                                                    ? "Try adjusting your search or filters"
                                                                    : "You haven't scheduled any interviews yet"}
                                                            </p>
                                                            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                                                                <Button asChild className="mt-2">
                                                                    <Link href="/dashboard/create-interview">
                                                                        Schedule Your First Interview
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Candidates Tab */}
                <TabsContent value="candidates" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Candidates Performance</CardTitle>
                                    <CardDescription>View and filter candidate performance across your interviews</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="gap-1">
                                        <Award className="w-3 h-3" />
                                        {recommendedCandidates} Recommended
                                    </Badge>
                                    <Badge variant="outline" className="gap-1">
                                        <Star className="w-3 h-3" />
                                        {averageRating.toFixed(1)} Avg Rating
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filter Section */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1 space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Filter by Position</label>
                                        <Select value={positionFilter} onValueChange={setPositionFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Positions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Positions</SelectItem>
                                                {uniquePositions.map(position => (
                                                    <SelectItem key={position} value={position}>
                                                        {position}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Filter by Recommendation</label>
                                        <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Candidates" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Candidates</SelectItem>
                                                <SelectItem value="recommended">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        Recommended
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="not-recommended">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                        Not Recommended
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Filter by Rating</label>
                                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Ratings" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Ratings</SelectItem>
                                                <SelectItem value="excellent">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                        Excellent (8-10)
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="good">
                                                    <div className="flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-blue-600" />
                                                        Good (6-7.9)
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="average">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-600" />
                                                        Average (4-5.9)
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="poor">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                        Poor (Below 4)
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-3 rounded-lg border">
                                            <p className="text-sm text-gray-500">Total Candidates</p>
                                            <p className="text-2xl font-bold">{filteredCandidatePerformances.length}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border">
                                            <p className="text-sm text-gray-500">Avg Rating</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {filteredCandidatePerformances.length > 0
                                                    ? (filteredCandidatePerformances.reduce((sum, p) => sum + p.avgRating, 0) / filteredCandidatePerformances.length).toFixed(1)
                                                    : "0.0"}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border">
                                            <p className="text-sm text-gray-500">Positions</p>
                                            <p className="text-lg font-semibold">{uniquePositions.length}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border">
                                            <p className="text-sm text-gray-500">Completed</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                {filteredCandidatePerformances.filter(p =>
                                                    getInterviewStatus(p.interview.schedule_date, p.interview.schedule_time) === "completed"
                                                ).length}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Clear Filters Button */}
                                    {(positionFilter !== "all" || recommendationFilter !== "all" || ratingFilter !== "all") && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setPositionFilter("all");
                                                setRecommendationFilter("all");
                                                setRatingFilter("all");
                                            }}
                                            className="w-full mt-3"
                                        >
                                            Clear All Filters
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Questions</TableHead>
                                                <TableHead>Avg Rating</TableHead>
                                                <TableHead>Recommendation</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCandidatePerformances.map((performance) => (
                                                <TableRow key={performance.feedback?.id || performance.interview.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-8 h-8 rounded-full ${performance.feedback?.recommended ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
                                                                <User className={`w-4 h-4 ${performance.feedback?.recommended ? 'text-green-600' : 'text-blue-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{getCandidateName(performance)}</p>
                                                                <p className="text-xs text-gray-500">{getCandidateEmail(performance)}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p>{performance.interview.jobPosition}</p>
                                                            <p className="text-xs text-gray-500">{performance.interview.type}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">{format(parseISO(performance.interview.schedule_date), 'MMM dd, yyyy')}</div>
                                                            <div className="text-xs text-gray-500">{performance.interview.schedule_time}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(getInterviewStatus(performance.interview.schedule_date, performance.interview.schedule_time))}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{performance.conversationCount}</span>
                                                            <span className="text-xs text-gray-500">questions</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 bg-gray-100 rounded-full h-2">
                                                                <div
                                                                    className={`h-full rounded-full ${performance.avgRating >= 8 ? 'bg-green-500' :
                                                                        performance.avgRating >= 6 ? 'bg-blue-500' :
                                                                            performance.avgRating >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${Math.min(performance.avgRating * 10, 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-sm font-medium">{performance.avgRating.toFixed(1)}/10</span>
                                                                <div className="text-xs text-gray-500">
                                                                    {performance.avgRating >= 8 ? 'Excellent' :
                                                                        performance.avgRating >= 6 ? 'Good' :
                                                                            performance.avgRating >= 4 ? 'Average' : 'Poor'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {performance.feedback?.recommended ? (
                                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Recommended
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-gray-600 gap-1">
                                                                <XCircle className="w-3 h-3" />
                                                                Not Recommended
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/scheduled-interview/${performance.interview.interview_id}/details`}>
                                                                Details
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredCandidatePerformances.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Users className="w-12 h-12 opacity-50" />
                                                            <p>No candidate data available</p>
                                                            <p className="text-sm">
                                                                {positionFilter !== "all" || recommendationFilter !== "all" || ratingFilter !== "all"
                                                                    ? "Try adjusting your filters"
                                                                    : "Candidates will appear here after completing interviews"}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                    <InterviewAnalytics
                        interviews={interviews}
                        candidatePerformances={candidatePerformances}
                        feedbacks={feedbacks}
                        conversations={conversations}
                    />
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Calendar</CardTitle>
                            <CardDescription>View your scheduled interviews on calendar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg p-4">
                                {interviews.length > 0 ? (
                                    <div className="space-y-3">
                                        {interviews.slice(0, 10).map(interview => (
                                            <div key={interview.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{interview.jobPosition}</p>
                                                    <p className="text-sm text-gray-600">{interview.userEmail}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{format(parseISO(interview.schedule_date), 'MMM dd')}</p>
                                                    <p className="text-sm text-gray-600">{interview.schedule_time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No interviews scheduled</p>
                                        <p className="text-sm mt-2">Schedule your first interview to see it here</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
