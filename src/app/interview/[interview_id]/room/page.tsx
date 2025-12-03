// src/app/interview/[interview_id]/room/page.tsx
"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, MessageCircle, Mic, MicOff, UserIcon, Video, Volume2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { AIMessage, analyzeAndStoreConversation, clearConversationHistory, getAIResponse, getConversationHistory } from "../../../../../services/groqService";
import { supabase } from "../../../../../services/supabaseClient";

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
}

function DiscussionRoom() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.interview_id as string;
    const [expert, setExpert] = useState<string | undefined>();
    const [isCallActive, setIsCallActive] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timeExceeded, setTimeExceeded] = useState(false);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
    const [questionSequence, setQuestionSequence] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [currentQuestionType, setCurrentQuestionType] = useState<string>('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastSentTranscriptRef = useRef<string>("");
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const interviewStartTimeRef = useRef<number | null>(null);

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

    // Parse duration string to minutes
    const parseDurationToMinutes = (duration: string): number => {
        const durationLower = duration.toLowerCase();
        if (durationLower.includes('hour') || durationLower.includes('hr')) {
            return 60;
        } else if (durationLower.includes('45')) {
            return 45;
        } else if (durationLower.includes('30')) {
            return 30;
        } else if (durationLower.includes('15')) {
            return 15;
        }
        return 30;
    };

    // Calculate time status
    const scheduledDurationMinutes = interviewDetails ? parseDurationToMinutes(interviewDetails.duration) : 30;
    const scheduledDurationSeconds = scheduledDurationMinutes * 60;
    const remainingTime = Math.max(0, scheduledDurationSeconds - elapsedTime);
    const timePercentage = (elapsedTime / scheduledDurationSeconds) * 100;

    // Format time display
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
            console.log('🔄 Generating feedback for interview:', interviewId);
            console.log('💬 Current messages count:', messages.length);

            // Convert messages to conversation format for API
            const conversation = convertMessagesToConversation(messages);
            console.log('📋 Conversation prepared for API:', conversation.length, 'entries');

            // Test API endpoint first
            try {
                const testResponse = await fetch('/api/ai-feedback', { method: 'GET' });
                console.log('🔧 API Test Response:', testResponse.status, testResponse.statusText);
                if (!testResponse.ok) {
                    throw new Error(`API route test failed with status: ${testResponse.status}`);
                }
            } catch (testError) {
                console.error('❌ API route test failed:', testError);
                throw new Error('AI Feedback API is not available');
            }

            // Make the POST request with conversation data
            console.log('📡 Making POST request to AI feedback API...');
            const response = await fetch('/api/ai-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewId: interviewId,
                    userName: user?.name || 'Unknown',
                    userEmail: user?.email || 'unknown@example.com',
                    conversation: conversation // Send the actual conversation data
                }),
            });

            console.log('📡 API Response status:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Feedback generated and stored successfully');
                console.log('📊 AI Feedback Result:', result.feedback);

                // Log the feedback to console as requested
                console.log('🎯 FINAL INTERVIEW FEEDBACK:', {
                    ratings: result.feedback.rating,
                    summary: result.feedback.summary,
                    recommendation: result.feedback.recommendation,
                    recommendationMsg: result.feedback.recommendationMsg
                });
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to generate feedback:', response.status, errorText);
                throw new Error(`Feedback generation failed: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error generating feedback:', error);
            // You can show a toast notification here if needed
        } finally {
            setIsGeneratingFeedback(false);
        }
    };


    // Timer effect
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

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCallActive, scheduledDurationSeconds, timeExceeded]);

    // Text-to-Speech function
    const speakText = (text: string) => {
        if (!isSpeechEnabled) return;

        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesisRef.current = utterance;

        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
        };

        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = voices.filter(voice =>
            voice.lang.includes('en') &&
            (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Samantha'))
        );

        if (preferredVoices.length > 0) {
            utterance.voice = preferredVoices[1];
        }

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeech = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            stopSpeech();
        }
        setIsSpeechEnabled(!isSpeechEnabled);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-send logic
    useEffect(() => {
        if (!isCallActive || !transcript || timeExceeded) return;

        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
            if (transcript.trim() && transcript.trim() !== lastSentTranscriptRef.current) {
                handleSendMessage(transcript.trim());
                lastSentTranscriptRef.current = transcript.trim();
                resetTranscript();
            }
        }, 5000);

        return () => {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };
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

            // Store the conversation analysis when user answers a question
            if (currentQuestion && questionSequence > 0) {
                try {
                    // Find the last AI message (the question)
                    const lastAIMessage = [...messages].reverse().find(msg => msg.sender === 'ai');

                    if (lastAIMessage) {
                        await analyzeAndStoreConversation({
                            interview_id: interviewId,
                            question_sequence: questionSequence,
                            question_type: currentQuestionType,
                            ai_question: currentQuestion,
                            candidate_answer: text,
                            ai_response: '' // This will be updated when AI responds
                        });
                    }
                } catch (error) {
                    console.error('Error storing conversation analysis:', error);
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

            response.messages.forEach((aiMessage: AIMessage, index: number) => {
                setTimeout(() => {
                    const aiResponse: Message = {
                        id: (Date.now() + index + 1).toString(),
                        text: aiMessage.text,
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiResponse]);

                    // Check if this is a new question from AI
                    if (aiMessage.isQuestion) {
                        const newSequence = questionSequence + 1;
                        setQuestionSequence(newSequence);
                        setCurrentQuestion(aiMessage.text);
                        setCurrentQuestionType(aiMessage.questionType || 'general');

                        console.log(`🎯 New question detected: Sequence ${newSequence}, Type: ${aiMessage.questionType}`);
                    }

                    if (isSpeechEnabled) {
                        setTimeout(() => {
                            speakText(aiMessage.text);
                        }, index * 500);
                    }
                }, index * 1000);
            });

        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I apologize, but I'm having trouble responding right now. Please continue with your answer.",
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
                false
            );

            response.messages.forEach((aiMessage: AIMessage, index: number) => {
                setTimeout(() => {
                    const greetingMessage: Message = {
                        id: (Date.now() + index).toString(),
                        text: aiMessage.text,
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, greetingMessage]);

                    if (isSpeechEnabled) {
                        setTimeout(() => {
                            speakText(aiMessage.text);
                        }, index * 500);
                    }
                }, index * 1500);
            });
            setIsLoading(false);

            await SpeechRecognition.startListening({
                continuous: true,
                language: 'en-IN'
            });
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message);
            setIsCallActive(false);
            setIsLoading(false);
        }
    };

    const handleEndCall = async () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        stopSpeech();

        // Send any remaining transcript
        if (transcript.trim() && transcript.trim() !== lastSentTranscriptRef.current && !timeExceeded) {
            await handleSendMessage(transcript.trim());
        }

        await SpeechRecognition.stopListening();
        resetTranscript();
        lastSentTranscriptRef.current = "";
        setIsCallActive(false);
        interviewStartTimeRef.current = null;

        // Generate feedback BEFORE clearing conversation
        console.log('📝 Interview ended, generating feedback...');
        console.log('💬 Messages available for feedback:', messages.length);

        await generateAndStoreFeedback();

        // Only clear conversation after successful feedback generation
        console.log('🧹 Clearing conversation history...');
        clearConversationHistory(interviewId);

        // Redirect to completed page
        console.log('🔄 Redirecting to completed page...');
        router.push(`/interview/${interviewId}/completed`);
    };

    const handleToggleMute = async () => {
        if (listening) {
            await SpeechRecognition.stopListening();
        } else {
            await SpeechRecognition.startListening({
                continuous: true,
                language: 'en-IN'
            });
        }
    };

    // Cleanup effects
    useEffect(() => {
        return () => {
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        GetDetails();
        return () => {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
            SpeechRecognition.stopListening();
            stopSpeech();
            // Don't clear conversation history here to preserve it for feedback
        };
    }, []);

    const GetDetails = async () => {
        try {
            const { data: Interviews, error } = await supabase
                .from("Interviews")
                .select("jobPosition, duration, type")
                .eq("interview_id", interviewId);

            if (error) {
                console.error("Error fetching interview details:", error.message);
            } else if (Interviews && Interviews.length > 0) {
                const interview = Interviews[0];
                setExpert(interview.jobPosition);
                setInterviewDetails({
                    jobPosition: interview.jobPosition,
                    duration: interview.duration,
                    type: interview.type
                });
            }
        } catch (error) {
            console.error('Error in GetDetails:', error);
        }
    };

    // Get timer color based on time status
    const getTimerColor = () => {
        if (timeExceeded) return 'text-red-600';
        if (timePercentage > 80) return 'text-orange-500';
        if (timePercentage > 60) return 'text-yellow-500';
        return 'text-green-600';
    };

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 p-6 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Browser Not Supported</h2>
                    <p className="text-gray-600 mb-4">
                        Speech recognition is not supported in this browser.
                    </p>
                    <p className="text-sm text-gray-500">
                        Please use Chrome (recommended), Edge, or Safari 14.1+
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Discussion Room</h1>
                    <p className="text-gray-600 mt-2">Live interview session with {expert} Expert</p>
                </div>

                {/* Timer Display */}
                <div className="flex items-center gap-6">
                    {isCallActive && interviewDetails && (
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                            <div className="flex items-center gap-3">
                                <Clock className={`w-5 h-5 ${getTimerColor()}`} />
                                <div className="text-center">
                                    <div className={`text-lg font-bold ${getTimerColor()}`}>
                                        {formatTime(elapsedTime)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        of {scheduledDurationMinutes} min
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-1000 ${timeExceeded ? 'bg-red-500' :
                                        timePercentage > 80 ? 'bg-orange-500' :
                                            timePercentage > 60 ? 'bg-yellow-400' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(timePercentage, 100)}%` }}
                                ></div>
                            </div>

                            {timeExceeded && (
                                <div className="mt-2 flex items-center gap-1 text-red-600 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Time exceeded - wrapping up</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                        {user?.picture ? (
                            <Image
                                src={user.picture}
                                alt="User profile"
                                width={40}
                                height={40}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <UserIcon className="w-8 h-8 text-blue-500" />
                        )}
                        <span className="font-medium text-gray-700">{user?.name || "User"}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p className="font-medium">Error: {error}</p>
                </div>
            )}

            {isMicrophoneAvailable === false && (
                <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                    <p className="font-medium">Microphone access denied. Please enable it in browser settings.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Audio Call</h2>
                            <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className={isCallActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                    {isCallActive ? 'Live' : 'Ready'}
                                </span>
                                {isSpeaking && (
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <Volume2 className="w-3 h-3 animate-pulse" />
                                        <span className="text-xs">Speaking</span>
                                    </div>
                                )}
                                {timeExceeded && (
                                    <div className="flex items-center gap-1 text-red-600">
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="text-xs">Wrapping up</span>
                                    </div>
                                )}
                                {isGeneratingFeedback && (
                                    <div className="flex items-center gap-1 text-purple-600">
                                        <AlertCircle className="w-3 h-3 animate-spin" />
                                        <span className="text-xs">Generating Feedback</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 h-96 flex flex-col items-center justify-center">
                            <div className="text-center mb-8">
                                <div className="relative">
                                    <Image
                                        src={"/ai-agent-sara.png"}
                                        alt="AI Interviewer"
                                        width={120}
                                        height={120}
                                        className={`h-24 w-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg ${isSpeaking ? 'animate-pulse' : ''}`}
                                    />
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        AI Interviewer
                                    </div>
                                    {isLoading && (
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                            Thinking...
                                        </div>
                                    )}
                                    {isSpeaking && (
                                        <div className="absolute -top-2 right-0 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                            Speaking
                                        </div>
                                    )}
                                    {timeExceeded && (
                                        <div className="absolute -top-2 left-0 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                            Closing
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-gray-700 font-medium mt-6">{expert} Expert</h3>
                                {listening && !timeExceeded && (
                                    <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-medium">
                                        <Mic className="w-4 h-4 animate-pulse" />
                                        Listening...
                                    </div>
                                )}
                                {timeExceeded && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium">
                                        <AlertCircle className="w-4 h-4" />
                                        Interview concluding...
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-6 right-6">
                                <div className="bg-white rounded-lg shadow-lg p-2 border-2 border-blue-300">
                                    <div className="w-32 h-24 bg-gradient-to-br from-cyan-200 to-blue-200 rounded flex items-center justify-center relative">
                                        {user?.picture ? (
                                            <Image
                                                src={user.picture}
                                                alt="User"
                                                width={60}
                                                height={60}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                            />
                                        ) : (
                                            <UserIcon className="w-12 h-12 text-blue-400" />
                                        )}
                                        {listening && !timeExceeded && (
                                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                                                <Mic className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-xs text-gray-600 font-medium">You</span>
                                        {!listening && isCallActive && !timeExceeded && (
                                            <div className="text-xs text-red-600 font-bold mt-1 flex items-center justify-center gap-1">
                                                <MicOff className="w-3 h-3" />
                                                MUTED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call Buttons */}
                        <div className="flex justify-center gap-4 mt-6">
                            {!isCallActive ? (
                                <Button
                                    onClick={handleStartCall}
                                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                                >
                                    <Video className="w-5 h-5" />
                                    Start Call
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleToggleMute}
                                        disabled={timeExceeded}
                                        className={`${!listening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} ${timeExceeded ? 'opacity-50 cursor-not-allowed' : ''} text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer`}
                                    >
                                        {!listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        {!listening ? 'Unmute' : 'Mute'}
                                    </Button>
                                    <Button
                                        onClick={handleEndCall}
                                        disabled={isGeneratingFeedback}
                                        className={`bg-red-500 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer ${isGeneratingFeedback ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Video className="w-5 h-5" />
                                        {isGeneratingFeedback ? 'Processing...' : 'End Call'}
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Live Transcription */}
                        {transcript && isCallActive && !timeExceeded && (
                            <div className="mt-6 bg-white/95 rounded-lg p-4 shadow-lg border-2 border-green-300">
                                <div className="flex items-start gap-2">
                                    <Mic className="w-4 h-4 text-green-500 mt-1 flex-shrink-0 animate-pulse" />
                                    <div className="flex-1">
                                        <p className="text-xs text-green-600 mb-1 font-bold uppercase">● Live Transcription</p>
                                        <p className="text-base text-gray-800 font-medium">{transcript}</p>
                                        <p className="text-xs text-gray-500 mt-2">Auto-sending in 5 seconds...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Time exceeded notice */}
                        {timeExceeded && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="font-medium">Interview time completed</p>
                                </div>
                                <p className="text-sm text-red-600 mt-1">
                                    The AI interviewer will now ask final closing questions to wrap up the interview.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-blue-500" />
                                Live Chat
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${listening ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {listening ? '● REC' : 'IDLE'}
                                </div>
                                {isSpeaking && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                        <Volume2 className="w-3 h-3 animate-pulse" />
                                        TTS
                                    </div>
                                )}
                                {timeExceeded && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                        <Clock className="w-3 h-3" />
                                        TIME UP
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-b from-blue-50/50 to-cyan-50/50 rounded-xl p-4 overflow-y-auto">
                            {messages.length > 0 ? (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} ${isLoading && message.sender === 'ai' ? 'opacity-70' : ''}`}>
                                                <p className="text-sm break-words">{message.text}</p>
                                                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white text-gray-700 max-w-[85%] rounded-2xl px-4 py-3 shadow-sm">
                                                <div className="flex space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm font-medium">Start the call to begin your interview</p>
                                        <p className="text-xs mt-1">The AI interviewer will greet you first</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscussionRoom;