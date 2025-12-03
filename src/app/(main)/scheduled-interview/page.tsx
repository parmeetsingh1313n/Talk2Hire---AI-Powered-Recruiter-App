"use client"
import { useUser } from "@/app/provider";
import { supabase } from "../../../../services/supabaseClient";
import { useEffect, useState } from "react";

interface Interview {
    id: string;
    interview_id: string;
    jobPosition: string;
    jobDescription?: string;
    duration: string;
    type: string;
    questionList?: any[];
    created_at: string;
    userEmail: string;
}

function ScheduledInterview() {
    const { user } = useUser() as {
        user: {
            name?: string,
            email?: string,
            picture?: string
        }
    };

    const [interviewList, setInterviewList] = useState<Interview[]>([]);

    useEffect(() => {
        user && GetInterviewList();
    }, [user]);
    const GetInterviewList = async () => {
        const result = await supabase.from('Interviews')
            .select('jobPosition, duration, interview_id, Interview-Feedback(userEmail)')
            .eq('userEmail', user?.email)
            .order('id', { ascending: false });

        console.log(result);
        
    }
    return (
        <div>

        </div>
    )
}

export default ScheduledInterview
