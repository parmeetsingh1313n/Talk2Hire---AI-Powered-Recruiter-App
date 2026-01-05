'use client';
// Import regenerator-runtime FIRST
import 'regenerator-runtime/runtime';
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, MessageCircle, Mic, MicOff, UserIcon, Video } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import dynamic from 'next/dynamic';
import { AIMessage, analyzeAndStoreConversation, clearConversationHistory, getAIResponse } from "../../../../../services/groqService";
import { supabase } from "../../../../../services/supabaseClient";
import { AudioAvatarView } from "./_components/avatar/AudioAvatarView";

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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastSentTranscriptRef = useRef<string>("");
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const interviewStartTimeRef = useRef<number | null>(null);
    // TTS refs
    const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const { user } = useUser() as {
        user: {
            name?: string;
            picture?: string;
            email?: string;
        };
    };

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();

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
        try {
            console.log('🔄 Generating feedback...');
            const conversation = convertMessagesToConversation(messages);
            const response = await fetch('/api/ai-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interviewId: interviewId,
                    userName: user?.name || 'Unknown',
                    userEmail: user?.email || 'unknown@example.com',
                    conversation: conversation
                }),
            });

            if (response.ok) {
                console.log('✅ Feedback stored');
            } else {
                throw new Error('Feedback generation failed');
            }
        } catch (error) {
            console.error('❌ Error generating feedback:', error);
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

            if (currentQuestion && questionSequence > 0) {
                try {
                    await analyzeAndStoreConversation({
                        interview_id: interviewId,
                        question_sequence: questionSequence,
                        question_type: currentQuestionType,
                        ai_question: currentQuestion,
                        candidate_answer: text,
                        ai_response: ''
                    });
                } catch (error) {
                    console.error('Error storing analysis:', error);
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
                timeExceeded
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

                    // Trigger Avatar - Set AI message for both video and audio modes
                    setCurrentAIMessage(aiMessage.text);

                    // For video mode, setIsAISpeaking is handled by VideoAvatarView
                    // For audio mode, TTS will be triggered by useEffect above

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

            const response = await getAIResponse(null, interviewId, 0, scheduledDurationSeconds, false);

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

        await generateAndStoreFeedback();
        clearConversationHistory(interviewId);
        router.push(`/interview/${interviewId}/completed`);
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
        userPicture: user?.picture,
        userName: user?.name
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-end">
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            {user?.picture ? (
                                <Image src={user.picture} width={40} height={40} alt="User" />
                            ) : <UserIcon className="p-2 w-full h-full text-gray-400" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{user?.name || 'Candidate'}</p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ONLINE
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto h-[calc(100vh-180px)]">
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
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 h-12 rounded-full font-semibold shadow-lg shadow-red-100"
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
    );
}

export default DiscussionRoom;
