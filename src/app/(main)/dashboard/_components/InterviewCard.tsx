"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Copy, Check, Clock, List, ExternalLink,
    AlertCircle, Lock, Timer, Video, Mic, MoreHorizontal,
    CalendarClock, Smartphone, Boxes
} from "lucide-react";
import { toast } from "sonner";
import { EmailDialog } from "./EmailDialog";
import { useUser } from "@/app/provider";

// --- Types based on your Schema ---
interface Interview {
    id: string | number;
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
    service_type?: string;
}

interface InterviewCardProps {
    interview?: Interview | null;
}

// --- Helper Functions ---
const combineDateTime = (dateStr: string | null, timeStr: string | null): Date | null => {
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

// Simple utility to join class names if you don't have clsx/tailwind-merge
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export default function InterviewCard({ interview }: InterviewCardProps) {
    const [copied, setCopied] = useState(false);
    const [interviewStatus, setInterviewStatus] = useState<'scheduled' | 'active' | 'expired' | 'available'>('available');
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    const { user } = useUser() as {
        user: { name?: string, email?: string, picture?: string }
    };

    // --- Status Check Logic ---
    useEffect(() => {
        if (interview?.schedule_date) {
            checkInterviewStatus();
            const interval = setInterval(checkInterviewStatus, 60000);
            return () => clearInterval(interval);
        }
    }, [interview]);

    const checkInterviewStatus = () => {
        if (!interview?.schedule_date) {
            setInterviewStatus('available');
            return;
        }

        const now = new Date();
        const scheduleDateTime = combineDateTime(interview.schedule_date, interview.schedule_time || "00:00");
        if (!scheduleDateTime) {
            setInterviewStatus('available');
            return;
        }

        const validityMinutes = interview.validity || 1440;
        const endTime = new Date(scheduleDateTime.getTime() + (validityMinutes * 60000));

        if (now < scheduleDateTime) {
            setInterviewStatus('scheduled');
            updateTimeRemaining(scheduleDateTime, now, true);
        } else if (now > endTime) {
            setInterviewStatus('expired');
        } else {
            setInterviewStatus('active');
            updateTimeRemaining(endTime, now, false);
        }
    };

    const updateTimeRemaining = (targetDate: Date, currentTime: Date, untilStart: boolean) => {
        const diff = targetDate.getTime() - currentTime.getTime();
        if (diff <= 0) {
            setTimeRemaining(untilStart ? 'Starting soon' : 'Ending soon');
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}m`;
        setTimeRemaining(`${untilStart ? 'Starts in' : 'Ends in'} ${timeString.trim()}`);
    };

    // --- Data Destructuring & Safety ---
    if (!interview) return null;

    const {
        interview_id, jobPosition, duration,
        type, questionList, schedule_date,
        schedule_time, service_type
    } = interview;

    const qCount = Array.isArray(questionList) ? questionList.length : 0;
    const interviewTypeText = Array.isArray(type) ? type.join(" • ") : (type || 'General');
    const isInterviewTypeLong = interviewTypeText.length > 15;

    // --- UI Formatting Helpers ---

    // 1. Service Type Logic (Audio vs Video)
    const getServiceTypeConfig = () => {
        const sType = (service_type || '').toLowerCase();
        if (sType.includes('audio') || sType.includes('voice')) {
            return { icon: Mic, label: 'Audio', color: 'text-orange-600 bg-orange-100 border-orange-200' };
        }
        if (sType.includes('mobile')) {
            return { icon: Smartphone, label: 'App', color: 'text-blue-600 bg-blue-100 border-blue-200' };
        }
        return { icon: Video, label: 'Video', color: 'text-purple-600 bg-purple-100 border-purple-200' };
    };

    const serviceConfig = getServiceTypeConfig();

    // 2. Schedule Formatting
    const formatSchedule = () => {
        if (!schedule_date) return "Open Schedule";
        const date = combineDateTime(schedule_date, schedule_time || "00:00");
        if (!date) return "Invalid Date";
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    // 3. Link Logic
    const getInterviewURL = () => {
        if (typeof window !== 'undefined' && interview_id) {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            return `${baseUrl}/interview/${interview_id}`;
        }
        return '';
    };

    const onCopyLink = async () => {
        const link = getInterviewURL();
        if (!link) return;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Link Copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Render ---
    return (
        <TooltipProvider>
            <Card className={cn(
                "group relative w-full h-[220px] flex flex-col justify-between transition-all duration-300",
                "border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
            )}>

                {/* STATUS STRIP (Left Border) */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors",
                    interviewStatus === 'scheduled' ? "bg-amber-400" :
                        interviewStatus === 'active' ? "bg-emerald-500" :
                            interviewStatus === 'expired' ? "bg-slate-300" : "bg-blue-400"
                )} />

                <CardHeader className="pt-5 pb-2 px-5">
                    <div className="flex justify-between items-start">
                        {/* Title & Service Type */}
                        <div className="space-y-1.5 max-w-[75%]">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-lg truncate leading-tight" title={jobPosition}>
                                    {jobPosition}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Service Type Badge */}
                                <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider", serviceConfig.color)}>
                                    <serviceConfig.icon className="w-3 h-3" />
                                    <span>{serviceConfig.label}</span>
                                </div>

                                {/* Status Text (Tiny) */}
                                <span className={cn(
                                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                                    interviewStatus === 'active' ? "text-emerald-600 bg-emerald-50 animate-pulse" :
                                        interviewStatus === 'scheduled' ? "text-amber-600 bg-amber-50" :
                                            interviewStatus === 'expired' ? "text-slate-500 bg-slate-100" : "text-blue-600 bg-blue-50"
                                )}>
                                    {interviewStatus === 'active' ? 'Live Now' :
                                        interviewStatus === 'scheduled' ? timeRemaining.replace('Starts in', 'In') :
                                            interviewStatus.charAt(0).toUpperCase() + interviewStatus.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-5 py-2">
                    {/* Compact Info Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">

                        {/* Date/Time */}
                        <div className="flex items-center gap-2 text-slate-600">
                            <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate font-medium">{formatSchedule()}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{duration}</span>
                        </div>

                        {/* Questions */}
                        <div className="flex items-center gap-2 text-slate-600">
                            <List className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{qCount} Questions</span>
                        </div>

                        {/* Interview Type (Tech/Behavioral) - WITH TOOLTIP */}
                        <div className="w-full">
                            {isInterviewTypeLong ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 text-slate-600 cursor-help">
                                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                <Boxes className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="truncate capitalize">{interviewTypeText}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 text-white border-slate-600">
                                        <p>{interviewTypeText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                        <Boxes className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="truncate capitalize">{interviewTypeText}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="px-5 pb-4 pt-2 border-t border-slate-50 bg-slate-50/50 mt-auto">
                    <div className="flex w-full items-center justify-between gap-2">

                        {/* Email Action - DISABLED IF EXPIRED */}
                        {interviewStatus === 'expired' ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="opacity-50 pointer-events-none grayscale">
                                        <EmailDialog
                                            interviewId={interview_id}
                                            jobPosition={jobPosition}
                                            interviewData={{
                                                duration,
                                                type: Array.isArray(type) ? type.join(', ') : (type || 'General'),
                                                questionList
                                            }}
                                            adminEmail={user?.email || ''}
                                            onEmailsAdded={() => { }}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Interview has expired</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <EmailDialog
                                interviewId={interview_id}
                                jobPosition={jobPosition}
                                interviewData={{
                                    duration,
                                    type: Array.isArray(type) ? type.join(', ') : (type || 'General'),
                                    questionList
                                }}
                                adminEmail={user?.email || ''}
                                onEmailsAdded={() => { }}
                            />
                        )}

                        <div className="flex gap-2">
                            {/* Copy Link */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 rounded-lg border-slate-200 transition-all",
                                            copied ? "border-green-500 text-green-600 bg-green-50" : "hover:border-slate-300 hover:bg-white cursor-pointer"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopyLink();
                                        }}
                                        disabled={interviewStatus === 'expired'}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{interviewStatus === 'expired' ? 'Link Expired' : 'Copy Link'}</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Preview */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="h-9 w-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/25 text-white shadow-sm cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(getInterviewURL(), '_blank');
                                        }}
                                        disabled={interviewStatus === 'expired'}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{interviewStatus === 'expired' ? 'Preview Unavailable' : 'Preview Interview'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
}