"use client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Clock, MessageCircleWarning } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // Add useSearchParams
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Form from "./_components/Form";
import InterviewLink from "./_components/InterviewLink";
import QuestionList from "./_components/QuestionList";

function CreateInterview() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Get search params
    const [step, setStep] = useState(1);
    const [showBackAlert, setShowBackAlert] = useState(false);
    const [showDashboardAlert, setShowDashboardAlert] = useState(false);

    type FormData = {
        jobPosition?: string;
        jobDescription?: string;
        duration?: string;
        type?: string;
        schedule_date?: string;
        schedule_time?: string;
        validity?: number;
        service_type?: string; // Add service_type
        [key: string]: any;
    };

    const [formData, setFormData] = useState<FormData>({});
    const [questionsGenerated, setQuestionsGenerated] = useState(false);
    const [interviewId, setInterviewId] = useState<string | null>(null);

    // Load saved data from localStorage on component mount
    useEffect(() => {
        const savedFormData = localStorage.getItem('interview_form_data');
        const savedQuestions = localStorage.getItem('interview_questions');
        const savedStep = localStorage.getItem('interview_step');
        const savedInterviewId = localStorage.getItem('current_interview_id');

        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }

        if (savedInterviewId) {
            setInterviewId(savedInterviewId);
        }

        if (savedQuestions && savedStep) {
            const stepNum = parseInt(savedStep);
            if (stepNum > 1) {
                setStep(stepNum);
                setQuestionsGenerated(true);
            }
        }
    }, []);

    // Get service_type from URL and set it in formData
    useEffect(() => {
        const typeFromUrl = searchParams.get('type');
        if (typeFromUrl && (typeFromUrl === 'video' || typeFromUrl === 'audio')) {
            setFormData(prev => ({
                ...prev,
                service_type: typeFromUrl
            }));

            // Also save to localStorage
            const savedFormData = localStorage.getItem('interview_form_data');
            if (savedFormData) {
                const parsedData = JSON.parse(savedFormData);
                parsedData.service_type = typeFromUrl;
                localStorage.setItem('interview_form_data', JSON.stringify(parsedData));
            }
        }
    }, [searchParams]);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        if (Object.keys(formData).length > 0) {
            localStorage.setItem('interview_form_data', JSON.stringify(formData));
        }
    }, [formData]);

    // Save current step to localStorage
    useEffect(() => {
        localStorage.setItem('interview_step', step.toString());
    }, [step]);

    const onHandleInputChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);


    const onGoToNext = () => {
        // Validate required fields
        const requiredFields = ['jobPosition', 'jobDescription', 'duration', 'type'];
        for (const field of requiredFields) {
            if (!formData?.[field]) {
                toast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return;
            }
        }

        // Validate schedule date and time if provided
        if (formData?.schedule_date && formData?.schedule_time) {
            const scheduleDate = new Date(formData.schedule_date);
            const [hours, minutes] = formData.schedule_time.split(':').map(Number);
            scheduleDate.setHours(hours, minutes, 0, 0);

            const now = new Date();
            // Add 5 minutes buffer for immediate interviews
            const bufferTime = new Date(now.getTime() + 5 * 60000);

            if (scheduleDate < bufferTime) {
                toast("Schedule time must be at least 5 minutes from now");
                return;
            }
        }

        // Validate validity period if provided
        if (formData?.validity !== undefined && formData.validity < 30) {
            toast("Validity period must be at least 30 minutes");
            return;
        }

        setStep(step + 1);
    }

    const onGoToForm = () => {
        setStep(1);
        setQuestionsGenerated(false);
    }

    const onQuestionsGenerated = () => {
        setQuestionsGenerated(true);
    }

    const onInterviewFinished = (interview_id: string) => {
        // Save interview ID to localStorage for InterviewLink component
        localStorage.setItem('current_interview_id', interview_id);
        setInterviewId(interview_id);
        setStep(step + 1);
    }

    // Handle going back to dashboard from InterviewLink
    const onBackToDashboard = () => {
        setShowDashboardAlert(true);
    }

    // Handle confirmed dashboard navigation
    const handleConfirmedDashboardNav = () => {
        // Clear localStorage
        localStorage.removeItem('interview_form_data');
        localStorage.removeItem('interview_questions');
        localStorage.removeItem('interview_step');
        localStorage.removeItem('current_interview_id');

        // Navigate to dashboard
        router.push('/dashboard');
        setShowDashboardAlert(false);
    }

    // Handle creating new interview from InterviewLink
    const onCreateNewInterview = () => {
        // Clear localStorage
        localStorage.removeItem('interview_form_data');
        localStorage.removeItem('interview_questions');
        localStorage.removeItem('interview_step');
        localStorage.removeItem('current_interview_id');

        // Reset state to initial
        setFormData({});
        setQuestionsGenerated(false);
        setInterviewId(null);
        setStep(1);

        toast.success("Ready to create a new interview!");
    }

    // Handle back button click
    const handleBackClick = () => {
        if (step === 1) {
            // If on form step, go to dashboard
            router.push('/dashboard');
        } else if (step === 2) {
            // If on questions step, show alert dialog
            setShowBackAlert(true);
        } else if (step === 3) {
            // If on interview link step, go back to questions
            setStep(2);
        } else {
            // For any other step, go back normally
            setStep(step - 1);
        }
    }

    // Handle confirmed back navigation from questions step
    const handleConfirmedBack = () => {
        // Delete questions from localStorage
        localStorage.removeItem('interview_questions');
        localStorage.setItem('interview_step', '1');
        setStep(1);
        setQuestionsGenerated(false);
        setShowBackAlert(false);
        toast.success("Questions cleared. You're back to the form.");
    }

    // Function to get step info
    const getStepInfo = (stepNumber: number) => {
        const steps = [
            { name: "Setup", isActive: step === 1, isCompleted: step > 1 },
            { name: "Questions", isActive: step === 2, isCompleted: step > 2 },
            { name: "Share Link", isActive: step === 3, isCompleted: false }
        ];
        return steps[stepNumber - 1];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8">
            <div className="px-6 md:px-12 lg:px-24 xl:px-32 max-w-6xl mx-auto">
                <div className="relative mb-8">
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <Button
                            onClick={handleBackClick}
                            className="group p-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-cyan-200/60 hover:border-cyan-400 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 hover:bg-white text-cyan-600 cursor-pointer h-10 "
                        >
                            <ArrowLeft className="w-6 h-6 transition-transform duration-300" />
                        </Button>

                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-700 to-sky-600 bg-clip-text text-transparent mb-2">
                                Create Interview ✨
                            </h1>
                            <p className="text-lg text-slate-600 font-medium">Design your perfect AI-powered interview experience</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm mb-3 font-medium">
                            {[1, 2, 3].map((stepNum) => {
                                const stepInfo = getStepInfo(stepNum);
                                return (
                                    <span
                                        key={stepNum}
                                        className={`flex items-center gap-1 transition-all duration-300 ${stepInfo.isActive
                                            ? 'text-cyan-600 font-bold scale-105'
                                            : stepInfo.isCompleted
                                                ? 'text-green-600 font-semibold'
                                                : 'text-slate-400'
                                            }`}
                                    >
                                        {stepInfo.isActive && (
                                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                        )}
                                        {stepInfo.isCompleted && (
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        )}
                                        {!stepInfo.isActive && !stepInfo.isCompleted && (
                                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                        )}
                                        {stepInfo.name}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="relative">
                            <Progress
                                value={(step / 3) * 100}
                                className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 shadow-inner transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-500 rounded-full opacity-20 animate-pulse"></div>
                        </div>
                        <div className="text-center mt-3 text-sm font-semibold text-slate-600">
                            Step {step} of 3 - {getStepInfo(step).name}
                        </div>
                    </div>
                </div>

                {step == 1 ? (
                    <Form
                        onHandleInputChange={onHandleInputChange}
                        GoToNext={() => onGoToNext()}
                        formData={formData}
                    />
                ) : step == 2 ? (
                    <QuestionList
                        formData={formData}
                        onGoToForm={onGoToForm}
                        onQuestionsGenerated={onQuestionsGenerated}
                        onInterviewFinished={onInterviewFinished}
                    />
                ) : step == 3 ? (
                    <InterviewLink
                        interview_id={interviewId!}
                        formData={formData}
                        onBackToDashboard={onBackToDashboard}
                        onCreateNewInterview={onCreateNewInterview}
                    />
                ) : null}
            </div>

            {/* Back Alert Dialog from Questions */}
            <AlertDialog open={showBackAlert} onOpenChange={setShowBackAlert}>
                <AlertDialogContent className="border-2 border-red-200 rounded-2xl max-w-lg bg-white shadow-2xl shadow-red-500/20">
                    <AlertDialogHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <MessageCircleWarning className="w-8 h-8 text-white" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-700 bg-clip-text text-transparent flex justify-center items-center gap-3">
                            Are you sure you want to go back?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 text-base leading-relaxed space-y-4">
                            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200/50">
                                <p className="font-semibold text-red-800 mb-2">This will:</p>
                                <div className="space-y-2 text-sm text-left">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Delete all generated questions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Return you to the form setup</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-base">
                                Your form data will be kept safe, but you'll need to regenerate questions.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-3 pt-6">
                        <AlertDialogCancel className="flex-1 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmedBack}
                            className="flex-1 py-3 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 transition-all duration-300 border-0 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span>Yes, Go Back</span>
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dashboard Navigation Alert */}
            <AlertDialog open={showDashboardAlert} onOpenChange={setShowDashboardAlert}>
                <AlertDialogContent className="border-2 border-blue-200 rounded-2xl max-w-lg bg-white shadow-2xl shadow-blue-500/20">
                    <AlertDialogHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                            <ArrowLeft className="w-8 h-8 text-white" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">
                            Return to Dashboard?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 text-base leading-relaxed space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
                                <p className="font-semibold text-blue-800 mb-2">This will:</p>
                                <div className="space-y-2 text-sm text-left">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Clear all interview creation data</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Return you to the main dashboard</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-base">
                                Your interview link will remain saved and accessible from the dashboard.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-3 pt-6">
                        <AlertDialogCancel className="flex-1 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmedDashboardNav}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-500 via-cyan-600 to-blue-500 hover:from-blue-600 hover:via-cyan-700 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 border-0 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span>Yes, Go to Dashboard</span>
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default CreateInterview