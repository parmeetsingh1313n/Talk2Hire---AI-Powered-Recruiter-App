import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './_components/AppSidebar'
import WelcomeContainer from './dashboard/_components/WelcomeContainer'

function DashboardProvider({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className='w-full  bg-gradient-to-br from-white via-sky-100 to-cyan-100'>
            <SidebarTrigger
                className="mt-1 bg-gradient-to-r from-cyan-100 to-blue-200 
                hover:from-cyan-100 hover:to-blue-300text-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer m-2"
            />

                <div className='p-4 md:p-6 lg:p-8 min-h-screen'>
                    <WelcomeContainer />
                {children}
                </div>
            </div>
        </SidebarProvider>
    )
}

export default DashboardProvider