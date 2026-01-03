"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Zap, Clock, Calendar, AlertCircle } from "lucide-react";
import { useUser } from "@/app/provider";
import Link from "next/link";
import { supabase } from "../../../../services/supabaseClient";
import InterviewCard from "../dashboard/_components/InterviewCard";

interface Interview {
    id: string;
    interview_id: string;
    jobPosition: string;
    jobDescription?: string;
    duration: string;
    type: string | string[] | null;
    questionList?: any[];
    created_at: string;
    userEmail: string;
    schedule_date?: string | null;
    schedule_time?: string | null;
    validity?: number | null;
}

// Helper function to combine date and time
const combineDateTime = (dateStr: string | null | undefined, timeStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;

    const date = new Date(dateStr);

    if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
    } else {
        date.setHours(0, 0, 0, 0);
    }

    return date;
};

// SVG Icons as components
const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4 10L8 10V14H4V10ZM4 19V16H8V19H4ZM10 19V16H14V19H10ZM16 19V16H20V19H16ZM16 14V10H20V14H16ZM16 8V5H20V8H16ZM14 5V8H10V5H14ZM14 10V14H10V10H14ZM4 8V5H8V8L4 8ZM3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3Z"></path>
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M3 2.9918C3 2.44405 3.44495 2 3.9934 2H20.0066C20.5552 2 21 2.45531 21 2.9918V21.0082C21 21.556 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM19 11V4H5V11H19ZM19 13H5V20H19V13ZM9 6H15V8H9V6ZM9 15H15V17H9V15Z"></path>
    </svg>
);

function AllInterview() {
    const [interviewList, setInterviewList] = useState<Interview[]>([]);
    const [availableInterviews, setAvailableInterviews] = useState<Interview[]>([]);
    const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const itemsPerPage = 8;

    const { user } = useUser() as {
        user: {
            name?: string,
            email?: string,
            picture?: string
        }
    };

    const isInterviewAvailable = (interview: Interview): boolean => {
        if (!interview.schedule_date) {
            return true;
        }

        const scheduleDateTime = combineDateTime(interview.schedule_date, interview.schedule_time);
        if (!scheduleDateTime) return true;

        const now = new Date();
        const validityMinutes = interview.validity || 1440;
        const endTime = new Date(scheduleDateTime.getTime() + (validityMinutes * 60000));
        return now >= scheduleDateTime && now <= endTime;
    };

    const isInterviewScheduled = (interview: Interview): boolean => {
        if (!interview.schedule_date) {
            return false;
        }

        const scheduleDateTime = combineDateTime(interview.schedule_date, interview.schedule_time);
        if (!scheduleDateTime) return false;

        const now = new Date();
        return now < scheduleDateTime;
    };

    const isInterviewExpired = (interview: Interview): boolean => {
        if (!interview.schedule_date) {
            return false;
        }

        const scheduleDateTime = combineDateTime(interview.schedule_date, interview.schedule_time);
        if (!scheduleDateTime) return false;

        const now = new Date();
        const validityMinutes = interview.validity || 1440;
        const endTime = new Date(scheduleDateTime.getTime() + (validityMinutes * 60000));
        return now > endTime;
    };

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            if (!user?.email) {
                console.log('No user email found');
                return;
            }

            const { data: interviews, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching interviews:', error);
                return;
            }

            setInterviewList(interviews || []);
            const allInterviews = interviews || [];
            const available = allInterviews.filter(interview =>
                isInterviewAvailable(interview) && !isInterviewExpired(interview)
            );
            const scheduled = allInterviews.filter(interview =>
                isInterviewScheduled(interview)
            );

            setAvailableInterviews(available);
            setScheduledInterviews(scheduled);
        } catch (error) {
            console.error('Error in fetchInterviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, [user?.email]);

    const formatScheduleDateTime = (dateString: string | null | undefined, timeString: string | null | undefined) => {
        if (!dateString) return "";

        const date = combineDateTime(dateString, timeString || "00:00");
        if (!date) return "";

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getValidityPeriod = (validity: number | null | undefined) => {
        if (!validity) return "24 hours";
        if (validity < 60) return `${validity} minutes`;
        if (validity < 1440) return `${Math.floor(validity / 60)} hours`;
        return `${Math.floor(validity / 1440)} days`;
    };

    const getTimeUntilStart = (scheduleDate: string, scheduleTime?: string | null) => {
        const scheduleDateTime = combineDateTime(scheduleDate, scheduleTime || "00:00");
        if (!scheduleDateTime) return "Starting soon";

        const now = new Date();
        const diff = scheduleDateTime.getTime() - now.getTime();
        if (diff <= 0) return "Starting soon";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}m`;

        return `Starts in ${timeString.trim()}`;
    };

    // Pagination logic
    const totalPages = Math.ceil(availableInterviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentInterviews = availableInterviews.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">All Previous Interviews</h2>
                        <p className="text-slate-600">Track your latest interview activities and results</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white/60 backdrop-blur-sm border-2 border-slate-200/40 rounded-2xl p-6 animate-pulse">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-6 bg-slate-200 rounded w-16 ml-2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 space-y-8">
            {/* Available Interviews Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Active & Available Interviews</h2>
                        <p className="text-slate-600">Interviews that candidates can currently access</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-all cursor-pointer duration-200 ${viewMode === 'grid'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                title="Grid View"
                            >
                                <GridIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`cursor-pointer p-2.5 transition-all duration-200 ${viewMode === 'list'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                title="List View"
                            >
                                <ListIcon />
                            </button>
                        </div>
                        <Link href="/dashboard/create-interview">
                            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer">
                                <Plus className="w-4 h-4 mr-1" />
                                New Interview
                            </Button>
                        </Link>
                    </div>
                </div>

                {availableInterviews.length === 0 ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 rounded-3xl p-12 text-center border border-slate-200/50">
                        <div className="absolute inset-0">
                            <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full animate-pulse"></div>
                            <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-sky-400/10 to-cyan-500/10 rounded-full animate-pulse delay-1000"></div>
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
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {currentInterviews.map((interview) => (
                                    <InterviewCard
                                        key={interview.interview_id}
                                        interview={interview}
                                    />
                                ))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="space-y-3">
                                {currentInterviews.map((interview) => (
                                    <div
                                        key={interview.interview_id}
                                        className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-slate-800 text-lg truncate">
                                                        {interview.jobPosition}
                                                    </h3>
                                                    <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 whitespace-nowrap">
                                                        Active
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{interview.duration}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Created: {new Date(interview.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    {interview.type && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                                                                {Array.isArray(interview.type) ? interview.type.join(', ') : interview.type}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer"
                                                    onClick={() => navigator.clipboard.writeText(
                                                        `${window.location.origin}/interview/${interview.interview_id}`
                                                    )}
                                                >
                                                    Copy Link
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer"
                                                    onClick={() => window.open(
                                                        `${window.location.origin}/interview/${interview.interview_id}`,
                                                        '_blank'
                                                    )}
                                                >
                                                    Preview
                                                </Button>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${currentPage === pageNumber
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-600'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Stats Summary */}
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            <div className="px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/40">
                                <span className="text-sm font-semibold text-cyan-700">
                                    Active Interviews: {availableInterviews.length}
                                </span>
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/40">
                                <span className="text-sm font-semibold text-blue-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Scheduled Interviews Section */}
            {scheduledInterviews.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Upcoming Scheduled Interviews</h2>
                            <p className="text-slate-600">Interviews that will be available in the future</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{scheduledInterviews.length} scheduled</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scheduledInterviews.map((interview) => (
                            <div key={interview.interview_id} className="bg-gradient-to-br from-yellow-50/80 via-amber-50/20 to-orange-50/20 border-2 border-yellow-200/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">{interview.jobPosition}</h3>
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Starts: {formatScheduleDateTime(interview.schedule_date, interview.schedule_time)}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
                                        Scheduled
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200/40">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm font-semibold text-yellow-700">
                                                {interview.duration}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/40">
                                            <Calendar className="w-4 h-4 text-amber-600" />
                                            <span className="text-sm font-semibold text-amber-700">
                                                {getValidityPeriod(interview.validity)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-800">
                                                {getTimeUntilStart(interview.schedule_date!, interview.schedule_time)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-2 border-yellow-200 hover:border-yellow-400 text-yellow-700 hover:bg-yellow-50 cursor-pointer"
                                            onClick={() => navigator.clipboard.writeText(
                                                `${window.location.origin}/interview/${interview.interview_id}`
                                            )}
                                        >
                                            Copy Link
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 cursor-pointer"
                                            onClick={() => window.open(
                                                `${window.location.origin}/interview/${interview.interview_id}`,
                                                '_blank'
                                            )}
                                        >
                                            Preview
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 mb-1">
                                    Note: Scheduled interviews will become available at their specified start time.
                                </p>
                                <p className="text-xs text-amber-700">
                                    Candidates will not be able to access these interviews until the scheduled start time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllInterview;