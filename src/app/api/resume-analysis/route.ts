import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../services/supabaseClient';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const interview_id = formData.get('interview_id') as string;
        const userName = formData.get('userName') as string;
        const userEmail = formData.get('userEmail') as string;

        if (!file || !interview_id || !userName || !userEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large. Maximum size is 10MB.' },
                { status: 413 }
            );
        }

        // Create FormData for backend request
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        // Use direct analysis endpoint
        const analysisResponse = await fetch(`${BACKEND_URL}/backend/analyze_resume_direct`, {
            method: 'POST',
            body: backendFormData,
        });

        if (!analysisResponse.ok) {
            const errorData = await analysisResponse.json().catch(() => ({}));
            return NextResponse.json(
                {
                    error: errorData.error || `Analysis failed with status ${analysisResponse.status}`,
                    success: false
                },
                { status: analysisResponse.status }
            );
        }

        const analysisResult = await analysisResponse.json();

        if (!analysisResult.success) {
            return NextResponse.json(
                {
                    error: analysisResult.error || 'Resume analysis failed',
                    success: false
                },
                { status: 400 }
            );
        }

        // Transform data for frontend
        const frontendData = transformForFrontend(analysisResult.data, userName, userEmail);

        // Save to Supabase
        await saveToSupabase(interview_id, userName, userEmail, frontendData, analysisResult.data);

        return NextResponse.json({
            success: true,
            data: frontendData,
            rawData: analysisResult.data,
            timestamp: analysisResult.timestamp || new Date().toISOString(),
            filename: file.name,
            fileSize: file.size,
            extractedTextLength: analysisResult.extractedTextLength
        });

    } catch (error) {
        console.error('Resume analysis API error:', error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    error: 'Unable to connect to analysis service. Please try again later.',
                    success: false
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error occurred during analysis',
                success: false
            },
            { status: 500 }
        );
    }
}

function transformForFrontend(analysis: any, userName: string, userEmail: string) {
    return {
        education: analysis.education || [],
        projects: analysis.projects || [],
        experience: analysis.experience || { years: 0, level: 'Fresher' },
        skills: analysis.skills || {},
        certifications: analysis.certifications || [],
        achievements: analysis.achievements || [],
        analysis_summary: analysis.analysis_summary || {
            total_projects: 0,
            education_entries: 0,
            skill_categories: 0,
            certifications_count: 0,
            achievements_count: 0,
            candidate_type: 'Fresher'
        }
    };
}

async function saveToSupabase(interview_id: string, userName: string, userEmail: string, frontendData: any, rawData: any) {
    const supabaseData = {
        professional_summary: `Professional with ${frontendData.experience.years} years experience in ${Object.keys(frontendData.skills).join(', ')}`,
        experience_years: frontendData.experience.years.toString(),
        technical_skills: Object.values(frontendData.skills).flat(),
        projects: frontendData.projects.map((proj: any) => ({
            name: proj.name,
            description: proj.main_points?.join('. ') || '',
            technologies: proj.technologies || []
        })),
        work_experience: [],
        education: frontendData.education,
        certifications: frontendData.certifications,
        achievements: frontendData.achievements,
        languages: {
            programming: frontendData.skills['Programming Languages'] || [],
            spoken: ['English']
        },
        key_highlights: [
            ...frontendData.education.slice(0, 2).map((edu: any) =>
                `${edu.degree}${edu.institution ? ` from ${edu.institution}` : ''}`
            ),
            ...frontendData.projects.slice(0, 2).map((proj: any) =>
                `Project: ${proj.name}`
            ),
            `${frontendData.experience.level} with ${frontendData.experience.years} years experience`
        ]
    };

    const { data, error } = await supabase
        .from('ResumeData')
        .insert([
            {
                interview_id: interview_id,
                user_name: userName,
                user_email: userEmail,
                ...supabaseData,
                raw_analysis_data: rawData
            }
        ])
        .select();

    if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to save resume data: ${error.message}`);
    }

    return data;
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed. Use POST to upload resume.' },
        { status: 405 }
    );
}