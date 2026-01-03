'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Clock, Copy, Mail, Plus, Sparkles, Send, User, AlertCircle, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, KeyboardEvent } from "react";
import { toast } from "sonner";
import { sendInterviewInvitation, validateEmail } from "../../../../../../services/emailservice";
import { ValidateCandidateService } from "../../../../../../services/validateCandidateService";

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
    adminEmail?: string;
}

function InterviewLink({ interview_id, formData, onBackToDashboard, onCreateNewInterview, adminEmail }: InterviewLinkProps) {
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [emailDialog, setEmailDialog] = useState(false);
    const [sending, setSending] = useState(false);

    // Advanced Email State
    const [emailInput, setEmailInput] = useState('');
    const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
    const [customMessage, setCustomMessage] = useState('');

    const [currentInterviewId, setCurrentInterviewId] = useState<string>('');
    const [currentFormData, setCurrentFormData] = useState<any>({});

    useEffect(() => {
        setMounted(true);
        const savedInterviewId = localStorage.getItem('current_interview_id');
        const savedFormData = localStorage.getItem('interview_form_data');
        const savedQuestions = localStorage.getItem('interview_questions');

        let finalInterviewId = '';
        if (interview_id) {
            finalInterviewId = interview_id;
            localStorage.setItem('current_interview_id', interview_id);
        } else if (savedInterviewId) {
            finalInterviewId = savedInterviewId;
        }
        setCurrentInterviewId(finalInterviewId);

        let finalFormData: any = {};
        if (formData && Object.keys(formData).length > 0) {
            finalFormData = { ...formData };
        } else if (savedFormData) {
            try {
                finalFormData = JSON.parse(savedFormData);
            } catch { finalFormData = {}; }
        }

        if (savedQuestions) {
            try {
                finalFormData = { ...finalFormData, questionList: JSON.parse(savedQuestions) };
            } catch { }
        }
        setCurrentFormData(finalFormData);
    }, [interview_id, formData]);

    const GetInterviewURL = () => {
        if (typeof window !== 'undefined' && currentInterviewId) {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            return `${baseUrl}/interview/${currentInterviewId}`;
        }
        return '';
    }

    const onCopyLink = async () => {
        try {
            const link = GetInterviewURL();
            if (!link) return toast.error("Interview link not available");
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success("Link Copied!");
            setTimeout(() => setCopied(false), 3000);
        } catch { toast.error("Failed to copy link"); }
    }

    const shareViaWhatsApp = () => {
        const link = GetInterviewURL();
        if (!link) return toast.error("Interview link not available");
        const message = `Hi! You've been invited for an interview for *${currentFormData?.jobPosition}*.\nStart here: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }

    // --- ADVANCED EMAIL INPUT HANDLERS ---
    const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', ',', ' '].includes(e.key)) {
            e.preventDefault();
            addEmail(emailInput);
        }
    };

    const addEmail = (email: string) => {
        const trimmed = email.trim();
        if (!trimmed) return;

        if (!validateEmail(trimmed)) {
            toast.error(`Invalid email: ${trimmed}`);
            return;
        }
        if (recipientEmails.includes(trimmed)) {
            toast.error("Email already added");
            setEmailInput('');
            return;
        }

        setRecipientEmails([...recipientEmails, trimmed]);
        setEmailInput('');
    };

    const removeEmail = (emailToRemove: string) => {
        setRecipientEmails(recipientEmails.filter(e => e !== emailToRemove));
    };

    const handleSendEmails = async () => {
        if (recipientEmails.length === 0) {
            toast.error("Please add at least one recipient");
            return;
        }

        setSending(true);
        try {
            const link = GetInterviewURL();
            if (!link) {
                toast.error("Interview link missing");
                return;
            }

            // 1. SAVE TO DB (ValidateCandidateService)
            if (currentInterviewId) {
                // Fetch existing to merge
                const existing = await ValidateCandidateService.getCandidateEmails(currentInterviewId);
                const uniqueMerged = [...new Set([...existing, ...recipientEmails])];

                const saved = await ValidateCandidateService.upsertCandidateEmails({
                    interview_id: currentInterviewId,
                    admin_email: adminEmail || 'parmeetsingh1313n@gmail.com',
                    candidate_emails: uniqueMerged
                });

                if (!saved) {
                    toast.error("Failed to authorize candidates. Emails not sent.");
                    return;
                }
            }

            // 2. SEND EMAILS (Nodemailer API)
            const emailData = {
                from: "onboarding@resend.dev",
                to: recipientEmails,
                jobPosition: currentFormData?.jobPosition || 'Position',
                duration: currentFormData?.duration || 'Not specified',
                questionCount: currentFormData?.questionList?.length || 10,
                interviewType: currentFormData?.type || 'General',
                interviewLink: link,
                customMessage: customMessage || undefined
            };

            const result = await sendInterviewInvitation(emailData);

            if (result.success) {
                toast.success(`Sent ${recipientEmails.length} invitations successfully!`);
                setEmailDialog(false);
                setRecipientEmails([]);
                setCustomMessage('');
            } else {
                toast.error("Failed to send some emails.");
            }

        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setSending(false);
        }
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('current_interview_id');
        localStorage.removeItem('interview_form_data');
        localStorage.removeItem('interview_questions');
        localStorage.removeItem('interview_step');
    };

    if (!mounted) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8">
            <div className="max-w-2xl mx-auto px-6">

                {/* Success Animation & Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-8 mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center shadow-2xl shadow-cyan-500/25 bg-gradient-to-r from-cyan-100 to-blue-100 border-4 border-white">
                            <video src="/check-icon.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-700 to-sky-600 bg-clip-text text-transparent">
                            Interview Created!
                        </h1>
                        <p className="text-lg text-slate-600 font-medium max-w-md mx-auto">
                            Share this link with candidates to start the process.
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full bg-white/80 backdrop-blur-sm border-2 border-cyan-200/60 rounded-3xl shadow-2xl p-8 space-y-6">

                    {/* Link Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-800">Interview Link</h2>
                            <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                                Active
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <Input value={GetInterviewURL()} readOnly className="flex-1 bg-slate-50 border-2 border-cyan-200/60 rounded-xl text-slate-700 font-medium" />
                            <Button
                                onClick={onCopyLink}
                                className={`transition-all duration-500 rounded-xl px-6 py-3 font-bold shadow-lg ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white`}
                            >
                                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>

                    <hr className="border-cyan-100" />

                    {/* Share Section */}
                    <div className="bg-white/60 rounded-2xl p-6 border border-cyan-100">
                        <h2 className="text-lg font-bold text-cyan-800 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" /> Invite Candidates
                        </h2>
                        <div className="flex flex-wrap gap-4 justify-center">

                            {/* EMAIL DIALOG */}
                            <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-2 border-cyan-200 text-cyan-700 rounded-xl px-6 hover:bg-cyan-50">
                                        <Mail className="w-5 h-5 mr-2" /> Email Invite
                                    </Button>
                                </DialogTrigger>

                                {/* SCROLLBAR HIDDEN HERE */}
                                <DialogContent className="sm:max-w-xl border-2 border-cyan-100 rounded-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-cyan-800 flex items-center gap-2">
                                            <Mail className="w-6 h-6" /> Send Invitations
                                        </DialogTitle>
                                        <DialogDescription>
                                            Add multiple candidate emails. Press Enter to add.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2">
                                        {/* CHIP INPUT FOR EMAILS */}
                                        <div className="space-y-2">
                                            <Label>To:</Label>
                                            <div className="flex flex-wrap gap-2 p-3 border-2 border-cyan-100 rounded-xl bg-slate-50 focus-within:border-cyan-400 transition-colors min-h-[50px]">
                                                {recipientEmails.map((email) => (
                                                    <span key={email} className="bg-cyan-100 text-cyan-800 text-sm px-2 py-1 rounded-full flex items-center gap-1 animate-in fade-in zoom-in-95">
                                                        {email}
                                                        <button onClick={() => removeEmail(email)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                                <input
                                                    className="flex-1 bg-transparent outline-none min-w-[150px] text-sm"
                                                    placeholder={recipientEmails.length === 0 ? "candidate@example.com (Press Enter)" : ""}
                                                    value={emailInput}
                                                    onChange={(e) => setEmailInput(e.target.value)}
                                                    onKeyDown={handleEmailKeyDown}
                                                    onBlur={() => addEmail(emailInput)}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 text-right">{recipientEmails.length} recipients added</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Custom Message (Optional)</Label>
                                            <Textarea
                                                placeholder="Good luck with your interview..."
                                                value={customMessage}
                                                onChange={(e) => setCustomMessage(e.target.value)}
                                                className="border-cyan-100 rounded-xl focus:border-cyan-400"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setEmailDialog(false)}>Cancel</Button>
                                        <Button
                                            onClick={handleSendEmails}
                                            disabled={sending || recipientEmails.length === 0}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl"
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                            Send ({recipientEmails.length})
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button onClick={shareViaWhatsApp} variant="outline" className="border-2 border-green-200 text-green-700 rounded-xl px-6 hover:bg-green-50">
                                WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                        {onBackToDashboard ? (
                            <Button onClick={onBackToDashboard} variant="ghost" className="text-slate-500 hover:text-slate-800">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                            </Button>
                        ) : (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button variant="ghost" onClick={clearLocalStorage} className="w-full text-slate-500 hover:text-slate-800">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                                </Button>
                            </Link>
                        )}

                        <Button
                            onClick={onCreateNewInterview || (() => { clearLocalStorage(); window.location.href = '/dashboard/create-interview?new=true'; })}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/25 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Create Another
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewLink;