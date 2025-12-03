"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Send, User, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendInterviewInvitation, validateEmail } from "../../../../../services/emailservice";

interface EmailDialogProps {
    interviewId: string;
    jobPosition: string;
    interviewData: {
        duration: string;
        type: string;
        questionList?: any[];
    };
}

export function EmailDialog({ interviewId, jobPosition, interviewData }: EmailDialogProps) {
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailForm, setEmailForm] = useState({
        to: '',
        customMessage: ''
    });

    const handleEmailInputChange = (field: string, value: string) => {
        setEmailForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getInterviewURL = () => {
        if (typeof window !== 'undefined') {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            return `${baseUrl}/interview/${interviewId}`;
        }
        return '';
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

            const link = getInterviewURL();
            if (!link) {
                toast.error("Interview link not available");
                return;
            }

            // Prepare email data
            const emailData = {
                from: "onboarding@resend.dev",
                to: emailForm.to,
                jobPosition: jobPosition,
                duration: interviewData?.duration || 'Not specified',
                questionCount: interviewData?.questionList?.length || 0,
                interviewType: interviewData?.type || 'General',
                interviewLink: link,
                customMessage: emailForm.customMessage || undefined
            };

            // Send email using the service
            const result = await sendInterviewInvitation(emailData);

            if (result.success) {
                toast.success("Interview invitation sent successfully!", {
                    className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none"
                });
                setOpen(false);
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="group border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-700 rounded-xl px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    <Mail className="w-4 h-4 mr-2" />
                    Send
                </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-cyan-200/60 rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                        <Mail className="w-6 h-6 text-cyan-600" />
                        Send Interview Invitation
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Send professional interview invitations to candidates for {jobPosition}.
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
                            <div><strong>Subject:</strong> Interview Invitation - {jobPosition}</div>
                            <div><strong>Contains:</strong> Professional template with interview details, link, and instructions</div>
                            <div><strong>Format:</strong> Both HTML and plain text versions included</div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
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
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
    );
}