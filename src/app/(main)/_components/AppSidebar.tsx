"use client";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { PanelRightOpen, LogOut, Home } from "lucide-react";
import { Federant } from "next/font/google";
import { SidebarOptions } from "../../../../services/Constants";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../../services/supabaseClient";

const federant = Federant({
    subsets: ['latin'],
    weight: ['400'],
});

// Import the RotatingText component
import RotatingText from './RotatingText';

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar } = useSidebar();
    const [hover, setHover] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                }
            } catch (error) {
                console.error('Error checking user:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                // Don't push here, let handleLogout handle it
            } else if (session?.user) {
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Fix TypeScript error by adding explicit return type
    const handleLogout = async (): Promise<void> => {
        try {
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Error signing out:', error);
                return;
            }

            // Clear local state
            setUser(null);

            // Force redirect to home page
            window.location.href = '/';

        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Only show sidebar if user is logged in
    if (!user && !loading) {
        return null;
    }

    return (
        <Sidebar className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-300 text-white">
            <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-white h-full flex flex-col">
                <SidebarHeader className="p-6 relative">
                    <Button
                        onClick={toggleSidebar}
                        className="md:hidden absolute top-1 right-1 h-auto p-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-300 text-slate-600 hover:text-slate-800 border-none shadow-none bg-transparent"
                        size="lg"
                    >
                        <PanelRightOpen className="w-5 h-7 text-blue-500" />
                    </Button>

                    <div className="flex items-center gap-3 cursor-pointer group justify-center mb-6">
                        <img
                            src="/logo.png"
                            alt="Talk2Hire Logo"
                            width={50}
                            height={50}
                            className='rounded-xl shadow-lg'
                        />
                        <span className={`text-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent font-bold ${federant.className}`}>
                            Talk2Hire
                        </span>
                    </div>

                    {/* Rotating Text CTA - Purely decorative, no click behavior */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <div className="relative w-full h-20 flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-sky-600/10 to-blue-600/10 group-hover:from-cyan-500/15 group-hover:via-sky-600/15 group-hover:to-blue-600/15 transition-all duration-500" />

                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/20 rounded-2xl transition-all duration-500" />

                            <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-5">
                                <div className="mb-2 mt-3">
                                    <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                                        Create AI-Powered
                                    </span>
                                </div>

                                <div className="h-10 flex items-center justify-center relative">
                                    <RotatingText
                                        texts={[
                                            'Video Interview',
                                            'Audio Screening',
                                            'Recruitment Process',
                                            'Candidate Evaluation',
                                            'Smart Hiring',
                                            'AI Assessment'
                                        ]}
                                        mainClassName="px-4 py-2 bg-gradient-to-r from-cyan-100/50 via-blue-100/50 to-sky-100/50 backdrop-blur-sm text-cyan-800 font-bold rounded-xl overflow-hidden h-10 flex items-center justify-center min-w-[200px] border border-cyan-200/30 relative"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: "-120%", opacity: 0 }}
                                        staggerDuration={0.03}
                                        splitLevelClassName="overflow-hidden"
                                        transition={{
                                            type: "spring",
                                            damping: 25,
                                            stiffness: 350,
                                            mass: 0.5
                                        }}
                                        rotationInterval={2200}
                                        auto={true}
                                    />
                                </div>

                                <div className="mt-2 transform transition-transform duration-300 group-hover:translate-y-0.5">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-cyan-500 rotate-45 opacity-60" />
                                        <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-blue-500 rotate-45 opacity-60" />
                                        <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-sky-500 rotate-45 opacity-60" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent -skew-x-12 opacity-0 group-hover:opacity-50 group-hover:animate-pulse transition-opacity duration-500" />
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="py-7 mb-3 flex-1">
                    <SidebarGroup>
                        <SidebarMenu className="space-y-4">
                            {SidebarOptions.map((option, index) => {
                                const isActive = pathname === option.path;

                                return (
                                    <SidebarMenuItem key={index} className="group">
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href={option.path}
                                                className={`
                                                    relative flex items-center  p-5 rounded-2xl transition-all duration-500 ease-out whitespace-nowrap
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-cyan-400/20 via-sky-500/20 to-blue-600/20 backdrop-blur-md border border-cyan-300/30 text-cyan-800 shadow-lg shadow-cyan-500/10'
                                                        : 'text-slate-600 hover:bg-white/20 hover:backdrop-blur-lg hover:border hover:border-cyan-200/30 hover:shadow-md'
                                                    }
                                                    before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-cyan-400/0 before:via-sky-500/0 before:to-blue-600/0 
                                                    hover:before:from-cyan-400/8 hover:before:via-sky-500/8 hover:before:to-blue-600/8 before:transition-all before:duration-500
                                                `}
                                            >
                                                <div className={`
                                                    relative z-10 p-2 rounded-xl transition-all duration-300 transform flex-shrink-0
                                                    ${isActive
                                                        ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-110'
                                                        : 'bg-slate-100/70 backdrop-blur-sm text-slate-500 group-hover:bg-gradient-to-br group-hover:from-cyan-100 group-hover:via-sky-100 group-hover:to-blue-100 group-hover:text-cyan-600 group-hover:scale-105'
                                                    }
                                                `}>
                                                    <option.icon className="w-5 h-3" />
                                                </div>
                                                <span className={`
                                                    relative z-10 font-semibold text-base tracking-wide transition-all duration-300 flex-1 min-w-0
                                                    ${isActive
                                                        ? 'text-slate-800'
                                                        : 'text-slate-600 group-hover:text-cyan-700'
                                                    }
                                                `}>
                                                    {option.name}
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-sky-500/0 to-blue-600/0 group-hover:from-cyan-400/5 group-hover:via-sky-500/5 group-hover:to-blue-600/5 transition-all duration-500 -z-10" />
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                {/* Simple Logout Footer */}
                <SidebarFooter className="p-4 border-t border-slate-300/30 backdrop-blur-sm bg-gradient-to-t from-white/50 to-transparent">
                    <div className="space-y-3">
                        {/* Home Button */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start p-4 rounded-2xl text-slate-700 hover:text-cyan-700 hover:bg-white/20 hover:backdrop-blur-lg transition-all duration-300"
                            asChild
                        >
                            <Link href="/dashboard">
                                <Home className="w-5 h-5 mr-3" />
                                Dashboard Home
                            </Link>
                        </Button>

                        {/* Simple Logout Button */}
                        <Button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full justify-start p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 hover:text-red-800 hover:border-red-300 transition-all duration-300 group"
                            variant="ghost"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 text-white group-hover:from-red-500 group-hover:to-rose-600 transition-all duration-300">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">Sign Out</p>
                                    <p className="text-xs text-red-600/70">End your session</p>
                                </div>
                            </div>
                        </Button>
                    </div>
                </SidebarFooter>
            </div>
        </Sidebar>
    );
}
