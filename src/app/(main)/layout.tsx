import React from 'react'
import DashboardProvider from './provider'

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <DashboardProvider>
                <div className='p-5'>
                    {children}
                </div>
            </DashboardProvider>
        </div>
    )
}

export default DashboardLayout
