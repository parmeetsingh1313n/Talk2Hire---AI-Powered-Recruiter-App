import React from 'react'

import { ReactNode } from 'react';
import { InterviewHeader } from './_components/InterviewHeader';

function InterviewLayout({ children }: { children: ReactNode }) {
    return (
        <div className='bg-gradient-to-r from-cyan-100 to-blue-100 min-h-screen'>
            <InterviewHeader />
            {children}
        </div>
    )
}

export default InterviewLayout
