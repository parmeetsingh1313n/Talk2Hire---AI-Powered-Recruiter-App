// src/app/api/ai-feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIFeedback } from '../../../../services/groqService';
import { supabase } from '../../../../services/supabaseClient';

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 AI Feedback API called at:', new Date().toISOString());

        const body = await request.json();
        const { interviewId, userName, userEmail, conversation } = body;

        console.log('📦 Request body:', {
            interviewId,
            userName,
            userEmail,
            conversationLength: conversation?.length
        });

        if (!interviewId) {
            console.error('❌ Missing interviewId');
            return NextResponse.json(
                { error: 'Interview ID is required' },
                { status: 400 }
            );
        }

        if (!conversation || conversation.length === 0) {
            console.error('❌ No conversation provided');
            return NextResponse.json(
                { error: 'No conversation provided for feedback generation' },
                { status: 400 }
            );
        }

        console.log(`💬 Processing ${conversation.length} conversation entries`);

        // Fetch interview context data
        let interviewData = null;
        let resumeData = null;

        try {
            // Fetch interview details
            console.log('🔍 Fetching interview data...');
            const { data: interview, error: interviewError } = await supabase
                .from('Interviews')
                .select('*')
                .eq('interview_id', interviewId)
                .single();

            if (interviewError) {
                console.error('❌ Interview fetch error:', interviewError);
            } else {
                interviewData = interview;
                console.log('✅ Interview data loaded:', interview?.jobPosition);
            }

            // Fetch resume data
            console.log('🔍 Fetching resume data...');
            const { data: resumes, error: resumeError } = await supabase
                .from('ResumeData')
                .select('*')
                .eq('interview_id', interviewId);

            if (resumeError) {
                console.error('❌ Resume fetch error:', resumeError);
            } else if (resumes && resumes.length > 0) {
                resumeData = resumes[0];
                console.log('✅ Resume data loaded:', resumeData?.user_name);
            }
        } catch (fetchError) {
            console.error('❌ Error fetching context data:', fetchError);
            // Continue with just conversation data
        }

        // Generate AI feedback
        console.log('🤖 Generating AI feedback...');
        const feedbackData = await generateAIFeedback(conversation, interviewData, resumeData);

        console.log('✅ AI Feedback generated successfully');
        console.log('📊 Feedback summary:', {
            rating: feedbackData.feedback?.rating,
            recommendation: feedbackData.feedback?.recommendation
        });

        // Store in Supabase
        console.log('💾 Storing feedback in Supabase...');
        const { data, error: insertError } = await supabase
            .from('Interview-Feedback')
            .insert([
                {
                    interview_id: interviewId,
                    userName: userName || 'Unknown',
                    userEmail: userEmail || 'unknown@example.com',
                    feedback: feedbackData.feedback,
                    recommended: feedbackData.feedback?.recommendation || false,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (insertError) {
            console.error('❌ Supabase insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to store feedback: ' + insertError.message },
                { status: 500 }
            );
        }

        console.log('💾 Feedback stored successfully in database');

        return NextResponse.json({
            success: true,
            feedback: feedbackData.feedback,
            conversationLength: conversation.length,
            storedData: data
        });

    } catch (error) {
        console.error('❌ Error in AI feedback API:', error);
        return NextResponse.json(
            {
                error: 'Internal server error: ' + (error as Error).message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'AI Feedback API is working!',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
}