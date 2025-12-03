"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Zap, Loader2, RefreshCw } from "lucide-react";
import { useUser } from "@/app/provider";
import InterviewCard from "./InterviewCard";
import Link from "next/link";
import { supabase } from "../../../../../services/supabaseClient";

interface Interview {
    id: string;
    interview_id: string;
    jobPosition: string;
    jobDescription?: string;
    duration: string;
    type: string;
    questionList?: any[];
    created_at: string;
    userEmail: string;
}

function LatestInterviewLists() {
    const [interviewList, setInterviewList] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
        const { user } = useUser() as {
            user: {
                name?: string,
                email?: string,
                picture?: string
            }
        };

    const fetchInterviews = async (showRefresh = false) => {
        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            if (!user?.email) {
                console.log('No user email found');
                return;
            }

            console.log('Fetching interviews for:', user.email);

            const { data: interviews, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email)
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) {
                console.error('Error fetching interviews:', error);
                return;
            }

            console.log('Fetched interviews:', interviews);
            setInterviewList(interviews || []);
        } catch (error) {
            console.error('Error in fetchInterviews:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, [user?.email]);

    const handleRefresh = () => {
        fetchInterviews(true);
    };

    if (loading) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Recent Interviews</h2>
                        <p className="text-slate-600">Track your latest interview activities and results</p>
                    </div>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white/60 backdrop-blur-sm border-2 border-slate-200/40 rounded-2xl p-6 animate-pulse"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-6 bg-slate-200 rounded w-16 ml-2"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="h-9 bg-slate-200 rounded flex-1"></div>
                                    <div className="h-9 bg-slate-200 rounded w-20"></div>
                                    <div className="h-9 bg-slate-200 rounded w-12"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Recent Interviews</h2>
                    <p className="text-slate-600">Track your latest interview activities and results</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {interviewList.length === 0 ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 rounded-3xl p-12 text-center border border-slate-200/50">
                    {/* Background decoration */}
                    <div className="absolute inset-0">
                        <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-sky-400/10 to-cyan-500/10 rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-blue-400/10 to-sky-500/10 rounded-full animate-bounce"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-100 via-blue-100 to-sky-100 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Zap className="w-10 h-10 text-cyan-500" />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to Transform Hiring?</h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                            Create your first AI-powered interview and experience the future of recruitment technology
                        </p>

                        <Link href="/dashboard/create-interview">
                            <Button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-600 text-white rounded-2xl font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 cursor-pointer">
                                <Plus className="w-5 h-5" />
                                Create Your First Interview
                                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {interviewList.map((interview) => (
                                <InterviewCard
                                    key={interview.interview_id}
                                    interview={interview}
                                />
                            ))}
                        </div>

                    {/* Stats Summary */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        <div className="px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/40">
                            <span className="text-sm font-semibold text-cyan-700">
                                Total Interviews: {interviewList.length}
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/40">
                            <span className="text-sm font-semibold text-blue-700">
                                Latest: {new Date(interviewList[0]?.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default LatestInterviewLists;