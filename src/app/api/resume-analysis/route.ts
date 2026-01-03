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

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
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

        console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`);

        // Create FormData for backend request
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        // Use direct analysis endpoint with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const analysisResponse = await fetch(`${BACKEND_URL}/backend/analyze_resume_direct`, {
                method: 'POST',
                body: backendFormData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!analysisResponse.ok) {
                let errorText = 'Unknown error';
                try {
                    const errorData = await analysisResponse.json();
                    errorText = errorData.error || JSON.stringify(errorData);
                } catch {
                    errorText = await analysisResponse.text();
                }

                console.error(`❌ Backend error ${analysisResponse.status}:`, errorText);

                // Special handling for resume validation errors
                if (analysisResponse.status === 400 && errorText.includes('resume')) {
                    const errorData = await analysisResponse.json().catch(() => ({}));
                    return NextResponse.json(
                        {
                            error: errorData.error || 'This document does not appear to be a resume.',
                            validation_score: errorData.validation_score,
                            is_resume: false,
                            success: false
                        },
                        { status: 400 }
                    );
                }

                return NextResponse.json(
                    {
                        error: `Analysis service returned error: ${analysisResponse.status}`,
                        details: errorText.substring(0, 200),
                        success: false
                    },
                    { status: analysisResponse.status }
                );
            }

            const analysisResult = await analysisResponse.json();
            console.log('✅ Backend analysis successful');

            if (!analysisResult.success) {
                // Special handling for resume validation errors
                if (analysisResult.error && (analysisResult.error.includes('resume') || !analysisResult.is_resume)) {
                    return NextResponse.json(
                        {
                            error: analysisResult.error || 'This document does not appear to be a resume.',
                            validation_score: analysisResult.validation_score,
                            is_resume: false,
                            success: false
                        },
                        { status: 400 }
                    );
                }

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

            // Save to Supabase if we have interview_id
            if (interview_id && userName && userEmail) {
                try {
                    await saveToSupabase(interview_id, userName, userEmail, frontendData, analysisResult.data);
                    console.log('✅ Saved to Supabase');
                } catch (supabaseError) {
                    console.error('⚠️ Supabase save error:', supabaseError);
                    // Continue even if Supabase save fails
                }
            }

            return NextResponse.json({
                success: true,
                data: frontendData,
                rawData: analysisResult.data,
                timestamp: analysisResult.timestamp || new Date().toISOString(),
                filename: file.name,
                fileSize: file.size,
                extractedTextLength: analysisResult.extractedTextLength,
                validation: analysisResult.validation || { is_resume: true, score: 100 }
            });

        } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.error('Request timeout to backend');
                return NextResponse.json(
                    {
                        error: 'Analysis service timeout. Please try again.',
                        success: false
                    },
                    { status: 504 }
                );
            }

            console.error('Fetch error:', fetchError);
            throw fetchError;
        }

    } catch (error: any) {
        console.error('Resume analysis API error:', error);

        if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed') || error.message?.includes('Failed to fetch')) {
            return NextResponse.json(
                {
                    error: `Cannot connect to analysis service at ${BACKEND_URL}. Please ensure the backend is running.`,
                    backendUrl: BACKEND_URL,
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

function transformForFrontend(analysis: any, userName?: string, userEmail?: string) {
    // Ensure we have a proper structure
    const safeAnalysis = analysis || {};

    // Transform projects: handle both old (main_points) and new (description) formats
    const projects = (safeAnalysis.projects || []).map((proj: any) => {
        // If project has description but no main_points, convert description to main_points array
        let main_points = proj.main_points || [];
        if (!main_points.length && proj.description) {
            // Split description into points (by sentences or newlines)
            main_points = proj.description
                .split(/[.!?]\s+/)
                .map((point: string) => point.trim())
                .filter((point: string) => point.length > 0);
        }

        return {
            name: proj.name || 'Unnamed Project',
            main_points: main_points,
            technologies: proj.technologies || [],
            description: proj.description || ''
        };
    });

    return {
        education: safeAnalysis.education || [],
        projects: projects,
        experience: safeAnalysis.experience || { years: 0, level: 'Fresher' },
        skills: safeAnalysis.skills || {},
        certifications: safeAnalysis.certifications || [],
        achievements: safeAnalysis.achievements || [],
        personal_info: safeAnalysis.personal_info || {
            name: userName || '',
            email: userEmail || '',
            phone: ''
        },
        analysis_summary: safeAnalysis.analysis_summary || safeAnalysis.summary || {
            total_projects: 0,
            education_entries: 0,
            skill_categories: 0,
            certifications_count: 0,
            achievements_count: 0,
            candidate_type: 'Fresher',
            overall_strengths: []
        }
    };
}

async function saveToSupabase(interview_id: string, userName: string, userEmail: string, frontendData: any, rawData: any) {
    try {
        const supabaseData = {
            interview_id: interview_id,
            user_name: userName,
            user_email: userEmail,
            professional_summary: `Professional with ${frontendData.experience.years} years experience`,
            experience_years: frontendData.experience.years.toString(),
            technical_skills: Object.values(frontendData.skills).flat(),
            projects: frontendData.projects.map((proj: any) => ({
                name: proj.name || 'Unnamed Project',
                description: proj.description || proj.main_points?.join('. ') || '',
                technologies: proj.technologies || []
            })),
            work_experience: [],
            education: frontendData.education || [],
            certifications: frontendData.certifications || [],
            achievements: frontendData.achievements || [],
            languages: {
                programming: frontendData.skills['Programming Languages'] || [],
                spoken: ['English']
            },
            key_highlights: [
                ...(frontendData.education || []).slice(0, 2).map((edu: any) =>
                    `${edu.degree}${edu.institution ? ` from ${edu.institution}` : ''}`
                ),
                ...(frontendData.projects || []).slice(0, 2).map((proj: any) =>
                    `Project: ${proj.name}`
                ),
                `${frontendData.experience.level} with ${frontendData.experience.years} years experience`
            ],
            raw_analysis_data: rawData,
            analysis_timestamp: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('ResumeData')
            .insert([supabaseData])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to save to Supabase:', error);
        throw error;
    }
}

export async function GET() {
    return NextResponse.json(
        {
            error: 'Method not allowed. Use POST to upload resume.',
            endpoints: {
                POST: '/api/resume-analysis',
                required_fields: ['file']
            },
            backendUrl: BACKEND_URL,
            validation: 'STRICT ENABLED'
        },
        { status: 405 }
    );
}
