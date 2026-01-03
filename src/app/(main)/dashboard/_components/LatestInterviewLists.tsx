"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Zap, Loader2, RefreshCw } from "lucide-react";
import { useUser } from "@/app/provider";
// Ensure this path is correct and InterviewCard is the 'default' export
import  InterviewCard from "./InterviewCard";
import Link from "next/link";
import { supabase } from "../../../../../services/supabaseClient";

interface Interview {
    id: string; // Supabase usually returns id as number/bigint, but keeping string if you handle conversion
    interview_id: string;
    jobPosition: string;
    jobDescription?: string;
    duration: string;
    type: string; // or string[] based on your previous schema
    questionList?: any[];
    created_at: string;
    userEmail: string;
    schedule_date?: string;
    schedule_time?: string;
    validity?: number;
    service_type?: string;
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

            // Safe cast or mapping if needed
            setInterviewList((interviews as unknown as Interview[]) || []);
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
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-[220px] bg-slate-100 rounded-2xl animate-pulse border border-slate-200"></div>
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
                    <Link href="/dashboard/interviews">
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            {interviewList.length === 0 ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 rounded-3xl p-12 text-center border border-slate-200/50">
                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-100 via-blue-100 to-sky-100 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Zap className="w-10 h-10 text-cyan-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to Transform Hiring?</h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                            Create your first AI-powered interview and experience the future of recruitment technology
                        </p>
                        <Link href="/dashboard/create-interview">
                            <Button className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-600 text-white rounded-2xl font-semibold shadow-xl hover:scale-105 transition-all">
                                <Plus className="w-5 h-5 mr-2" />
                                Create Your First Interview
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {interviewList.map((interview) => (
                        <InterviewCard
                            key={interview.interview_id}
                            interview={interview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default LatestInterviewLists;