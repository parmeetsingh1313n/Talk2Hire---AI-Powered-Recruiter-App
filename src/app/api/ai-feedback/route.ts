import { NextRequest, NextResponse } from 'next/server';
import { generateAIFeedback } from '../../../../services/groqService';
import { supabase } from '../../../../services/supabaseClient';

// Email validation function
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

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

        // Validate required fields
        if (!interviewId) {
            console.error('❌ Missing interviewId');
            return NextResponse.json(
                { error: 'Interview ID is required' },
                { status: 400 }
            );
        }

        if (!userEmail || !validateEmail(userEmail)) {
            console.error('❌ Invalid or missing userEmail:', userEmail);
            return NextResponse.json(
                { error: 'Valid user email is required' },
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

        console.log(`💬 Processing ${conversation.length} conversation entries for candidate:`, userEmail);

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

            // Fetch resume data FOR THIS CANDIDATE
            console.log('🔍 Fetching resume data for:', userEmail);
            const { data: resumes, error: resumeError } = await supabase
                .from('ResumeData')
                .select('*')
                .eq('interview_id', interviewId)
                .eq('user_email', userEmail)
                .maybeSingle();

            if (resumeError) {
                console.error('❌ Resume fetch error:', resumeError);
            } else if (resumes) {
                resumeData = resumes;
                console.log('✅ Resume data loaded for:', resumeData?.user_name);
            } else {
                console.log('⚠️ No resume data found for this candidate');
            }
        } catch (fetchError) {
            console.error('❌ Error fetching context data:', fetchError);
        }

        // Generate AI feedback
        console.log('🤖 Generating AI feedback...');
        const feedbackData = await generateAIFeedback(conversation, interviewData, resumeData);

        console.log('✅ AI Feedback generated successfully');
        console.log('📊 Feedback summary:', {
            rating: feedbackData.feedback?.rating,
            recommendation: feedbackData.feedback?.recommendation
        });

        // ✅ CRITICAL FIX: Find and update existing record for this SPECIFIC CANDIDATE
        console.log('🔄 Looking for existing Interview-Feedback record for:', userEmail);

        // First, check if record exists for this candidate and interview
        const { data: existingRecords, error: findError } = await supabase
            .from('Interview-Feedback')
            .select('id, userName, userEmail, feedback, created_at')
            .eq('interview_id', interviewId)
            .eq('userEmail', userEmail);

        if (findError) {
            console.error('❌ Error finding existing record:', findError);
            return NextResponse.json(
                { error: 'Failed to find existing interview record' },
                { status: 500 }
            );
        }

        console.log('🔍 Found existing records:', existingRecords?.length || 0);

        let result;
        let operation = '';

        if (existingRecords && existingRecords.length > 0) {
            // ✅ UPDATE existing record (should be only one) - FOR THIS SPECIFIC CANDIDATE
            const existingRecord = existingRecords[0];
            console.log('✅ Found existing record, updating feedback...', {
                id: existingRecord.id,
                email: existingRecord.userEmail,
                created: existingRecord.created_at
            });

            operation = 'UPDATE';

            const { data, error: updateError } = await supabase
                .from('Interview-Feedback')
                .update({
                    feedback: feedbackData.feedback,
                    recommended: feedbackData.feedback?.recommendation || false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingRecord.id)
                .eq('userEmail', userEmail) // ✅ Ensure we update only this candidate's record
                .select();

            if (updateError) {
                console.error('❌ Error updating Interview-Feedback:', updateError);
                return NextResponse.json(
                    { error: 'Failed to update feedback: ' + updateError.message },
                    { status: 500 }
                );
            }

            result = data;
            console.log('✅ Successfully UPDATED existing record for candidate:', userEmail);
        } else {
            // ❌ This should not happen - candidate record should have been created on landing page
            console.error('❌ No existing record found for candidate! This means the candidate bypassed the landing page.');
            console.log('❌ Creating new record as fallback, but this is unexpected.');

            operation = 'CREATE (fallback)';

            // Check if there's a record with wrong email format first
            const { data: wrongFormatRecords } = await supabase
                .from('Interview-Feedback')
                .select('*')
                .eq('interview_id', interviewId)
                .ilike('userEmail', `%${userEmail.split('@')[1] || ''}%`);

            if (wrongFormatRecords && wrongFormatRecords.length > 0) {
                console.log('⚠️ Found records with possible wrong email format. Updating them instead.');
                const updatePromises = wrongFormatRecords.map(record =>
                    supabase
                        .from('Interview-Feedback')
                        .update({
                            userEmail: userEmail, // ✅ Fix the email
                            userName: userName,
                            feedback: feedbackData.feedback,
                            recommended: feedbackData.feedback?.recommendation || false,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', record.id)
                );

                await Promise.all(updatePromises);
                console.log('✅ Fixed email format and updated records');
            } else {
                // Create new record as last resort
                const { data, error: insertError } = await supabase
                    .from('Interview-Feedback')
                    .insert([
                        {
                            interview_id: interviewId,
                            userName: userName || 'Unknown Candidate',
                            userEmail: userEmail,
                            feedback: feedbackData.feedback,
                            recommended: feedbackData.feedback?.recommendation || false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ])
                    .select();

                if (insertError) {
                    console.error('❌ Error inserting new record:', insertError);
                    return NextResponse.json(
                        { error: 'Failed to store feedback: ' + insertError.message },
                        { status: 500 }
                    );
                }

                result = data;
                console.log('⚠️ Created NEW record as fallback - THIS IS UNEXPECTED');
            }
        }

        // Verify the update/insert worked
        const { data: verifyData } = await supabase
            .from('Interview-Feedback')
            .select('id, userEmail, userName, feedback, created_at, updated_at')
            .eq('interview_id', interviewId)
            .eq('userEmail', userEmail);

        console.log('🔍 Verification after operation:', {
            operation,
            verifiedRecords: verifyData?.length || 0,
            hasFeedback: verifyData?.[0]?.feedback ? 'YES' : 'NO',
            feedbackKeys: verifyData?.[0]?.feedback ? Object.keys(verifyData[0].feedback) : [],
            candidateEmail: verifyData?.[0]?.userEmail,
            candidateName: verifyData?.[0]?.userName
        });

        if (!verifyData || verifyData.length === 0) {
            console.error('❌ CRITICAL ERROR: No record found after operation!');
            return NextResponse.json(
                { error: 'Failed to store feedback: Record not found after operation' },
                { status: 500 }
            );
        }

        console.log('💾 Feedback stored successfully in database for candidate:', userEmail);

        return NextResponse.json({
            success: true,
            feedback: feedbackData.feedback,
            conversationLength: conversation.length,
            storedData: result,
            operation: operation,
            verified: verifyData ? true : false,
            candidate: {
                name: verifyData[0]?.userName,
                email: verifyData[0]?.userEmail
            }
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
        status: 'OK',
        version: '1.0-fixed'
    });
}