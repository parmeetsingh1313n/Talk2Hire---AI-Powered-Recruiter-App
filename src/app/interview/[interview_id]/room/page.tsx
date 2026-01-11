'use client';
// Import regenerator-runtime FIRST
import 'regenerator-runtime/runtime';
import { Button } from "@/components/ui/button";
import { Clock, Loader2, MessageCircle, Mic, MicOff, UserIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import { analyzeAndStoreConversation, clearConversationHistory, ConversationRecord, getAIResponse } from "../../../../../services/groqService";
import { supabase } from "../../../../../services/supabaseClient";
import { AudioAvatarView } from "./_components/avatar/AudioAvatarView";

// Import Dialog components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Dynamic import with typed component handling
const VideoAvatarView = dynamic(
    () => import('./_components/avatar/VideoAvatarView').then(mod => mod.VideoAvatarView),
    {
        ssr: false,
        loading: () => (
            <div className="relative bg-gray-900 rounded-xl border border-gray-700 h-[500px] w-full flex items-center justify-center shadow-xl">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-blue-100 font-medium">Loading Interview Room...</p>
                </div>
            </div>
        )
    }
);

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
};

interface InterviewDetails {
    jobPosition: string;
    duration: string;
    type: string;
    service_type?: 'audio' | 'video';
}

function DiscussionRoom() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.interview_id as string;

    // Add mounted state to prevent hydration issues
    const [mounted, setMounted] = useState(false);
    const [expert, setExpert] = useState<string | undefined>();
    const [isCallActive, setIsCallActive] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timeExceeded, setTimeExceeded] = useState(false);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
    const [questionSequence, setQuestionSequence] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [currentQuestionType, setCurrentQuestionType] = useState<string>('');

    // NEW: State for AI message and speaking status
    const [currentAIMessage, setCurrentAIMessage] = useState<string | null>(null);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    // TTS state for audio mode
    const [ttsVoices, setTTSVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [ttsReady, setTTSReady] = useState(false);

    // ✅ ADDED: Candidate information from localStorage
    const [candidateName, setCandidateName] = useState<string>('');
    const [candidateEmail, setCandidateEmail] = useState<string>('');
    const [candidateInfoLoaded, setCandidateInfoLoaded] = useState(false);
    const [interviewFeedbackId, setInterviewFeedbackId] = useState<number | null>(null);

    // ✅ ADDED: Feedback Dialog State
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [feedbackDialogMessage, setFeedbackDialogMessage] = useState('Crafting your performance feedback...');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastSentTranscriptRef = useRef<string>("");
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const interviewStartTimeRef = useRef<number | null>(null);
    // TTS refs
    const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    useEffect(() => {
        if (candidateEmail && interviewId) {
            fetchInterviewFeedbackId();
        }
    }, [candidateEmail, interviewId]);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();

    // ✅ ADDED: Load candidate information from localStorage
    useEffect(() => {
        if (!interviewId) return;

        try {
            const storedCandidateInfo = localStorage.getItem(`candidate_info_${interviewId}`);
            if (storedCandidateInfo) {
                const { userName, email } = JSON.parse(storedCandidateInfo);
                setCandidateName(userName || 'Candidate');
                setCandidateEmail(email || '');
                setCandidateInfoLoaded(true);
                console.log('✅ Loaded candidate info:', { userName, email });
            } else {
                // Fallback: Try to get from ResumeData table
                fetchCandidateInfoFromDatabase();
            }
        } catch (error) {
            console.error('❌ Error loading candidate info:', error);
            fetchCandidateInfoFromDatabase();
        }
    }, [interviewId]);

    const fetchCandidateInfoFromDatabase = async () => {
        try {
            const { data, error } = await supabase
                .from('ResumeData')
                .select('user_name, user_email')
                .eq('interview_id', interviewId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data && !error) {
                setCandidateName(data.user_name || 'Candidate');
                setCandidateEmail(data.user_email || '');
                console.log('✅ Fetched candidate info from database:', data);
            }
        } catch (error) {
            console.error('❌ Error fetching candidate info from database:', error);
        } finally {
            setCandidateInfoLoaded(true);
        }
    };

    // Initialize TTS
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setTTSVoices(voices);
            if (voices.length > 0) {
                setTTSReady(true);
                console.log("✅ TTS Voices loaded:", voices.map(v => v.name));
            }
        };

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            loadVoices();
            // Some browsers load voices asynchronously
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            console.error("❌ TTS not supported in this browser");
        }

        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const fetchInterviewFeedbackId = async () => {
        if (!candidateEmail || !interviewId) return;

        try {
            console.log('🔍 Looking for Interview-Feedback ID for:', candidateEmail);
            const { data, error } = await supabase
                .from('Interview-Feedback')
                .select('id, userEmail, created_at')
                .eq('interview_id', interviewId)
                .eq('userEmail', candidateEmail)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.error('❌ Error fetching feedback ID:', error);
                return;
            }

            if (data) {
                setInterviewFeedbackId(data.id);
                console.log('✅ Found Interview-Feedback ID:', data.id);

                // Store in localStorage for completed page
                localStorage.setItem(`feedback_id_${interviewId}`, data.id.toString());
            }
        } catch (error) {
            console.error('❌ Error in fetchInterviewFeedbackId:', error);
        }
    };

    // Speak text function for audio mode
    const speakText = (text: string) => {
        if (!ttsReady || !text) return;

        // Stop any ongoing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        ttsUtteranceRef.current = utterance;

        // Select voice
        const voices = ttsVoices;
        // Prefer female voices for interview context
        const femaleVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('zira')
        ) || voices[0];

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        // Configure voice settings
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Max volume

        // Event handlers
        utterance.onstart = () => {
            console.log("🎤 TTS started speaking");
            setIsAISpeaking(true);
        };

        utterance.onend = () => {
            console.log("✅ TTS finished speaking");
            setIsAISpeaking(false);
            setCurrentAIMessage(null);
            ttsUtteranceRef.current = null;
        };

        utterance.onerror = (event) => {
            console.error("❌ TTS error:", event);
            setIsAISpeaking(false);
            setCurrentAIMessage(null);
            ttsUtteranceRef.current = null;
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
    };

    // Stop TTS function
    const stopTTS = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsAISpeaking(false);
            ttsUtteranceRef.current = null;
        }
    };

    // Handle TTS for audio mode
    useEffect(() => {
        if (interviewDetails?.service_type === 'audio' &&
            currentAIMessage &&
            !isAISpeaking &&
            isCallActive) {

            console.log("🎯 Audio mode - Speaking message:", currentAIMessage.substring(0, 50));

            // Small delay to ensure state is ready
            setTimeout(() => {
                speakText(currentAIMessage);
            }, 300);
        }
    }, [currentAIMessage, interviewDetails?.service_type, isCallActive]);

    // Clean up TTS on unmount
    useEffect(() => {
        return () => {
            stopTTS();
        };
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const parseDurationToMinutes = (duration: string): number => {
        const durationLower = duration.toLowerCase();
        if (durationLower.includes('hour') || durationLower.includes('hr')) return 60;
        if (durationLower.includes('45')) return 45;
        if (durationLower.includes('15')) return 15;
        return 30;
    };

    const scheduledDurationMinutes = interviewDetails ? parseDurationToMinutes(interviewDetails.duration) : 30;
    const scheduledDurationSeconds = scheduledDurationMinutes * 60;
    const timePercentage = (elapsedTime / scheduledDurationSeconds) * 100;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const convertMessagesToConversation = (messages: Message[]): any[] => {
        return messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
            timestamp: msg.timestamp
        }));
    };

    const generateAndStoreFeedback = async () => {
        if (isGeneratingFeedback) return;
        setIsGeneratingFeedback(true);

        // Update dialog message
        setFeedbackDialogMessage('Analyzing your responses and generating feedback...');

        try {
            console.log('🔄 Generating feedback...');
            const conversation = convertMessagesToConversation(messages);

            // Update dialog message
            setFeedbackDialogMessage('Sending data to AI for detailed analysis...');

            const response = await fetch('/api/ai-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interviewId: interviewId,
                    userName: candidateName || 'Unknown Candidate',
                    userEmail: candidateEmail || 'unknown@example.com',
                    conversation: conversation
                }),
            });

            // Update dialog message
            setFeedbackDialogMessage('Finalizing your performance report...');

            if (response.ok) {
                console.log('✅ Feedback stored');
                // Update dialog message
                setFeedbackDialogMessage('Feedback generated successfully! Redirecting...');

                // Small delay for user to read the success message
                setTimeout(() => {
                    setShowFeedbackDialog(false);
                    router.push(`/interview/${interviewId}/completed`);
                }, 1500);
            } else {
                throw new Error('Feedback generation failed');
            }
        } catch (error) {
            console.error('❌ Error generating feedback:', error);
            setFeedbackDialogMessage('Error generating feedback. Please try again.');
            setTimeout(() => {
                setShowFeedbackDialog(false);
                router.push(`/interview/${interviewId}/completed`);
            }, 2000);
        } finally {
            setIsGeneratingFeedback(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallActive && interviewStartTimeRef.current !== null) {
            interval = setInterval(() => {
                setElapsedTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= scheduledDurationSeconds && !timeExceeded) {
                        setTimeExceeded(true);
                        handleSendMessage("[TIME_EXCEEDED_AUTO]");
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isCallActive, scheduledDurationSeconds, timeExceeded]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isCallActive || !transcript || timeExceeded) return;
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        silenceTimerRef.current = setTimeout(() => {
            if (transcript.trim() && transcript.trim() !== lastSentTranscriptRef.current) {
                handleSendMessage(transcript.trim());
                lastSentTranscriptRef.current = transcript.trim();
                resetTranscript();
            }
        }, 5000);

        return () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); };
    }, [transcript, isCallActive, timeExceeded]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const isTimeExceededAuto = text === "[TIME_EXCEEDED_AUTO]";

        if (!isTimeExceededAuto) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: text,
                sender: 'user',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newMessage]);

            // ✅ CRITICAL FIX: Store conversation with interview_feedback_id
            if (currentQuestion && questionSequence > 0 && interviewFeedbackId) {
                try {
                    console.log('💾 Storing conversation with feedback_id:', interviewFeedbackId);

                    const conversationRecord: ConversationRecord = {
                        interview_id: interviewId,
                        interview_feedback_id: interviewFeedbackId,
                        question_sequence: questionSequence,
                        question_type: currentQuestionType,
                        ai_question: currentQuestion,
                        candidate_answer: text,
                        ai_response: ''
                    };

                    await analyzeAndStoreConversation(conversationRecord);
                    console.log('✅ Conversation stored successfully');
                } catch (error) {
                    console.error('❌ Error storing conversation:', error);
                }
            }
        }

        setIsLoading(true);

        try {
            const response = await getAIResponse(
                isTimeExceededAuto ? "[TIME_EXCEEDED]" : text,
                interviewId,
                elapsedTime,
                scheduledDurationSeconds,
                timeExceeded,
                candidateName,
                candidateEmail
            );

            response.messages.forEach((aiMessage: any, index: number) => {
                setTimeout(() => {
                    const aiResponse: Message = {
                        id: (Date.now() + index + 1).toString(),
                        text: aiMessage.text,
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiResponse]);

                    if (aiMessage.isQuestion) {
                        setQuestionSequence(prev => prev + 1);
                        setCurrentQuestion(aiMessage.text);
                        setCurrentQuestionType(aiMessage.questionType || 'general');
                    }

                    setCurrentAIMessage(aiMessage.text);
                }, index * 1000);
            });

        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble responding. Please continue.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleStartCall = async () => {
        try {
            setError(null);
            setMessages([]);
            resetTranscript();
            lastSentTranscriptRef.current = "";
            setIsCallActive(true);
            setElapsedTime(0);
            setTimeExceeded(false);
            interviewStartTimeRef.current = Date.now();
            setIsLoading(true);

            const response = await getAIResponse(
            null,
            interviewId,
            0,
            scheduledDurationSeconds,
            false,
            candidateName,
            candidateEmail
        );

            response.messages.forEach((aiMessage: any, index: number) => {
                setTimeout(() => {
                    const greetingMessage: Message = {
                        id: (Date.now() + index).toString(),
                        text: aiMessage.text,
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, greetingMessage]);

                    if (index === 0) {
                        setCurrentAIMessage(aiMessage.text);
                        // Audio mode TTS will be triggered by useEffect
                    }
                }, index * 1500);
            });
            setIsLoading(false);

            await SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        } catch (err: any) {
            setError(err.message);
            setIsCallActive(false);
            setIsLoading(false);
        }
    };

    const handleEndCall = async () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Stop TTS if speaking
        stopTTS();

        setIsAISpeaking(false);
        setCurrentAIMessage(null);

        if (transcript.trim() && transcript.trim() !== lastSentTranscriptRef.current && !timeExceeded) {
            await handleSendMessage(transcript.trim());
        }

        await SpeechRecognition.stopListening();
        resetTranscript();
        setIsCallActive(false);

        // Show feedback dialog
        setShowFeedbackDialog(true);

        // Generate feedback (this will handle the redirect)
        await generateAndStoreFeedback();

        // Clear conversation history after feedback is generated
        clearConversationHistory(interviewId);
    };

    const handleToggleMute = async () => {
        if (listening) {
            await SpeechRecognition.stopListening();
        } else {
            await SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        }
    };

    useEffect(() => {
        const GetDetails = async () => {
            const { data, error } = await supabase
                .from("Interviews")
                .select("jobPosition, duration, type, service_type")
                .eq("interview_id", interviewId);
            if (data && data.length > 0) {
                setExpert(data[0].jobPosition);
                setInterviewDetails({
                    jobPosition: data[0].jobPosition,
                    duration: data[0].duration,
                    type: data[0].type,
                    service_type: data[0].service_type as 'audio' | 'video'
                });
            }
        };
        GetDetails();
        return () => {
            SpeechRecognition.stopListening();
            stopTTS();
        };
    }, [interviewId]);

    const getTimerColor = () => {
        if (timeExceeded) return 'text-red-600';
        if (timePercentage > 80) return 'text-orange-500';
        if (timePercentage > 60) return 'text-yellow-500';
        return 'text-green-600';
    };

    if (!mounted) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!browserSupportsSpeechRecognition) return <div className="p-10 text-center">Browser not supported.</div>;

    // Separate props for VideoAvatarView and AudioAvatarView
    const baseAvatarProps = {
        expert,
        isSpeaking: isAISpeaking,
        isLoading,
        timeExceeded,
        listening,
        userPicture: undefined, // Not using admin picture
        userName: candidateName
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 relative">
                {/* Blur overlay when dialog is open */}
                {showFeedbackDialog && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all duration-300" />
                )}

                <div className={`max-w-7xl mx-auto mb-8 flex justify-between items-end ${showFeedbackDialog ? 'blur-sm pointer-events-none' : ''}`}>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Discussion Room</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-gray-600 font-medium">{expert} Interview</span>
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                                {interviewDetails?.service_type === 'video' ? 'VIDEO MODE' : 'AUDIO MODE'}
                            </span>
                        </div>
                    </div>

                    {/* Header Stats */}
                    <div className="flex gap-4">
                        {isCallActive && (
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                                <Clock className={`w-5 h-5 ${getTimerColor()}`} />
                                <div>
                                    <p className={`text-xl font-bold leading-none ${getTimerColor()}`}>{formatTime(elapsedTime)}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">ELAPSED TIME</p>
                                </div>
                            </div>
                        )}
                        <div className="bg-white px-2 py-2 pr-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                <UserIcon className="p-2 w-full h-full text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{candidateName || 'Candidate'}</p>
                                <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ONLINE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto h-[calc(100vh-180px)] ${showFeedbackDialog ? 'blur-sm pointer-events-none' : ''}`}>
                    {/* Left Column: Avatar & Controls */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative flex flex-col">
                            {/* Avatar Container */}
                            <div className="flex-1 relative bg-gray-900">
                                {interviewDetails?.service_type === 'video' ? (
                                    <VideoAvatarView
                                        {...baseAvatarProps}
                                        aiMessage={currentAIMessage}
                                        onMessageComplete={() => {
                                            setIsAISpeaking(false);
                                            setCurrentAIMessage(null);
                                        }}
                                    />
                                ) : (
                                    <AudioAvatarView
                                        {...baseAvatarProps}
                                    />
                                )}
                            </div>

                            {/* Control Bar */}
                            <div className="h-20 bg-white border-t border-gray-100 flex items-center justify-center gap-4 px-6 z-10">
                                {!isCallActive ? (
                                    <Button onClick={handleStartCall} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-full shadow-lg shadow-blue-200 font-semibold text-lg transition-all hover:scale-105">
                                        Start Interview
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleToggleMute}
                                            variant={listening ? "default" : "destructive"}
                                            className={`w-12 h-12 rounded-full p-0 flex items-center justify-center transition-all ${listening ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600 border-2 border-red-100'}`}
                                        >
                                            {listening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                        </Button>

                                        <Button
                                            onClick={handleEndCall}
                                            disabled={showFeedbackDialog}
                                            className="bg-red-600 hover:bg-red-700 text-white px-6 h-12 rounded-full font-semibold shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            End Interview
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chat */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden h-full">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-blue-500" /> Transcript
                            </h3>
                            {listening && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                    <MessageCircle className="w-12 h-12 mb-2" />
                                    <p className="text-sm">Conversation will appear here</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            {/* Live Transcript Bubble */}
                            {transcript && isCallActive && (
                                <div className="flex justify-end">
                                    <div className="max-w-[85%] rounded-2xl p-3 text-sm shadow-sm bg-blue-50 text-blue-800 border border-blue-100 animate-pulse">
                                        <p className="text-[10px] font-bold mb-1 opacity-70">LISTENING...</p>
                                        {transcript}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Beautiful Feedback Dialog */}
            <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
                <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none">
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-md w-full mx-4 overflow-hidden">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-80"></div>

                            {/* Animated dots */}
                            <div className="absolute top-0 left-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-x-10 -translate-y-10"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full translate-x-10 translate-y-10"></div>

                            <div className="relative z-10 p-8">
                                <DialogHeader className="text-center space-y-6">
                                    {/* Animated spinner */}
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
                                            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                            Crafting Your Performance Feedback
                                        </DialogTitle>

                                        <DialogDescription className="text-gray-600 text-base leading-relaxed">
                                            {feedbackDialogMessage}
                                        </DialogDescription>

                                        <div className="space-y-3 pt-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm text-gray-600">Analyzing your responses</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150"></div>
                                                <span className="text-sm text-gray-600">Generating detailed insights</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                                                <span className="text-sm text-gray-600">Preparing your report</span>
                                            </div>
                                        </div>
                                    </div>
                                </DialogHeader>

                                {/* Progress bar */}
                                <div className="mt-8">
                                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full animate-shimmer"></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Please wait while we prepare your personalized feedback...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add shimmer animation */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                    background-size: 200% 100%;
                }
            `}</style>
        </>
    );
}

export default DiscussionRoom;
