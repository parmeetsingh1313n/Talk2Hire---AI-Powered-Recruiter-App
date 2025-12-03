import { Federant } from 'next/font/google';
import Image from 'next/image';
import { Bot, Sparkles, Zap, Users } from 'lucide-react';

const federant = Federant({ subsets: ['latin'], weight: ['400'], });

export function InterviewHeader() {
    return (
        <div className='relative overflow-hidden bg-gradient-to-r from-white via-blue-50/30 to-cyan-50/40 border-b border-blue-100/50 shadow-lg'>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/10 to-cyan-200/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -top-5 -left-10 w-32 h-32 bg-gradient-to-tr from-cyan-200/10 to-blue-200/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                            <Image src="/logo.png" alt="logo" width={60} height={60} className='rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300' />
                            
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-3xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold ${federant.className} group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300`}>
                                Talk2Hire
                            </span>
                            <span className="text-xs text-gray-500 font-medium -mt-1">AI Interview Platform</span>
                        </div>
                    </div>

                    {/* Real-time Features Showcase */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/40">
                            <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">Real-time AI Avatar</span>
                        </div>

                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/40">
                            <Zap className="w-4 h-4 text-cyan-500" />
                            <span className="text-sm font-medium text-gray-700">Instant Feedback</span>
                        </div>

                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/40">
                            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse delay-500" />
                            <span className="text-sm font-medium text-gray-700">Smart Analysis</span>
                        </div>
                    </div>

                    {/* Mobile Features (Simplified) */}
                    <div className="md:hidden flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                            <Bot className="w-3 h-3 text-blue-500 animate-pulse" />
                            <span className="text-xs font-medium text-gray-700">AI Ready</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                            <Users className="w-3 h-3 text-cyan-500" />
                            <span className="text-xs font-medium text-gray-700">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}