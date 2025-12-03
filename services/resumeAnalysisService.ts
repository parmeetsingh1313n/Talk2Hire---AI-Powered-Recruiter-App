import OpenAI from 'openai';

// Initialize Groq client
const groq = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true
});

const AVAILABLE_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
];

const CURRENT_MODEL = AVAILABLE_MODELS[0];

export interface ResumeAnalysis {
    education: Array<{
        degree: string;
        institution: string;
        year: string;
        gpa?: string;
    }>;
    projects: Array<{
        name: string;
        main_points: string[];
        technologies: string[];
    }>;
    experience: {
        years: number;
        level: string;
    };
    skills: {
        [category: string]: string[];
    };
    certifications: Array<{
        name: string;
        year: string;
    }>;
    achievements: string[];
    personal_info: {
        name: string;
        email: string;
        phone: string;
    };
    analysis_summary: {
        total_projects: number;
        education_entries: number;
        skill_categories: number;
        certifications_count: number;
        achievements_count: number;
        candidate_type: string;
        overall_strengths: string[];
    };
}

export class ResumeAnalyzer {
    async extractTextFromPDF(buffer: Buffer): Promise<string> {
        try {
            // Use pdf-parse for text extraction
            // pdf-parse does not include TypeScript declarations in this project,
            // so suppress the module-not-found check and treat the import as any.
            // @ts-ignore
            const pdf = (await import('pdf-parse')) as any;
            const data = pdf.default ? await pdf.default(buffer) : await pdf(buffer);
            return data.text || '';
        } catch (error) {
            console.error('PDF text extraction failed:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    async analyzeResumeWithGroq(resumeText: string): Promise<ResumeAnalysis> {
        if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
            throw new Error('Groq API key not configured');
        }

        const systemPrompt = `You are an expert resume analyzer. Extract and structure information from the resume text into the following JSON format:

        {
            "education": [
                {
                    "degree": "string",
                    "institution": "string", 
                    "year": "string",
                    "gpa": "string (optional)"
                }
            ],
            "projects": [
                {
                    "name": "string",
                    "main_points": ["string array of key features"],
                    "technologies": ["string array of technologies used"]
                }
            ],
            "experience": {
                "years": "number (calculate total years)",
                "level": "string (Fresher, Junior, Mid-Level, Senior)"
            },
            "skills": {
                "Programming Languages": ["string array"],
                "Web Technologies": ["string array"],
                "Databases": ["string array"],
                "Frameworks & Libraries": ["string array"],
                "Tools & Platforms": ["string array"],
                "Soft Skills": ["string array"]
            },
            "certifications": [
                {
                    "name": "string",
                    "year": "string"
                }
            ],
            "achievements": ["string array"],
            "personal_info": {
                "name": "string",
                "email": "string",
                "phone": "string"
            },
            "analysis_summary": {
                "total_projects": "number",
                "education_entries": "number", 
                "skill_categories": "number",
                "certifications_count": "number",
                "achievements_count": "number",
                "candidate_type": "string",
                "overall_strengths": ["string array of key strengths"]
            }
        }

        Instructions:
        1. Extract all education details including degree, institution, year, and GPA if available
        2. Extract projects with their main features/points and technologies used
        3. Calculate total years of experience from work history and assign appropriate level
        4. Categorize skills into appropriate groups
        5. Extract certifications with names and years
        6. Extract achievements and awards
        7. Extract personal information (name, email, phone)
        8. Provide analysis summary with counts and candidate type
        9. Be accurate and thorough in extraction

        Return ONLY valid JSON, no other text.`;

        try {
            let completion = null;
            let lastError = null;

            // Try available models
            for (const model of AVAILABLE_MODELS) {
                try {
                    console.log(`🔄 Trying Groq model: ${model}`);
                    completion = await groq.chat.completions.create({
                        model: model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `Resume Text:\n${resumeText.substring(0, 15000)}` }
                        ],
                        temperature: 0.1,
                        max_tokens: 4000,
                        response_format: { type: "json_object" }
                    });
                    console.log(`✅ Success with model: ${model}`);
                    break;
                } catch (modelError) {
                    console.log(`❌ Model ${model} failed:`, (modelError as Error).message);
                    lastError = modelError;
                    continue;
                }
            }

            if (!completion) {
                throw new Error(`All Groq models failed. Last error: ${(lastError as Error)?.message}`);
            }

            const rawContent = completion.choices[0].message.content;
            if (!rawContent) {
                throw new Error('No content received from Groq');
            }

            console.log('Raw Groq response received');

            // Parse JSON response
            const analysisResult: ResumeAnalysis = JSON.parse(rawContent);

            // Validate the structure
            return this.validateAndCleanAnalysis(analysisResult);

        } catch (error) {
            console.error('Groq analysis error:', error);
            throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private validateAndCleanAnalysis(analysis: any): ResumeAnalysis {
        // Ensure all required fields exist
        const validated: ResumeAnalysis = {
            education: Array.isArray(analysis.education) ? analysis.education : [],
            projects: Array.isArray(analysis.projects) ? analysis.projects : [],
            experience: analysis.experience || { years: 0, level: 'Fresher' },
            skills: analysis.skills || {},
            certifications: Array.isArray(analysis.certifications) ? analysis.certifications : [],
            achievements: Array.isArray(analysis.achievements) ? analysis.achievements : [],
            personal_info: analysis.personal_info || { name: '', email: '', phone: '' },
            analysis_summary: analysis.analysis_summary || {
                total_projects: 0,
                education_entries: 0,
                skill_categories: 0,
                certifications_count: 0,
                achievements_count: 0,
                candidate_type: 'Fresher',
                overall_strengths: []
            }
        };

        // Calculate experience level if not properly set
        if (!validated.experience.level) {
            validated.experience.level = this.getExperienceLevel(validated.experience.years);
        }

        // Ensure analysis summary counts are accurate
        validated.analysis_summary = {
            total_projects: validated.projects.length,
            education_entries: validated.education.length,
            skill_categories: Object.keys(validated.skills).length,
            certifications_count: validated.certifications.length,
            achievements_count: validated.achievements.length,
            candidate_type: validated.experience.level,
            overall_strengths: validated.analysis_summary.overall_strengths || []
        };

        return validated;
    }

    private getExperienceLevel(years: number): string {
        if (years === 0) return 'Fresher';
        if (years <= 2) return 'Junior Professional (0-2 years)';
        if (years <= 5) return 'Mid-Level Professional (2-5 years)';
        return 'Senior Professional (5+ years)';
    }

    async analyzeResume(fileBuffer: Buffer): Promise<ResumeAnalysis> {
        try {
            console.log('Starting resume analysis...');

            // Step 1: Extract text from PDF
            const extractedText = await this.extractTextFromPDF(fileBuffer);

            if (!extractedText || extractedText.length < 100) {
                throw new Error('Insufficient text extracted from resume');
            }

            console.log(`Extracted ${extractedText.length} characters from resume`);

            // Step 2: Analyze with Groq AI
            const analysis = await this.analyzeResumeWithGroq(extractedText);

            console.log('Resume analysis completed successfully');
            return analysis;

        } catch (error) {
            console.error('Resume analysis failed:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const resumeAnalyzer = new ResumeAnalyzer();