import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Check, Clock, Copy, List, Mail, Plus, Sparkles, Send, User, AlertCircle, Boxes } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sendInterviewInvitation, validateEmail } from "../../../../../../services/emailservice";

interface InterviewLinkProps {
    interview_id?: string;
    formData?: {
        jobPosition?: string;
        jobDescription?: string;
        duration?: string;
        type?: string;
        questionList?: Array<any>;
        [key: string]: any;
    };
    onBackToDashboard?: () => void;
    onCreateNewInterview?: () => void;
}

function InterviewLink({ interview_id, formData, onBackToDashboard, onCreateNewInterview }: InterviewLinkProps) {
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [emailDialog, setEmailDialog] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailForm, setEmailForm] = useState({
        to: '',
        customMessage: ''
    });

    // State to handle persisted data
    const [currentInterviewId, setCurrentInterviewId] = useState<string>('');
    const [currentFormData, setCurrentFormData] = useState<any>({});

    useEffect(() => {
        setMounted(true);

        // Load persisted data from localStorage on component mount
        const savedInterviewId = localStorage.getItem('current_interview_id');
        const savedFormData = localStorage.getItem('interview_form_data');
        const savedQuestions = localStorage.getItem('interview_questions');

        console.log('Loading from localStorage:', { savedInterviewId, savedFormData, savedQuestions });

        // Determine which interview_id to use
        let finalInterviewId = '';
        if (interview_id) {
            // If interview_id is provided as prop, use it and save to localStorage
            finalInterviewId = interview_id;
            localStorage.setItem('current_interview_id', interview_id);
            console.log('Using prop interview_id:', interview_id);
        } else if (savedInterviewId) {
            // Otherwise, try to load from localStorage
            finalInterviewId = savedInterviewId;
            console.log('Using saved interview_id:', savedInterviewId);
        }

        setCurrentInterviewId(finalInterviewId);

        // Determine which form data to use
        let finalFormData = {};
        if (formData && Object.keys(formData).length > 0) {
            finalFormData = { ...formData };
            console.log('Using prop formData:', formData);
        }
        else if (savedFormData) {
            try {
                finalFormData = JSON.parse(savedFormData);
                console.log('Using saved formData:', finalFormData);
            } catch (error) {
                console.error('Failed to parse saved form data:', error);
                finalFormData = {};
            }
        }

        // If we have saved questions, add them to form data
        if (savedQuestions) {
            try {
                const parsedQuestions = JSON.parse(savedQuestions);
                finalFormData = {
                    ...finalFormData,
                    questionList: parsedQuestions
                };
                console.log('Added saved questions to form data:', parsedQuestions.length, 'questions');
            } catch (error) {
                console.error('Failed to parse saved questions:', error);
            }
        }

        setCurrentFormData(finalFormData);

        // Save the final form data to localStorage
        if (Object.keys(finalFormData).length > 0) {
            localStorage.setItem('interview_form_data', JSON.stringify(finalFormData));
        }
    }, [interview_id, formData]);

    // Save form data when it changes (but not on initial load)
    useEffect(() => {
        if (mounted && currentFormData && Object.keys(currentFormData).length > 0) {
            localStorage.setItem('interview_form_data', JSON.stringify(currentFormData));
            console.log('Saved form data to localStorage:', currentFormData);
        }
    }, [currentFormData, mounted]);

    const GetInterviewURL = () => {
        if (typeof window !== 'undefined' && currentInterviewId) {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            const url = `${baseUrl}/interview/${currentInterviewId}`;
            console.log('Generated interview URL:', url);
            return url;
        }
        console.log('No interview URL - missing window or currentInterviewId');
        return '';
    }

    const onCopyLink = async () => {
        try {
            const link = GetInterviewURL();
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
        }
        catch (error) {
            console.error('Failed to copy link:', error);
            toast.error("Failed to copy link");
        }
    }

    const shareViaWhatsApp = () => {
        const link = GetInterviewURL();
        if (!link) {
            toast.error("Interview link not available");
            return;
        }

        const message = `Hi! You've been invited for an interview for the position of *${currentFormData?.jobPosition || 'the position'}*.\n\nInterview Details:\nDuration: ${currentFormData?.duration || 'Not specified'}\nQuestions: ${currentFormData?.questionList?.length || 10}\n\nClick here to start: ${link}\n\nGood luck!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    const handleEmailInputChange = (field: string, value: string) => {
        setEmailForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const sendEmail = async () => {
        setSending(true);
        try {
            // Validate form
            if (!emailForm.to) {
                toast.error("Please enter recipient email address");
                return;
            }

            // Validate email format
            if (!validateEmail(emailForm.to)) {
                toast.error("Please enter a valid email address");
                return;
            }

            const link = GetInterviewURL();
            if (!link) {
                toast.error("Interview link not available");
                return;
            }

            // Prepare email data
            const emailData = {
                from: "onboarding@resend.dev", // Using verified Resend domain
                to: emailForm.to,
                jobPosition: currentFormData?.jobPosition || 'Position',
                duration: currentFormData?.duration || 'Not specified',
                questionCount: currentFormData?.questionList?.length || 10,
                interviewType: currentFormData?.type || 'General',
                interviewLink: link,
                customMessage: emailForm.customMessage || undefined
            };

            // Send email using the service
            const result = await sendInterviewInvitation(emailData);

            if (result.success) {
                toast.success("Interview invitation sent successfully!", {
                    className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none"
                });
                setEmailDialog(false);
                // Reset form
                setEmailForm({
                    to: '',
                    customMessage: ''
                });
            } else {
                toast.error(result.error || "Failed to send email");
            }
        } catch (error: any) {
            console.error('Email sending error:', error);
            toast.error(error.message || "Failed to send email. Please try again.");
        } finally {
            setSending(false);
        }
    };

    // Function to clear localStorage - only called when explicitly navigating away
    const clearLocalStorage = () => {
        console.log('Clearing localStorage...');
        localStorage.removeItem('current_interview_id');
        localStorage.removeItem('interview_form_data');
        localStorage.removeItem('interview_questions');
        localStorage.removeItem('interview_step');
        console.log('LocalStorage cleared');
    };

    // Handle page unload - we DON'T want to clear localStorage on refresh
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Don't clear localStorage on page refresh/reload
            console.log('Page unloading, but keeping localStorage intact');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // Show error state if no interview ID is available after loading
    if (!currentInterviewId) {
        console.log('No currentInterviewId available, showing error state');
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8">
                <div className="max-w-2xl mx-auto px-6">
                    <div className="flex flex-col items-center justify-center text-center space-y-8">
                        <div className="p-6 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                <p className="text-red-800 font-bold text-lg">Interview Not Found</p>
                            </div>
                            <p className="text-red-700 mb-4">No interview ID available. Please create a new interview.</p>
                            <Link href={'/dashboard/create-interview'}>
                                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl cursor-pointer">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New Interview
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    console.log('Rendering InterviewLink with:', { currentInterviewId, currentFormData });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8">
            <div className="max-w-2xl mx-auto px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-8">
                    {/* Success Animation */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center shadow-2xl shadow-cyan-500/25 bg-gradient-to-r from-cyan-100 to-blue-100 border-4 border-white">
                            <video
                                src="/check-icon.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-700 to-sky-600 bg-clip-text text-transparent">
                            Interview Link Generated!
                        </h1>
                        <p className="text-lg text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                            Share this link with your candidates to start the interview process
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="w-full bg-white/80 backdrop-blur-sm border-2 border-cyan-200/60 rounded-3xl shadow-2xl shadow-cyan-500/10 p-8 space-y-6">
                        {/* Link Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-cyan-800">Interview Link</h2>
                                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full border-2 border-green-200/60">
                                    Valid For 30 Days
                                </div>
                            </div>

                            <div className="flex gap-3 items-center">
                                <Input
                                    value={GetInterviewURL()}
                                    readOnly
                                    className="flex-1 bg-slate-50 border-2 border-cyan-200/60 rounded-xl text-slate-700 font-medium"
                                />
                                <Button
                                    onClick={onCopyLink}
                                    className={`transition-all duration-500 transform hover:scale-105 rounded-xl px-6 py-3 font-bold shadow-lg cursor-pointer ${copied
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25'
                                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/25'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5 mr-2 animate-pulse" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Interview Details */}
                        <hr className="border-cyan-200/60" />
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/40">
                                <Clock className="h-5 w-5 text-cyan-600" />
                                <span className="text-cyan-800 font-semibold">{currentFormData?.duration || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/40">
                                <List className="h-5 w-5 text-blue-600" />
                                <span className="text-blue-800 font-semibold">{currentFormData?.questionList?.length || 10} Questions</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/40">
                                <Boxes className="h-5 w-5 text-blue-600" />
                            <span className="text-sky-800 font-semibold">
                                {currentFormData?.type && currentFormData.type.length > 0
                                    ? currentFormData.type.join(' / ')
                                    : 'General'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="w-full bg-white/60 backdrop-blur-sm border-2 border-cyan-200/40 rounded-3xl shadow-xl shadow-cyan-500/5 p-6">
                        <h2 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Share via
                        </h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {/* Email Dialog */}
                            <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="group border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-700 rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                                    >
                                        <Mail className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                                        Email
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-2 border-cyan-200/60 rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                                            <Mail className="w-6 h-6 text-cyan-600" />
                                            Send Interview Invitation
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-600">
                                            Send professional interview invitations to candidates.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        {/* Email Form */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="to" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Candidate Email
                                                </Label>
                                                <Input
                                                    id="to"
                                                    type="email"
                                                    placeholder="candidate@email.com"
                                                    value={emailForm.to}
                                                    onChange={(e) => handleEmailInputChange('to', e.target.value)}
                                                    className="border-2 border-cyan-200/60 rounded-xl"
                                                />
                                            </div>

                                            {/* Custom Message */}
                                            <div className="space-y-2">
                                                <Label htmlFor="customMessage" className="text-sm font-semibold text-slate-700">
                                                    Custom Message (Optional)
                                                </Label>
                                                <Textarea
                                                    id="customMessage"
                                                    placeholder="Add any additional information for the candidate..."
                                                    value={emailForm.customMessage}
                                                    onChange={(e) => handleEmailInputChange('customMessage', e.target.value)}
                                                    className="border-2 border-cyan-200/60 rounded-xl min-h-[100px]"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    This will be included in addition to the standard interview invitation template.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Preview Information */}
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Email Preview
                                            </h4>
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <div><strong>Subject:</strong> Interview Invitation - {currentFormData?.jobPosition || 'Position'}</div>
                                                <div><strong>Contains:</strong> Professional template with interview details, link, and instructions</div>
                                                <div><strong>Format:</strong> Both HTML and plain text versions included</div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEmailDialog(false)}
                                            className="border-2 border-slate-300 hover:border-slate-400 cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={sendEmail}
                                            disabled={sending}
                                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 cursor-pointer"
                                        >
                                            {sending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Email
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button
                                onClick={shareViaWhatsApp}
                                variant="outline"
                                className="group border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                <i className="ri-whatsapp-line"></i>
                                WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row w-full justify-center gap-4 pt-4">
                        {onBackToDashboard ? (
                            <Button
                                onClick={onBackToDashboard}
                                variant="outline"
                                className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Dashboard
                            </Button>
                        ) : (
                            <Link href={'/dashboard'} className="flex-1 sm:flex-initial">
                                <Button
                                    onClick={clearLocalStorage}
                                    variant="outline"
                                    className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        )}

                        {onCreateNewInterview ? (
                            <Button
                                onClick={onCreateNewInterview}
                                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-500 hover:from-cyan-600 hover:via-blue-700 hover:to-sky-600 text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/35 transition-all duration-300 hover:scale-105 transform cursor-pointer"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Interview
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    clearLocalStorage();
                                    window.location.href = '/dashboard/create-interview?new=true';
                                }}
                                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-500 hover:from-cyan-600 hover:via-blue-700 hover:to-sky-600 text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/35 transition-all duration-300 hover:scale-105 transform cursor-pointer"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Interview
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewLink;