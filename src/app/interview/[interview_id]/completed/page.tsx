"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Briefcase, CheckCircle2, Clock, Download, Home, Mail, Share2, Star, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../../services/supabaseClient";
import { DetailedReportDialog } from "./_components/DetailedReportDialog";

interface FeedbackData {
    rating: {
        technicalSkills: number;
        communication: number;
        problemSolving: number;
        experience: number;
    };
    summary: string;
    recommendation: boolean;
    recommendationMsg: string;
}

interface InterviewFeedbackRecord {
    id: number;
    interview_id: string;
    userName: string;
    userEmail: string;
    feedback: any;
    recommended: boolean;
    created_at: string;
    updated_at: string;
}

export default function InterviewCompleted() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.interview_id as string;
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showImage, setShowImage] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [interviewFeedbackId, setInterviewFeedbackId] = useState<number | null>(null);
    const [candidateEmail, setCandidateEmail] = useState<string>('');

    useEffect(() => {
        // Show content with delay for smooth animation
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 500);

        // Try to get candidate email from localStorage
        const storedCandidateInfo = localStorage.getItem(`candidate_info_${interviewId}`);
        if (storedCandidateInfo) {
            try {
                const { email } = JSON.parse(storedCandidateInfo);
                setCandidateEmail(email);
            } catch (error) {
                console.error('Error parsing candidate info:', error);
            }
        }

        fetchFeedback();

        return () => clearTimeout(timer);
    }, [interviewId]);

    const fetchFeedback = async () => {
        try {
            console.log('🔍 Fetching feedback for interview:', interviewId);

            // FIRST: Try to get feedback ID from localStorage (set by room page)
            const storedFeedbackId = localStorage.getItem(`feedback_id_${interviewId}`);
            if (storedFeedbackId) {
                const feedbackId = parseInt(storedFeedbackId);
                setInterviewFeedbackId(feedbackId);
                console.log('📝 Using stored feedback ID:', feedbackId);

                // Fetch by ID
                const { data, error } = await supabase
                    .from('Interview-Feedback')
                    .select('*')
                    .eq('id', feedbackId)
                    .maybeSingle();

                if (error) {
                    console.error('Supabase error (by ID):', error);
                    // Fall back to other methods
                    fetchFeedbackFallback();
                    return;
                }

                if (data) {
                    console.log('✅ Found feedback by ID:', data.id);
                    processFeedbackData(data);
                    return;
                }
            }

            // SECOND: Try to get by email if we have it
            if (candidateEmail) {
                console.log('🔍 Trying to find feedback by email:', candidateEmail);
                const { data, error } = await supabase
                    .from('Interview-Feedback')
                    .select('*')
                    .eq('interview_id', interviewId)
                    .eq('userEmail', candidateEmail)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error('Supabase error (by email):', error);
                    fetchFeedbackFallback();
                    return;
                }

                if (data) {
                    console.log('✅ Found feedback by email:', data.id);
                    setInterviewFeedbackId(data.id);
                    processFeedbackData(data);
                    return;
                }
            }

            // THIRD: Fallback - get the most recent feedback for this interview
            fetchFeedbackFallback();

        } catch (error) {
            console.error('Unexpected error:', error);
            setLoading(false);
        }
    };

    const fetchFeedbackFallback = async () => {
        console.log('🔄 Using fallback method to fetch feedback');
        const { data, error } = await supabase
            .from('Interview-Feedback')
            .select('*')
            .eq('interview_id', interviewId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Supabase fallback error:', error);
            setLoading(false);
            return;
        }

        if (!data) {
            console.log('❌ No feedback found at all');
            setLoading(false);
            return;
        }

        console.log('⚠️ Found feedback (fallback):', data.id);
        setInterviewFeedbackId(data.id);
        processFeedbackData(data);
    };

    const processFeedbackData = (data: InterviewFeedbackRecord) => {
        console.log('📊 Processing feedback data:', {
            id: data.id,
            hasFeedback: !!data.feedback,
            feedbackType: typeof data.feedback
        });

        // Parse the feedback if it's stored as string
        let feedbackData = data.feedback;
        if (typeof feedbackData === 'string') {
            try {
                feedbackData = JSON.parse(feedbackData);
            } catch (parseError) {
                console.error('Failed to parse feedback JSON:', parseError);
                setLoading(false);
                return;
            }
        }

        if (feedbackData) {
            console.log('✅ Setting feedback state:', {
                rating: feedbackData.rating,
                summary: feedbackData.summary?.substring(0, 50) + '...'
            });
            setFeedback(feedbackData);
        } else {
            console.log('⚠️ Feedback data is null or undefined');
        }

        setLoading(false);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-100/10 to-cyan-100/10 rounded-full blur-2xl animate-ping delay-500"></div>
            </div>

            <div className="relative z-10 px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Main Completion Card */}
                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/30 overflow-hidden mb-8">
                        <div className="p-8 md:p-12">
                            {/* Success Animation Section */}
                            <div className="flex flex-col items-center justify-center mb-8">
                                <div className="relative w-48 h-48 mb-6">
                                    <div className="relative">
                                        <img
                                            src="/completed.png"
                                            alt="Interview Completed"
                                            className="w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-white/20 animate-scale-in"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full animate-pulse"></div>
                                    </div>
                                    {/* Animated Ring */}
                                    <div className="absolute inset-0 border-4 border-green-400/30 rounded-full animate-ping"></div>
                                </div>
                            </div>

                            {/* Content Section with Animation */}
                            <div className={`text-center space-y-6 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}>
                                {/* Main Heading */}
                                <div className="space-y-3">
                                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        Interview Completed!
                                    </h1>
                                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                        Great job! You've successfully completed your AI-powered interview session.
                                    </p>
                                </div>

                                {/* Next Steps Section */}
                                <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-white" />
                                        </div>
                                        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                            What's Next?
                                        </h2>
                                    </div>

                                    <div className="space-y-4 text-left max-w-2xl mx-auto">
                                        <p className="text-gray-700 text-center text-lg font-medium">
                                            The recruiter will review your interview responses and will contact you soon regarding the next steps.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                            <div className="flex flex-col items-center p-4 bg-white/60 rounded-xl border border-blue-100">
                                                <Mail className="w-8 h-8 text-blue-500 mb-2" />
                                                <span className="text-sm font-medium text-gray-700 text-center">Email Notification</span>
                                                <span className="text-xs text-gray-500 text-center mt-1">You'll receive updates via email</span>
                                            </div>

                                            <div className="flex flex-col items-center p-4 bg-white/60 rounded-xl border border-green-100">
                                                <User className="w-8 h-8 text-green-500 mb-2" />
                                                <span className="text-sm font-medium text-gray-700 text-center">Profile Review</span>
                                                <span className="text-xs text-gray-500 text-center mt-1">Recruiter reviews your performance</span>
                                            </div>

                                            <div className="flex flex-col items-center p-4 bg-white/60 rounded-xl border border-purple-100">
                                                <Briefcase className="w-8 h-8 text-purple-500 mb-2" />
                                                <span className="text-sm font-medium text-gray-700 text-center">Next Steps</span>
                                                <span className="text-xs text-gray-500 text-center mt-1">Technical rounds or offer discussion</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Highlights */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-orange-200">
                                        <Award className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                        <div className="text-lg font-bold text-orange-600">AI Analyzed</div>
                                        <div className="text-xs text-orange-500">Performance</div>
                                    </div>

                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-200">
                                        <Star className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                        <div className="text-lg font-bold text-blue-600">Recorded</div>
                                        <div className="text-xs text-blue-500">Session Saved</div>
                                    </div>

                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-green-200">
                                        <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                        <div className="text-lg font-bold text-green-600">Completed</div>
                                        <div className="text-xs text-green-500">All Questions</div>
                                    </div>

                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-200">
                                        <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                        <div className="text-lg font-bold text-purple-600">Pending</div>
                                        <div className="text-xs text-purple-500">Review</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback and Detailed Report Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Feedback Summary */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Interview Feedback
                                    {loading && (
                                        <div className="ml-2 inline-block">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Overall assessment of your performance
                                    {interviewFeedbackId && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            (Feedback ID: {interviewFeedbackId})
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {feedback ? (
                                    <>
                                        {/* Ratings */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(feedback.rating).map(([key, value]) => (
                                                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <div className={`text-2xl font-bold ${getRatingColor(value)}`}>
                                                        {value}
                                                    </div>
                                                    <div className="text-sm text-gray-600 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">/10</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Summary */}
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {feedback.summary}
                                            </p>
                                        </div>

                                        {/* Recommendation */}
                                        <div className={`p-4 rounded-lg ${feedback.recommendation ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={feedback.recommendation ? "default" : "secondary"}>
                                                    {feedback.recommendation ? "Recommended" : "Needs Improvement"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                {feedback.recommendationMsg}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        {loading ? (
                                            <>
                                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p>Generating your feedback...</p>
                                                <p className="text-sm mt-2">This may take a moment.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p>Feedback analysis is not available yet.</p>
                                                <p className="text-sm mt-2">Please wait a few moments and refresh the page.</p>
                                                <Button
                                                    onClick={fetchFeedback}
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4"
                                                >
                                                    Try Again
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions Panel */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <DetailedReportDialog
                                    interviewFeedbackId={interviewFeedbackId}
                                    trigger={
                                        <Button
                                            className="w-full justify-start gap-2 cursor-pointer"
                                            variant="outline"
                                            disabled={!interviewFeedbackId}
                                        >
                                            <Download className="w-4 h-4" />
                                            View Detailed Report
                                        </Button>
                                    }
                                />

                                <Button className="w-full justify-start gap-2 cursor-pointer" variant="outline">
                                    <Share2 className="w-4 h-4" />
                                    Share Results
                                </Button>

                                <Button
                                    className="w-full justify-start gap-2 cursor-pointer"
                                    variant="outline"
                                    onClick={() => router.push('/')}
                                >
                                    <Home className="w-4 h-4" />
                                    Back to Home
                                </Button>

                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold text-sm mb-2">Quick Tips</h4>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• Review your detailed report for improvement areas</li>
                                        <li>• Practice similar questions</li>
                                        <li>• Focus on your communication skills</li>
                                        <li>• Schedule another interview to track progress</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add some custom animations */}
            <style jsx global>{`
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
