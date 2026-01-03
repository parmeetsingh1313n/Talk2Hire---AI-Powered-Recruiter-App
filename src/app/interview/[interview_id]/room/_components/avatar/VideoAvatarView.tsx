'use client';
import { Mic, Volume2 } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import 'regenerator-runtime/runtime';
import { useAvatarLipsync } from './AvatarLipsyncHook';

const AvatarScene = lazy(() => import('./AvatarScene').then(mod => ({ default: mod.AvatarScene })));

interface VideoAvatarViewProps {
    expert?: string;
    isSpeaking?: boolean;
    isLoading?: boolean;
    timeExceeded?: boolean;
    listening?: boolean;
    userPicture?: string;
    userName?: string;
    // FIX: Allow null here to match parent state
    aiMessage?: string | null;
    onMessageComplete?: () => void;
}

export function VideoAvatarView({
    expert,
    isSpeaking: externalIsSpeaking = false,
    isLoading = false,
    timeExceeded = false,
    listening = false,
    userPicture,
    userName = 'You',
    aiMessage = null,
    onMessageComplete
}: VideoAvatarViewProps) {
    const [avatarReady, setAvatarReady] = useState(false);
    const [mounted, setMounted] = useState(false);
    const lastMessageRef = useRef<string | null>(null);
    const isProcessingRef = useRef(false);

    const {
        currentViseme,
        isProcessing: lipsyncProcessing,
        isSpeaking: lipsyncSpeaking,
        audioReady,
        playTextWithLipsync,
        stopLipsyncProcessing
    } = useAvatarLipsync();

    const actualIsSpeaking = lipsyncSpeaking;
    const actualIsProcessing = lipsyncProcessing;

    useEffect(() => {
        setMounted(true);
        return () => {
            stopLipsyncProcessing();
        };
    }, [stopLipsyncProcessing]);

    // Handle new AI messages
    useEffect(() => {
        if (!aiMessage || !audioReady || lastMessageRef.current === aiMessage) {
            return;
        }

        console.log(`🎯 [VideoAvatarView] NEW MESSAGE: "${aiMessage.substring(0, 30)}..."`);
        lastMessageRef.current = aiMessage;
        isProcessingRef.current = true;

        // Reset speech before starting new one
        stopLipsyncProcessing();

        setTimeout(() => {
            playTextWithLipsync(
                aiMessage,
                { rate: 1.0, pitch: 1.0, volume: 1.0 },
                () => {
                    console.log("✅ TTS Complete");
                    isProcessingRef.current = false;
                    lastMessageRef.current = null;
                    if (onMessageComplete) {
                        onMessageComplete();
                    }
                }
            );
        }, 50);

    }, [aiMessage, audioReady, playTextWithLipsync, stopLipsyncProcessing, onMessageComplete]);

    if (!mounted) {
        return (
            <div className="relative bg-gray-900 rounded-xl border border-gray-700 h-96 w-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-900 rounded-xl border border-gray-700 h-[500px] w-full overflow-hidden shadow-2xl group">
            <div className="absolute inset-0">
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-blue-200 text-sm font-medium">Entering Room...</p>
                        </div>
                    </div>
                }>
                    <AvatarScene
                        isSpeaking={actualIsSpeaking}
                        isProcessing={actualIsProcessing}
                        currentViseme={currentViseme}
                        facialExpression="professional"
                        isListening={listening}
                        hasPendingMessage={!!aiMessage && !actualIsSpeaking}
                        onAvatarReady={() => setAvatarReady(true)}
                    />
                </Suspense>
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">

                {/* Status Bar */}
                <div className="flex justify-between items-start">
                    <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${avatarReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-white text-xs font-semibold tracking-wide">
                                {avatarReady ? 'INTERVIEWER ONLINE' : 'CONNECTING...'}
                            </span>
                        </div>
                        {expert && (
                            <p className="text-blue-200 text-[10px] mt-1 uppercase tracking-wider font-medium pl-4.5">{expert} Expert</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        {isLoading && (
                            <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                Thinking...
                            </div>
                        )}
                        {actualIsSpeaking && (
                            <div className="bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                                <Volume2 className="w-3 h-3 animate-pulse" />
                                Speaking
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer User Info */}
                <div className="flex justify-end items-end">
                    <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10 pointer-events-auto flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20">
                                {userPicture ? (
                                    <img src={userPicture} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        {userName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {listening && !timeExceeded && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-black">
                                    <Mic className="w-2 h-2 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}