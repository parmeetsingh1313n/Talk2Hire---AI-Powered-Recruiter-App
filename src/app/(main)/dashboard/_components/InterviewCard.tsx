"use client";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check, Clock, List, Boxes, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { EmailDialog } from "./EmailDialog";


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
}

interface InterviewCardProps {
    interview?: Interview | null; // Make interview optional and nullable
}

// Hook to detect if text is truncated
function useIsTruncated() {
    const [isTruncated, setIsTruncated] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const checkTruncation = () => {
            if (ref.current) {
                const isTextTruncated = ref.current.scrollHeight > ref.current.clientHeight;
                setIsTruncated(isTextTruncated);
            }
        };

        checkTruncation();
        window.addEventListener('resize', checkTruncation);

        return () => window.removeEventListener('resize', checkTruncation);
    }, []);

    return { ref, isTruncated };
}

export function InterviewCard({ interview }: InterviewCardProps) {
    const [copied, setCopied] = useState(false);
    const { ref: jobDescRef, isTruncated: isJobDescTruncated } = useIsTruncated();

    // Safe function to get interview field with fallbacks
    const getInterviewField = {
        id: interview?.id || 'unknown',
        interview_id: interview?.interview_id || 'unknown',
        jobPosition: interview?.jobPosition || 'Unknown Position',
        jobDescription: interview?.jobDescription,
        duration: interview?.duration || 'Not specified',
        type: interview?.type || null,
        questionList: interview?.questionList || [],
        created_at: interview?.created_at || new Date().toISOString(),
        userEmail: interview?.userEmail || 'unknown'
    };

    // Function to format interview type (handle both string, array, and null)
    const formatInterviewType = (type: string | string[] | null): string => {
        if (!type) return 'General';
        if (Array.isArray(type)) {
            return type.join(" • ");
        }
        return type;
    };

    // Function to get first type for badge (handle both string, array, and null)
    const getPrimaryType = (type: string | string[] | null): string => {
        if (!type) return 'General';
        if (Array.isArray(type)) {
            return type[0] || 'General';
        }
        return type;
    };

    const getInterviewURL = () => {
        if (typeof window !== 'undefined' && getInterviewField.interview_id !== 'unknown') {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            return `${baseUrl}/interview/${getInterviewField.interview_id}`;
        }
        return '';
    };

    const onCopyLink = async () => {
        try {
            const link = getInterviewURL();
            if (!link) {
                toast.error("Interview link not available");
                return;
            }

            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success("Link Copied to Clipboard!", {
                className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none"
            });
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast.error("Failed to copy link");
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
        } catch {
            return 'Invalid date';
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        const typeLower = type.toLowerCase();
        if (typeLower.includes('technical')) return 'destructive';
        if (typeLower.includes('behavioral')) return 'default';
        if (typeLower.includes('cultural')) return 'secondary';
        return 'outline';
    };

    const getDurationColor = (duration: string) => {
        const durLower = duration.toLowerCase();
        if (durLower.includes('30') || durLower.includes('half')) return 'text-orange-600';
        if (durLower.includes('45') || durLower.includes('45')) return 'text-purple-600';
        if (durLower.includes('60') || durLower.includes('hour')) return 'text-red-600';
        return 'text-green-600';
    };

    // Safe interview type text with null handling
    const interviewTypeText = formatInterviewType(getInterviewField.type);

    // Check if interview type is long enough to need truncation (safe with null handling)
    const isInterviewTypeLong = interviewTypeText.length > 15;

    // If interview is completely undefined or null, show error card
    if (!interview) {
        return (
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl">
                <CardContent className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Interview Data Missing</h3>
                    <p className="text-red-600 text-sm">
                        This interview data is unavailable or corrupted.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <TooltipProvider>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/20 to-blue-50/20 border-2 border-cyan-200/40 hover:border-cyan-300/60 rounded-2xl shadow-lg hover:shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer flex flex-col h-full">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-sky-400/10 to-cyan-500/10 rounded-full animate-pulse delay-1000"></div>
                </div>

                <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-cyan-700 transition-colors duration-300">
                                {getInterviewField.jobPosition}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(getInterviewField.created_at)}
                            </p>
                        </div>
                        <Badge
                            variant={getTypeBadgeVariant(getPrimaryType(getInterviewField.type))}
                            className="ml-2 flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                        >
                            {getPrimaryType(getInterviewField.type)}
                        </Badge>
                    </div>

                    {getInterviewField.jobDescription && (
                        <>
                            {isJobDescTruncated ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p
                                            ref={jobDescRef}
                                            className="text-sm text-slate-600 line-clamp-2 mt-2 cursor-help hover:text-slate-700 transition-colors"
                                        >
                                            {getInterviewField.jobDescription}
                                        </p>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        align="start"
                                        className="max-w-sm bg-slate-800 text-white border-slate-600"
                                    >
                                        <p className="text-sm leading-relaxed">{getInterviewField.jobDescription}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <p
                                    ref={jobDescRef}
                                    className="text-sm text-slate-600 line-clamp-2 mt-2"
                                >
                                    {getInterviewField.jobDescription}
                                </p>
                            )}
                        </>
                    )}
                </CardHeader>

                <CardContent className="pb-4 flex-shrink-0">
                    <div className="flex flex-wrap gap-3">
                        {/* Duration */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/40">
                            <Clock className={`w-4 h-4 ${getDurationColor(getInterviewField.duration)}`} />
                            <span className={`text-sm font-semibold ${getDurationColor(getInterviewField.duration)}`}>
                                {getInterviewField.duration}
                            </span>
                        </div>

                        {/* Questions Count */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/40">
                            <List className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">
                                {getInterviewField.questionList.length} Qs
                            </span>
                        </div>

                        {/* Interview Type with Conditional Tooltip */}
                        {isInterviewTypeLong ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-sky-200/40 cursor-help">
                                        <Boxes className="w-4 h-4 text-sky-600" />
                                        <span className="text-sm font-semibold text-sky-700 max-w-[120px] truncate">
                                            {interviewTypeText}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    className="bg-slate-800 text-white border-slate-600"
                                >
                                    <p className="text-sm font-medium">{interviewTypeText}</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-sky-200/40">
                                <Boxes className="w-4 h-4 text-sky-600" />
                                <span className="text-sm font-semibold text-sky-700">
                                    {interviewTypeText}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="pt-0 mt-auto flex-shrink-0">
                    <div className="flex gap-2 w-full">
                        {/* Copy Link Button */}
                        <Button
                            onClick={onCopyLink}
                            className={`flex-1 transition-all duration-500 transform hover:scale-105 rounded-xl font-semibold shadow-lg cursor-pointer ${copied
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/25'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 animate-pulse" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                </>
                            )}
                        </Button>

                        {/* Email Button */}
                        <EmailDialog
                            interviewId={getInterviewField.interview_id}
                            jobPosition={getInterviewField.jobPosition}
                            interviewData={{
                                duration: getInterviewField.duration,
                                type: interviewTypeText,
                                questionList: getInterviewField.questionList
                            }}
                        />

                        {/* View Interview Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getInterviewURL(), '_blank')}
                            className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 rounded-xl px-3 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-300/30 transition-all duration-500 pointer-events-none"></div>
            </Card>
        </TooltipProvider>
    );
}

export default InterviewCard;