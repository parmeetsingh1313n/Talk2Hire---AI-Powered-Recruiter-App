"use client"
import { useUser } from '@/app/provider';
import { useTypewriter } from '@/hooks/useTypeWriter';
import { Calendar, User2Icon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function WelcomeContainer() {
    const { user } = useUser() as {
        user: {
            name?: string,
            picture?: string
        }
    };

    const { displayText: typedName, isComplete } = useTypewriter(user?.name || 'User', 100, 500);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 640);
        checkScreen(); // run once
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);
    return (
        <div className="relative mb-6 md:mb-8">
            {/* Animated border - solid layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-400 rounded-2xl md:rounded-3xl p-1">
                <div className="w-full h-full bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 rounded-2xl md:rounded-3xl"></div>
            </div>

            {/* Animated border - blurred layer for glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-400 rounded-2xl md:rounded-3xl blur-md opacity-50"></div>

            {/* Main content */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-cyan-200/50 shadow-xl shadow-cyan-500/10">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-4 md:top-8 right-8 md:right-16 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-sky-400/15 to-cyan-500/15 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute -bottom-1 md:-bottom-2 -left-1 md:-left-2 w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-blue-400/15 to-sky-500/15 rounded-full animate-pulse delay-500"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-700 to-sky-600 bg-clip-text text-transparent mb-2 md:mb-3 leading-tight">
                            Welcome Back,{' '}
                            <span className="relative bg-gradient-to-r from-cyan-600 via-blue-700 to-sky-600 bg-clip-text text-transparent">
                                {typedName}
                                {isComplete && '!'}
                                <span className="animate-pulse text-cyan-500">|</span>
                            </span>
                            {' '}✨
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 md:mb-6 font-medium leading-relaxed">
                            Transform your hiring process with AI-driven interviews and seamless candidate management
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: isMobile ? "short" : "long",
                                        year: "numeric",
                                        month: isMobile ? "short" : "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden md:block">
                        <div className="rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-sky-600 p-1 shadow-xl shadow-cyan-500/30">
                            <div className="w-full h-full rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                {user?.picture ? (
                                    <Image
                                        src={user.picture}
                                        alt="User profile"
                                        width={40}
                                        height={40}
                                    />
                                ) : (
                                    <UserIcon className="w-10 h-9 text-white" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomeContainer