"use client";

import { useState, useEffect, KeyboardEvent } from "react";
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
import { Mail, Send, AlertCircle, Loader2, X, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { sendInterviewInvitation, validateEmail } from "../../../../../services/emailservice"; // Adjust path if needed
import { ValidateCandidateService } from "../../../../../services/validateCandidateService"; // Adjust path if needed

interface EmailDialogProps {
    interviewId: string;
    jobPosition: string;
    interviewData: {
        duration: string;
        type: string;
        questionList?: any[];
    };
    adminEmail: string;
    onEmailsAdded?: (emails: string[]) => void;
}

export function EmailDialog({ interviewId, jobPosition, interviewData, adminEmail, onEmailsAdded }: EmailDialogProps) {
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);

    // Chip Input State
    const [emailInput, setEmailInput] = useState("");
    const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
    const [customMessage, setCustomMessage] = useState("");

    // Load existing emails when dialog opens
    useEffect(() => {
        if (open) {
            loadExistingEmails();
        }
    }, [open]);

    const loadExistingEmails = async () => {
        try {
            const existing = await ValidateCandidateService.getCandidateEmails(interviewId);
            if (Array.isArray(existing)) {
                setRecipientEmails(existing);
            }
        } catch (error) {
            console.error("Failed to load emails", error);
        }
    };

    // --- CHIP INPUT LOGIC ---
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
            setEmailInput("");
            return;
        }

        setRecipientEmails([...recipientEmails, trimmed]);
        setEmailInput("");
    };

    const removeEmail = (emailToRemove: string) => {
        setRecipientEmails(recipientEmails.filter(e => e !== emailToRemove));
    };

    const copyAllEmails = () => {
        if (recipientEmails.length === 0) return;
        navigator.clipboard.writeText(recipientEmails.join(', '));
        toast.success("Emails copied to clipboard");
    };

    // --- SEND LOGIC ---
    const handleSend = async () => {
        if (recipientEmails.length === 0) {
            toast.error("Please add at least one recipient");
            return;
        }

        setSending(true);
        try {
            // 1. Save to Database first (Validation)
            const saved = await ValidateCandidateService.upsertCandidateEmails({
                interview_id: interviewId,
                admin_email: adminEmail,
                candidate_emails: recipientEmails
            });

            if (!saved) {
                toast.error("Failed to save authorized emails. Aborting send.");
                setSending(false);
                return;
            }

            if (onEmailsAdded) onEmailsAdded(recipientEmails);

            // 2. Generate Link
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
            const link = `${baseUrl}/interview/${interviewId}`;

            // 3. Send via API
            const emailData = {
                from: "onboarding@resend.dev",
                to: recipientEmails, // Send array directly
                jobPosition: jobPosition,
                duration: interviewData?.duration || 'Not specified',
                questionCount: interviewData?.questionList?.length || 0,
                interviewType: interviewData?.type || 'General',
                interviewLink: link,
                customMessage: customMessage || undefined
            };

            const result = await sendInterviewInvitation(emailData);

            if (result.success) {
                toast.success(`Invitations sent to ${recipientEmails.length} candidates!`);
                setOpen(false);
                setCustomMessage("");
            } else {
                toast.error("Failed to send emails via API.");
            }

        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
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
                    className="group border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-700 rounded-xl px-4 py-2 font-semibold transition-all duration-300 hover:scale-105"
                >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitations
                </Button>
            </DialogTrigger>

            {/* SCROLLBAR HIDDEN HERE */}
            <DialogContent className="border-2 border-cyan-200/60 rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                        <Mail className="w-6 h-6 text-cyan-600" />
                        Send Interview Invitations
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Add candidate emails below. They will be authorized to access the interview.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">

                    {/* Chip Input Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold text-slate-700">To:</Label>
                            <Button variant="ghost" size="sm" onClick={copyAllEmails} disabled={recipientEmails.length === 0} className="h-6 text-xs text-cyan-600 hover:text-cyan-700">
                                <Copy className="w-3 h-3 mr-1" /> Copy All
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 p-3 border-2 border-cyan-200/60 rounded-xl bg-slate-50/50 focus-within:border-cyan-400 focus-within:bg-white transition-all min-h-[100px]">
                            {recipientEmails.map((email) => (
                                <span key={email} className="bg-cyan-100 text-cyan-800 text-sm px-2 py-1 rounded-lg flex items-center gap-1 animate-in fade-in zoom-in-95">
                                    {email}
                                    <button onClick={() => removeEmail(email)} className="hover:text-red-500 rounded-full p-0.5 hover:bg-cyan-200 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <input
                                className="flex-1 bg-transparent outline-none min-w-[200px] text-sm py-1 placeholder:text-slate-400"
                                placeholder={recipientEmails.length === 0 ? "candidate@example.com (Press Enter or Space)" : "Add another..."}
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => addEmail(emailInput)}
                            />
                        </div>
                        <p className="text-xs text-slate-500 text-right">
                            {recipientEmails.length} recipients added
                        </p>
                    </div>

                    {/* Custom Message */}
                    <div className="space-y-2">
                        <Label htmlFor="customMessage" className="text-sm font-semibold text-slate-700">
                            Custom Message (Optional)
                        </Label>
                        <Textarea
                            id="customMessage"
                            placeholder="Add any specific instructions or notes for the candidates..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="border-2 border-cyan-200/60 rounded-xl min-h-[100px] focus:border-cyan-400"
                        />
                    </div>

                    {/* Preview Box */}
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-cyan-600" /> What they will receive
                        </h4>
                        <div className="text-xs text-slate-600 space-y-1 pl-6">
                            <p>• Professional invitation for <strong>{jobPosition}</strong></p>
                            <p>• Unique secure link: <em>.../interview/{interviewId}</em></p>
                            <p>• Details: {interviewData.duration}, {interviewData.questionList?.length || 0} Questions</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl"
                        disabled={sending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || recipientEmails.length === 0}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 px-8"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send to {recipientEmails.length} Candidates
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}