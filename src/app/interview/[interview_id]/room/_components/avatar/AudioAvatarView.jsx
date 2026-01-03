'use client';
import Image from 'next/image';
import { UserIcon, Mic, MicOff, Volume2, AlertCircle, Radio } from 'lucide-react';


export function AudioAvatarView({
    expert,
    isSpeaking = false,
    isLoading = false,
    timeExceeded = false,
    listening = false,
    userPicture,
    userName = 'You'
}) {
    return (
        <div className="relative bg-gray-900 rounded-xl border border-gray-700 h-[500px] w-full overflow-hidden shadow-2xl group">

            {/* 1. Background Image (Matches Video View) */}
            <div className="absolute inset-0">
                <Image
                    src="/interview-room-bg.jpg"
                    alt="Interview Room"
                    fill
                    className="object-cover opacity-60 blur-sm scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
            </div>

            {/* 2. Center Content (AI Avatar) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">

                {/* AI Profile Circle */}
                <div className="relative mb-6">
                    {/* Ripple Effect when speaking */}
                    {isSpeaking && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                            <div className="absolute -inset-4 rounded-full bg-blue-400/10 animate-pulse delay-75" />
                        </>
                    )}

                    <div className={`relative h-32 w-32 rounded-full p-1 ${isSpeaking ? 'bg-gradient-to-tr from-blue-400 to-emerald-400' : 'bg-gray-600'}`}>
                        <div className="h-full w-full rounded-full overflow-hidden border-4 border-gray-800 bg-gray-800 relative">
                            <Image
                                src="/ai-agent-sara.png" // Ensure you have this image
                                alt="AI Interviewer"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Status Badge on Avatar */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            {isLoading ? (
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" /> THINKING
                                </span>
                            ) : isSpeaking ? (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Volume2 className="w-3 h-3" /> SPEAKING
                                </span>
                            ) : (
                                <span className="bg-gray-700 text-gray-300 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-gray-600">
                                    LISTENING
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Waveform Visualization (CSS Animation) */}
                {isSpeaking && (
                    <div className="flex items-center justify-center gap-1 h-8">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 bg-blue-400 rounded-full animate-pulse"
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    animationDuration: `${0.4 + Math.random() * 0.5}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 3. UI Overlay (Identical to Video View) */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">

                {/* Header Status Bar */}
                <div className="flex justify-between items-start">
                    <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-white text-xs font-semibold tracking-wide">
                                INTERVIEWER ONLINE
                            </span>
                        </div>
                        {expert && (
                            <p className="text-blue-200 text-[10px] mt-1 uppercase tracking-wider font-medium pl-4.5">
                                {expert} Expert
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10">
                            <Radio className="w-3 h-3 text-blue-400" />
                            Audio Mode
                        </div>
                        {timeExceeded && (
                            <div className="bg-red-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                                <AlertCircle className="w-3 h-3" /> Closing...
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer User Info */}
                <div className="flex justify-end items-end">
                    <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10 pointer-events-auto flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20 bg-gray-800 flex items-center justify-center">
                                {userPicture ? (
                                    <Image
                                        src={userPicture}
                                        alt="User"
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        {userName.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Mic Status Badge */}
                            <div className={`absolute -top-1 -right-1 rounded-full p-1 border-2 border-black ${listening && !timeExceeded ? 'bg-green-500' : 'bg-red-500'}`}>
                                {listening && !timeExceeded ? (
                                    <Mic className="w-2 h-2 text-white" />
                                ) : (
                                    <MicOff className="w-2 h-2 text-white" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}