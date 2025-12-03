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
import { Plus, PanelRightOpen } from "lucide-react";
import { Federant } from "next/font/google";
import { SidebarOptions } from "../../../../services/Constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

const federant = Federant({
    subsets: ['latin'],
    weight: ['400'],
});

export function AppSidebar() {
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();

    return (
        <Sidebar className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-300 text-white">
            <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-white h-full">
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

                    <Link href={'/dashboard/create-interview'}>
                    <Button className="w-full h-15 flex items-center justify-center gap-3 rounded-2xl font-medium bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-500 hover:via-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer text-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse" />
                        <div className="relative z-10 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="relative z-10">Create Interview</span>
                        </Button>
                    </Link>
                </SidebarHeader>

                <SidebarContent className="py-7 mb-3">
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
                                                {/* Floating icon container */}
                                                <div className={`
                                                    relative z-10 p-2 rounded-xl transition-all duration-300 transform flex-shrink-0
                                                    ${isActive
                                                        ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-110'
                                                        : 'bg-slate-100/70 backdrop-blur-sm text-slate-500 group-hover:bg-gradient-to-br group-hover:from-cyan-100 group-hover:via-sky-100 group-hover:to-blue-100 group-hover:text-cyan-600 group-hover:scale-105'
                                                    }
                                                `}>
                                                    <option.icon className="w-5 h-3" />
                                                </div>

                                                {/* Text with enhanced styling */}
                                                <span className={`
                                                    relative z-10 font-semibold text-base tracking-wide transition-all duration-300 flex-1 min-w-0
                                                    ${isActive
                                                        ? 'text-slate-800'
                                                        : 'text-slate-600 group-hover:text-cyan-700'
                                                    }
                                                `}>
                                                    {option.name}
                                                </span>


                                                {/* Hover glow effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-sky-500/0 to-blue-600/0 group-hover:from-cyan-400/5 group-hover:via-sky-500/5 group-hover:to-blue-600/5 transition-all duration-500 -z-10" />
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="p-4">
                    <div className="relative p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-transparent to-blue-50/50" />

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Premium Plan</p>
                                <p className="text-xs text-slate-500">Unlimited features</p>
                            </div>
                            <div className="ml-auto">
                                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-xs font-medium shadow-sm">
                                    Pro
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarFooter>
            </div>
        </Sidebar>
    )
}