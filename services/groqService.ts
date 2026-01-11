// services/groqService.ts
import OpenAI from 'openai';
import { supabase } from './supabaseClient';

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

// Interview phases
const INTERVIEW_PHASES = {
    INTRODUCTION: 'introduction',
    CUSTOM_QUESTIONS: 'custom_questions',
    RESUME_BASED: 'resume_based',
    TECHNICAL_DEEP_DIVE: 'technical_deep_dive',
    BEHAVIORAL: 'behavioral',
    CLOSING: 'closing'
};

// Types
interface InterviewData {
    jobPosition: string;
    jobDescription: string;
    questionList: any[];
    duration: string;
    type: string;
}

interface ResumeData {
    user_name: string;
    user_email: string;
    professional_summary: string;
    experience_years: string;
    technical_skills: any;
    projects: any[];
    work_experience: any[];
    education: any[];
    certifications: any[];
    achievements: any[];
    key_highlights: any[];
    raw_analysis_data?: any;
}

interface ConversationEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ConversationAnalysis {
    expected_answer: string;
    improvement_feedback: string;
    technical_skill_rating: number;
    communication_rating: number;
    problem_solving_rating: number;
    experience_relevance_rating: number;
    overall_rating: number;
    keywords_matched: string[];
    analysis_insights: string;
}

export interface ConversationRecord {
    id?: string;
    interview_id: string;
    interview_feedback_id: number; // ✅ REQUIRED: MUST be included
    question_sequence: number;
    question_type: string;
    ai_question: string;
    candidate_answer: string;
    ai_response: string;
    expected_answer?: string;
    improvement_feedback?: string;
    technical_skill_rating?: number;
    communication_rating?: number;
    problem_solving_rating?: number;
    experience_relevance_rating?: number;
    overall_rating?: number;
    keywords_matched?: string[];
    analysis_insights?: string;
}

interface SessionData {
    interviewData?: InterviewData;
    resumeData?: ResumeData;
    askedQuestions: Set<string>;
    currentPhase: string;
    questionIndex: number;
    dataLoaded: boolean;
    timeExceeded: boolean;
}

// In-memory stores
const conversationHistory = new Map<string, ConversationEntry[]>();
const sessionDataStore = new Map<string, SessionData>();
const usedQuestions = new Map<string, Set<string>>();

// Get in-memory conversation history for current session
export function getConversationHistory(sessionId: string): ConversationEntry[] {
    return conversationHistory.get(sessionId) || [];
}

// Get stored conversation history from Supabase
export async function getStoredConversationHistory(interviewFeedbackId: number): Promise<ConversationRecord[]> {
    try {
        console.log('🔍 Fetching conversation history for feedback_id:', interviewFeedbackId);

        const { data, error } = await supabase
            .from('Interview-Conversation')
            .select('*')
            .eq('interview_feedback_id', interviewFeedbackId)
            .order('question_sequence', { ascending: true });

        if (error) {
            console.error('❌ Error fetching conversation history:', error);
            return [];
        }

        console.log(`✅ Found ${data?.length || 0} conversation records for feedback_id:`, interviewFeedbackId);
        return data || [];
    } catch (error) {
        console.error('❌ Error in getStoredConversationHistory:', error);
        return [];
    }
}

// ✅ NEW: Get conversation history by interview_id as fallback (for backward compatibility)
export async function getConversationHistoryByInterviewId(interviewId: string): Promise<ConversationRecord[]> {
    try {
        console.log('🔍 Fetching conversation history for interview_id:', interviewId);

        const { data, error } = await supabase
            .from('Interview-Conversation')
            .select('*')
            .eq('interview_id', interviewId)
            .order('question_sequence', { ascending: true });

        if (error) {
            console.error('❌ Error fetching conversation history:', error);
            return [];
        }

        console.log(`✅ Found ${data?.length || 0} conversation records`);
        return data || [];
    } catch (error) {
        console.error('❌ Error in getConversationHistoryByInterviewId:', error);
        return [];
    }
}

export async function analyzeAndStoreConversation(
    conversationRecord: ConversationRecord // ✅ Changed: Now accepts full ConversationRecord
): Promise<void> {
    try {
        console.log('🤖 Storing conversation analysis:', {
            interview_id: conversationRecord.interview_id,
            interview_feedback_id: conversationRecord.interview_feedback_id,
            question_sequence: conversationRecord.question_sequence
        });

        // ✅ CRITICAL: Ensure interview_feedback_id is provided
        if (!conversationRecord.interview_feedback_id) {
            console.error('❌ interview_feedback_id is required but not provided');
            throw new Error('interview_feedback_id is required');
        }

        // Generate analysis using AI
        const analysisPrompt = `
Analyze this interview Q&A exchange and provide detailed feedback:

QUESTION (${conversationRecord.question_type}):
"${conversationRecord.ai_question}"

CANDIDATE'S ANSWER:
"${conversationRecord.candidate_answer}"

Please provide a comprehensive analysis in this EXACT JSON format:
{
  "expected_answer": "What an ideal candidate response would look like (150-200 words)",
  "improvement_feedback": "Specific, actionable feedback on how the candidate can improve their answer (100-150 words)",
  "technical_skill_rating": 0,
  "communication_rating": 0,
  "problem_solving_rating": 0,
  "experience_relevance_rating": 0,
  "overall_rating": 0,
  "keywords_matched": ["keyword1", "keyword2"],
  "analysis_insights": "Key insights about the candidate's response (80-120 words)"
}

Rating Guidelines (1-10 scale):
- Technical Skill: Understanding of technical concepts, tools, methodologies
- Communication: Clarity, structure, articulation of thoughts
- Problem Solving: Analytical thinking, solution approach, logical reasoning
- Experience Relevance: How well experience matches role requirements
- Overall: Composite score based on all factors

Be constructive, professional, and specific in your feedback.`;

        const AVAILABLE_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];

        const completion = await groq.chat.completions.create({
            model: AVAILABLE_MODELS[0],
            messages: [
                {
                    role: "system",
                    content: "You are an expert technical interviewer and career coach. Provide detailed, constructive feedback on interview responses."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const response = completion.choices[0]?.message?.content?.trim();

        if (!response) {
            throw new Error("Empty response from analysis AI");
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in analysis response");
        }

        const analysisData = JSON.parse(jsonMatch[0]);

        // ✅ Store in Supabase with ALL required fields
        const { data, error } = await supabase
            .from('Interview-Conversation')
            .insert([
                {
                    interview_id: conversationRecord.interview_id,
                    interview_feedback_id: conversationRecord.interview_feedback_id, // ✅ This is critical
                    question_sequence: conversationRecord.question_sequence,
                    question_type: conversationRecord.question_type,
                    ai_question: conversationRecord.ai_question,
                    candidate_answer: conversationRecord.candidate_answer,
                    ai_response: conversationRecord.ai_response,
                    expected_answer: analysisData.expected_answer,
                    improvement_feedback: analysisData.improvement_feedback,
                    technical_skill_rating: analysisData.technical_skill_rating,
                    communication_rating: analysisData.communication_rating,
                    problem_solving_rating: analysisData.problem_solving_rating,
                    experience_relevance_rating: analysisData.experience_relevance_rating,
                    overall_rating: analysisData.overall_rating,
                    keywords_matched: analysisData.keywords_matched,
                    analysis_insights: analysisData.analysis_insights,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('❌ Error storing conversation analysis:', error);
            throw error;
        }

        console.log('✅ Conversation analysis stored successfully:', {
            id: data?.[0]?.id,
            interview_feedback_id: data?.[0]?.interview_feedback_id
        });

    } catch (error) {
        console.error('❌ Error in conversation analysis:', error);

        // Even if analysis fails, store the basic conversation data
        try {
            await supabase
                .from('Interview-Conversation')
                .insert([
                    {
                        interview_id: conversationRecord.interview_id,
                        interview_feedback_id: conversationRecord.interview_feedback_id,
                        question_sequence: conversationRecord.question_sequence,
                        question_type: conversationRecord.question_type,
                        ai_question: conversationRecord.ai_question,
                        candidate_answer: conversationRecord.candidate_answer,
                        ai_response: conversationRecord.ai_response,
                        created_at: new Date().toISOString()
                    }
                ]);
            console.log('✅ Stored basic conversation data (analysis failed)');
        } catch (fallbackError) {
            console.error('❌ Failed to store basic conversation data:', fallbackError);
        }
    }
}
async function fetchResumeByUserDetails(
    interviewId: string,
    userName: string,
    userEmail: string
): Promise<ResumeData | null> {
    try {
        console.log('🔍 Fetching resume data for:', { interviewId, userName, userEmail });

        const { data: resumes, error } = await supabase
            .from('ResumeData')
            .select('*')
            .eq('interview_id', interviewId)
            .eq('user_name', userName)
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching resume by user details:', error);
            return null;
        }

        if (resumes && resumes.length > 0) {
            console.log('✅ Resume data found for candidate:', resumes[0].user_name);
            return resumes[0];
        }

        console.warn('⚠️ No resume data found for:', { userName, userEmail });
        return null;
    } catch (error) {
        console.error('❌ Error in fetchResumeByUserDetails:', error);
        return null;
    }
}

async function fetchInterviewData(
    interviewId: string,
    candidateName?: string,
    candidateEmail?: string
): Promise<{ interview: InterviewData | null, resume: ResumeData | null }> {
    try {
        console.log('🔍 Fetching data for interview_id:', interviewId);
        console.log('👤 Candidate:', { candidateName, candidateEmail });

        // Fetch interview details
        const { data: interviewData, error: interviewError } = await supabase
            .from('Interviews')
            .select('jobPosition, jobDescription, questionList, duration, type')
            .eq('interview_id', interviewId)
            .single();

        if (interviewError) {
            console.error('❌ Error fetching interview:', interviewError);
        } else {
            console.log('✅ Interview data loaded:', {
                position: interviewData?.jobPosition,
                questionsCount: interviewData?.questionList?.length || 0
            });
        }

        // Fetch resume data with priority:
        // 1. By interview_id + name + email (exact match)
        // 2. By interview_id + email (email match)
        // 3. By interview_id only (fallback)
        let resumeData = null;

        if (candidateName && candidateEmail) {
            // Try exact match first
            let query = supabase
                .from('ResumeData')
                .select('*')
                .eq('interview_id', interviewId)
                .eq('user_email', candidateEmail)
                .eq('user_name', candidateName)
                .order('created_at', { ascending: false });

            const { data: exactMatch, error: exactError } = await query;

            if (!exactError && exactMatch && exactMatch.length > 0) {
                resumeData = exactMatch[0];
                console.log('✅ Resume found (exact match):', resumeData.user_name);
            } else {
                // Try email match only
                const { data: emailMatch, error: emailError } = await supabase
                    .from('ResumeData')
                    .select('*')
                    .eq('interview_id', interviewId)
                    .eq('user_email', candidateEmail)
                    .order('created_at', { ascending: false });

                if (!emailError && emailMatch && emailMatch.length > 0) {
                    resumeData = emailMatch[0];
                    console.log('✅ Resume found (email match):', resumeData.user_name);
                } else {
                    // Fallback: any resume for this interview
                    const { data: anyResume, error: anyError } = await supabase
                        .from('ResumeData')
                        .select('*')
                        .eq('interview_id', interviewId)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (!anyError && anyResume && anyResume.length > 0) {
                        resumeData = anyResume[0];
                        console.log('⚠️ Using fallback resume:', resumeData.user_name);
                    }
                }
            }
        } else {
            // No candidate details provided, get any resume
            const { data: resumes, error: resumeError } = await supabase
                .from('ResumeData')
                .select('*')
                .eq('interview_id', interviewId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!resumeError && resumes && resumes.length > 0) {
                resumeData = resumes[0];
                console.log('✅ Resume loaded (no candidate filter):', resumeData.user_name);
            }
        }

        if (resumeData) {
            console.log('📄 Resume data loaded successfully:', {
                name: resumeData.user_name,
                email: resumeData.user_email,
                experience: resumeData.experience_years,
                projects: resumeData.projects?.length || 0
            });
        } else {
            console.warn('⚠️ No resume data found for interview_id:', interviewId);
        }

        return {
            interview: interviewData,
            resume: resumeData
        };
    } catch (error) {
        console.error('❌ Error in fetchInterviewData:', error);
        return { interview: null, resume: null };
    }
}


// Validate that resume data belongs to the candidate
function validateResumeForCandidate(
    resume: ResumeData,
    candidateName: string,
    candidateEmail: string
): boolean {
    if (!resume) return false;

    const nameMatch = resume.user_name?.toLowerCase() === candidateName?.toLowerCase();
    const emailMatch = resume.user_email?.toLowerCase() === candidateEmail?.toLowerCase();

    if (nameMatch && emailMatch) {
        console.log('✅ Resume validated for candidate:', candidateName);
        return true;
    }

    console.warn('⚠️ Resume mismatch:', {
        resumeName: resume.user_name,
        candidateName,
        resumeEmail: resume.user_email,
        candidateEmail
    });

    return false;
}
// Generate human-like dynamic greeting
async function generateDynamicGreeting(jobPosition: string, candidateName?: string, resumeData?: ResumeData): Promise<string> {
    const actualName = resumeData?.user_name || candidateName || '';
    try {
        const nameContext = actualName ? ` for ${actualName}` : '';
        let experienceContext = '';

        if (resumeData) {
            if (resumeData.experience_years) {
                experienceContext = ` I see you have ${resumeData.experience_years} years of experience`;
            }
            if (resumeData.technical_skills && Array.isArray(resumeData.technical_skills)) {
                const topSkills = resumeData.technical_skills.slice(0, 2).join(', ');
                experienceContext += experienceContext ? ` with ${topSkills}` : ` I notice your experience with ${topSkills}`;
            }
        }

        const completion = await groq.chat.completions.create({
            model: AVAILABLE_MODELS[0],
            messages: [
                {
                    role: "system",
                    content: `You are a warm, professional interviewer. Generate a unique, engaging greeting (2 sentences max) for a ${jobPosition} interview${nameContext}.${experienceContext} Be conversational and human-like. Return ONLY the greeting text.`
                },
                {
                    role: "user",
                    content: "Generate a unique professional greeting."
                }
            ],
            temperature: 0.9,
            max_tokens: 80,
        });

        return completion.choices[0].message.content?.trim() ||
            `Hello! I'm really looking forward to our conversation about the ${jobPosition} role today.`;
    } catch (error) {
        console.error('Error generating dynamic greeting:', error);
        return `Hello${actualName ? ` ${actualName}` : ''}! I'm excited to discuss the ${jobPosition} position with you today.`;
    }
}

// Build comprehensive resume context
function buildResumeContext(resume: ResumeData): string {
    if (!resume) return '\n⚠️ NO RESUME DATA AVAILABLE\n';

    let context = `\n=== CANDIDATE'S COMPLETE RESUME (REFERENCE THIS EXTENSIVELY) ===\n`;

    // Personal & Professional Info
    context += `CANDIDATE PROFILE:\n`;
    context += `- Name: ${resume.user_name || 'Not provided'}\n`;
    context += `- Email: ${resume.user_email || 'Not provided'}\n`;
    context += `- Total Experience: ${resume.experience_years || '0'} years\n`;
    context += `- Professional Summary: ${resume.professional_summary || 'Not provided'}\n\n`;

    // Technical Skills
    if (resume.technical_skills) {
        context += `TECHNICAL SKILLS (Use these for technical questions):\n`;
        let skills: string[] = [];

        if (Array.isArray(resume.technical_skills)) {
            skills = resume.technical_skills;
        } else if (typeof resume.technical_skills === 'object') {
            Object.entries(resume.technical_skills).forEach(([category, categorySkills]) => {
                if (Array.isArray(categorySkills)) {
                    skills.push(...categorySkills);
                }
            });
        } else if (typeof resume.technical_skills === 'string') {
            skills = [resume.technical_skills];
        }

        context += `${skills.slice(0, 15).join(', ')}\n\n`;
    }

    // Projects - Detailed with technologies
    if (resume.projects && resume.projects.length > 0) {
        context += `PROJECTS (Ask SPECIFIC questions about these):\n`;
        resume.projects.forEach((project: any, idx: number) => {
            const projectName = project.name || project.project_name || `Project ${idx + 1}`;
            const technologies = project.technologies || project.tech_stack || project.skills || [];
            const description = project.description || project.main_points?.[0] || 'No description';

            context += `\nPROJECT ${idx + 1}: ${projectName}\n`;
            context += `Technologies: ${Array.isArray(technologies) ? technologies.join(', ') : technologies}\n`;
            context += `Description: ${description}\n`;

            if (project.main_points && Array.isArray(project.main_points)) {
                context += `Key Points: ${project.main_points.slice(0, 3).join('; ')}\n`;
            }
        });
        context += `\n`;
    }

    // Work Experience
    if (resume.work_experience && resume.work_experience.length > 0) {
        context += `WORK EXPERIENCE:\n`;
        resume.work_experience.forEach((exp: any, idx: number) => {
            const company = exp.company || exp.organization || exp.employer || 'Unknown Company';
            const role = exp.role || exp.title || exp.position || 'Unknown Role';
            const duration = exp.duration || exp.period || exp.years || '';

            context += `- ${role} at ${company} ${duration}\n`;
        });
        context += `\n`;
    }

    // Education
    if (resume.education && resume.education.length > 0) {
        context += `EDUCATION:\n`;
        resume.education.forEach((edu: any) => {
            const degree = edu.degree || edu.qualification || 'Degree';
            const institution = edu.institution || edu.school || edu.college || 'Institution';
            const year = edu.year || edu.graduation_year || '';

            context += `- ${degree} from ${institution} ${year}\n`;
        });
        context += `\n`;
    }

    // Certifications & Achievements
    if (resume.certifications && resume.certifications.length > 0) {
        context += `CERTIFICATIONS:\n`;
        resume.certifications.forEach((cert: any) => {
            const certName = typeof cert === 'string' ? cert : (cert.name || cert.title);
            context += `- ${certName}\n`;
        });
        context += `\n`;
    }

    if (resume.achievements && resume.achievements.length > 0) {
        context += `ACHIEVEMENTS:\n`;
        resume.achievements.forEach((ach: any) => {
            const achievement = typeof ach === 'string' ? ach : (ach.description || ach.title);
            context += `- ${achievement}\n`;
        });
        context += `\n`;
    }

    context += `=== END RESUME DATA ===\n`;
    return context;
}

// Get next question with priority
function getNextQuestion(sessionData: SessionData): string | null {
    const { interviewData, resumeData, askedQuestions, currentPhase } = sessionData;

    // Phase 1: Custom questions from admin's questionList
    if (currentPhase === INTERVIEW_PHASES.CUSTOM_QUESTIONS && interviewData?.questionList) {
        const availableCustomQuestions = interviewData.questionList
            .filter((q: any) => {
                const questionText = typeof q === 'string' ? q : (q.question || q.text || JSON.stringify(q));
                return questionText && !askedQuestions.has(questionText);
            })
            .map((q: any) => typeof q === 'string' ? q : (q.question || q.text || JSON.stringify(q)));

        if (availableCustomQuestions.length > 0) {
            const question = availableCustomQuestions[0];
            askedQuestions.add(question);
            console.log('🎯 Using custom question from list:', question.substring(0, 100));
            return question;
        }
    }

    // Phase 2: Resume-based questions
    if ((currentPhase === INTERVIEW_PHASES.RESUME_BASED || currentPhase === INTERVIEW_PHASES.TECHNICAL_DEEP_DIVE) && resumeData) {
        const resumeQuestions = generateResumeBasedQuestions(resumeData);
        const availableResumeQuestions = resumeQuestions.filter(q => !askedQuestions.has(q));

        if (availableResumeQuestions.length > 0) {
            const question = availableResumeQuestions[0];
            askedQuestions.add(question);
            console.log('📄 Using resume-based question:', question.substring(0, 100));
            return question;
        }
    }

    return null;
}

// Generate intelligent questions based on resume content
function generateResumeBasedQuestions(resume: ResumeData): string[] {
    const questions: string[] = [];

    // Project-specific questions
    if (resume.projects && resume.projects.length > 0) {
        resume.projects.forEach((project: any) => {
            const projectName = project.name || project.project_name || project.title || 'this project';
            const technologies = project.technologies || project.tech_stack || [];

            questions.push(`I see you worked on "${projectName}" in your resume. Can you walk me through your specific role and the main technical challenges you faced?`);
            questions.push(`For the ${projectName} project, what was the technical architecture and why did you choose ${technologies.slice(0, 2).join(' and ')}?`);
            questions.push(`What was the most complex problem you solved in the ${projectName} project and how did you approach it?`);
            questions.push(`How did you measure the success and impact of the ${projectName} project?`);
        });
    }

    // Skills-based questions
    if (resume.technical_skills) {
        let allSkills: string[] = [];

        if (Array.isArray(resume.technical_skills)) {
            allSkills = resume.technical_skills;
        } else if (typeof resume.technical_skills === 'object') {
            Object.values(resume.technical_skills).forEach(skillArray => {
                if (Array.isArray(skillArray)) {
                    allSkills.push(...skillArray);
                }
            });
        }

        if (allSkills.length > 0) {
            const topSkills = allSkills.slice(0, 4);
            questions.push(`Your resume shows strong experience with ${topSkills.join(', ')}. Can you describe a complex problem you solved using these technologies?`);
            questions.push(`Which of these technologies - ${topSkills.join(', ')} - are you most proficient in and why?`);
        }
    }

    // Experience-based questions
    if (resume.work_experience && resume.work_experience.length > 0) {
        resume.work_experience.slice(0, 2).forEach((exp: any) => {
            const company = exp.company || exp.organization || 'your previous company';
            const role = exp.role || exp.title || 'your role';
            questions.push(`At ${company} as ${role}, what was your most significant technical contribution and what impact did it have?`);
            questions.push(`Can you tell me about a time at ${company} when you had to make a difficult technical decision?`);
        });
    }

    // Behavioral questions based on experience level
    const experienceYears = parseInt(resume.experience_years) || 0;
    if (experienceYears > 3) {
        questions.push(`With ${experienceYears} years of experience, how do you approach mentoring junior developers or leading technical decisions?`);
        questions.push(`Can you describe a situation where you had to influence technical direction without formal authority?`);
    }

    return questions;
}

// Update interview phase considering time
function updateInterviewPhase(sessionData: SessionData, historyLength: number, elapsedTime?: number, totalDuration?: number): void {
    const { currentPhase } = sessionData;

    // If time exceeded, force closing phase
    if (sessionData.timeExceeded) {
        sessionData.currentPhase = INTERVIEW_PHASES.CLOSING;
        return;
    }

    // If nearing end of time, transition to closing
    if (elapsedTime && totalDuration && elapsedTime > totalDuration * 0.8) {
        sessionData.currentPhase = INTERVIEW_PHASES.CLOSING;
        console.log('📍 Time-based phase change to: CLOSING (80% time used)');
        return;
    }

    // Original message-based progression (only if time is OK)
    if (currentPhase === INTERVIEW_PHASES.INTRODUCTION && historyLength >= 3) {
        sessionData.currentPhase = INTERVIEW_PHASES.CUSTOM_QUESTIONS;
        console.log('📍 Phase changed to: CUSTOM_QUESTIONS');
    } else if (currentPhase === INTERVIEW_PHASES.CUSTOM_QUESTIONS && historyLength >= 8) {
        sessionData.currentPhase = INTERVIEW_PHASES.RESUME_BASED;
        console.log('📍 Phase changed to: RESUME_BASED');
    } else if (currentPhase === INTERVIEW_PHASES.RESUME_BASED && historyLength >= 15) {
        sessionData.currentPhase = INTERVIEW_PHASES.TECHNICAL_DEEP_DIVE;
        console.log('📍 Phase changed to: TECHNICAL_DEEP_DIVE');
    } else if (currentPhase === INTERVIEW_PHASES.TECHNICAL_DEEP_DIVE && historyLength >= 22) {
        sessionData.currentPhase = INTERVIEW_PHASES.BEHAVIORAL;
        console.log('📍 Phase changed to: BEHAVIORAL');
    } else if (currentPhase === INTERVIEW_PHASES.BEHAVIORAL && historyLength >= 28) {
        sessionData.currentPhase = INTERVIEW_PHASES.CLOSING;
        console.log('📍 Phase changed to: CLOSING');
    }
}

// Generate AI Feedback from conversation
export async function generateAIFeedback(
    conversation: ConversationEntry[],
    interviewData?: any,
    resumeData?: any
): Promise<any> {
    try {
        console.log('🤖 Starting AI feedback generation...');
        console.log('📊 Input data:', {
            conversationLength: conversation.length,
            hasInterviewData: !!interviewData,
            hasResumeData: !!resumeData
        });

        // Format conversation for the prompt
        const conversationText = conversation
            .slice(-20) // Last 20 messages to avoid token limits
            .map(entry =>
                `${entry.role === 'user' ? 'Candidate' : 'Interviewer'}: ${entry.content}`
            )
            .join('\n\n');

        const FEEDBACK_PROMPT = `
Analyze this interview conversation and provide comprehensive feedback:

CONVERSATION:
${conversationText}

${interviewData ? `JOB CONTEXT:
- Position: ${interviewData.jobPosition || 'Not specified'}
- Type: ${interviewData.type || 'Not specified'}
- Duration: ${interviewData.duration || 'Not specified'}` : ''}

${resumeData ? `CANDIDATE BACKGROUND:
- Experience: ${resumeData.experience_years || 'Not specified'} years
- Skills: ${resumeData.technical_skills ? JSON.stringify(resumeData.technical_skills).slice(0, 200) + '...' : 'Not specified'}` : ''}

Provide feedback in this EXACT JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": 0,
      "communication": 0,
      "problemSolving": 0,
      "experience": 0
    },
    "summary": "Brief 3-line summary of candidate performance",
    "recommendation": true,
    "recommendationMsg": "One-line recommendation message"
  }
}

Rate each category 1-10 based on:
- Technical Skills: Relevance to position, depth of knowledge
- Communication: Clarity, articulation, listening skills  
- Problem Solving: Analytical thinking, solution approach
- Experience: Relevance of experience to role requirements

Be fair and constructive in your assessment.`;

        console.log('📝 Sending request to Groq API...');
        const completion = await groq.chat.completions.create({
            model: AVAILABLE_MODELS[0],
            messages: [
                {
                    role: "system",
                    content: "You are an expert HR analyst. Provide fair, constructive interview feedback in the exact JSON format requested. Be specific and actionable."
                },
                {
                    role: "user",
                    content: FEEDBACK_PROMPT
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const response = completion.choices[0]?.message?.content?.trim();
        console.log('📨 Raw AI response received');

        if (!response) {
            throw new Error("Empty response from AI");
        }

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const feedbackData = JSON.parse(jsonMatch[0]);
                console.log('✅ AI Feedback parsed successfully');

                // Validate feedback structure
                if (!feedbackData.feedback || !feedbackData.feedback.rating) {
                    throw new Error("Invalid feedback structure");
                }

                return feedbackData;
            } catch (parseError) {
                console.error('❌ JSON parsing error:', parseError);
                throw new Error("Failed to parse AI response");
            }
        }

        throw new Error("No valid JSON found in response");

    } catch (error) {
        console.error('❌ Error generating AI feedback:', error);

        // Return structured fallback feedback
        return {
            feedback: {
                rating: {
                    technicalSkills: 5,
                    communication: 5,
                    problemSolving: 5,
                    experience: 5
                },
                summary: "Unable to generate detailed feedback at this time. Please review the conversation manually.",
                recommendation: false,
                recommendationMsg: "Evaluation pending - manual review recommended"
            }
        };
    }
}

export interface AIMessage {
    text: string;
    isQuestion?: boolean;
    questionType?: string;
}

export async function getAIResponse(
    message: string | null,
    sessionId: string = "default",
    elapsedTime?: number,
    totalDuration?: number,
    timeExceeded?: boolean,
    candidateName?: string,
    candidateEmail?: string
): Promise<{ messages: AIMessage[] }> {

    // Initialize session if needed
    if (!conversationHistory.has(sessionId)) {
        conversationHistory.set(sessionId, []);

        console.log('🚀 Initializing new session:', sessionId);
        console.log('👤 Candidate details:', { candidateName, candidateEmail });

        // ✅ FIXED: Use the unified fetchInterviewData function
        const { interview, resume } = await fetchInterviewData(sessionId, candidateName, candidateEmail);

        sessionDataStore.set(sessionId, {
            interviewData: interview || undefined,
            resumeData: resume || undefined,
            askedQuestions: new Set<string>(),
            currentPhase: INTERVIEW_PHASES.INTRODUCTION,
            questionIndex: 0,
            dataLoaded: !!(interview || resume),
            timeExceeded: false
        });

        if (resume) {
            console.log('✅ Resume linked to candidate:', resume.user_name, resume.user_email);
        } else {
            console.warn('⚠️ No resume data loaded for this candidate');
        }
    }

    // Retrieve session data
    const history = conversationHistory.get(sessionId)!;
    const sessionData = sessionDataStore.get(sessionId)!;

    // Update time exceeded status
    if (timeExceeded !== undefined) {
        sessionData.timeExceeded = timeExceeded;
    }

    // Handle time exceeded scenario
    if (message === "[TIME_EXCEEDED]") {
        const closingQuestions = [
            "We're nearing the end of our time together. Looking ahead, where do you see yourself in the next 2-3 years professionally?",
            "As we wrap up, what kind of work environment and team culture brings out your best performance?",
            "Before we conclude, what are you looking for in your next role and what would make you excited to join a company?",
            "What's the most important factor for you when considering a new opportunity at this stage of your career?",
            "If you were to receive an offer, what would you need to see to feel confident about making a move?",
            "Looking back at our discussion, is there anything we haven't covered that you think is important for me to know about you?",
            "What questions do you have for me about the role, team, or company that would help you in your decision-making process?"
        ];

        const randomClosingQuestion = closingQuestions[Math.floor(Math.random() * closingQuestions.length)];

        const closingMessage: AIMessage = {
            text: `I notice we've reached our scheduled time. ${randomClosingQuestion}`,
            isQuestion: true,
            questionType: 'closing'
        };

        history.push({ role: "assistant", content: closingMessage.text, timestamp: new Date() });
        return { messages: [closingMessage] };
    }

    // Handle initial greeting
    if (!message) {
        const jobPosition = sessionData.interviewData?.jobPosition || 'this position';
        const resumeCandidateName = sessionData.resumeData?.user_name; // Different name to avoid shadowing
        const duration = sessionData.interviewData?.duration || 'this interview';

        const dynamicGreeting = await generateDynamicGreeting(jobPosition, resumeCandidateName, sessionData.resumeData);

        const welcomeMessages: AIMessage[] = [
            {
                text: `${dynamicGreeting} We have scheduled ${duration} for our conversation today.`
            },
            {
                text: "To get started, could you please introduce yourself and tell me what interests you most about this opportunity?",
                isQuestion: true,
                questionType: 'introduction'
            }
        ];

        welcomeMessages.forEach(msg => {
            history.push({ role: "assistant", content: msg.text, timestamp: new Date() });
        });

        return { messages: welcomeMessages };
    }

    // Add user message to history
    history.push({ role: "user", content: message, timestamp: new Date() });

    // Check for API key
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        return {
            messages: [{ text: "Please configure the Groq API key to use the AI interview feature!" }]
        };
    }

    try {
        console.log("✅ Calling Groq API...");
        console.log("📍 Current phase:", sessionData.currentPhase);
        console.log("⏰ Time status:", {
            elapsed: elapsedTime ? `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s` : 'unknown',
            total: totalDuration ? `${Math.floor(totalDuration / 60)}m` : 'unknown',
            exceeded: sessionData.timeExceeded
        });

        // Get next question
        const nextQuestion = getNextQuestion(sessionData);

        // Build context with time information
        const resumeContext = buildResumeContext(sessionData.resumeData!);
        const customQuestions = sessionData.interviewData?.questionList || [];

        // Calculate time context for AI
        const timeContext = elapsedTime && totalDuration ? `
TIME CONTEXT:
- Elapsed Time: ${Math.floor(elapsedTime / 60)} minutes ${elapsedTime % 60} seconds
- Total Scheduled Duration: ${Math.floor(totalDuration / 60)} minutes
- Time Remaining: ${Math.floor((totalDuration - elapsedTime) / 60)} minutes ${(totalDuration - elapsedTime) % 60} seconds
- Time Status: ${sessionData.timeExceeded ? 'EXCEEDED - START CLOSING' : (elapsedTime > totalDuration * 0.8 ? 'NEARING END - TRANSITION TO CLOSING' : 'IN_PROGRESS')}
` : '';

        const systemPrompt = `You are "Alex", a senior technical interviewer with 8+ years of experience.

        CANDIDATE INFORMATION:
        - Name: ${sessionData.resumeData?.user_name || 'Candidate'}
        - Email: ${sessionData.resumeData?.user_email || 'Not provided'}

${timeContext}

${resumeContext}

JOB CONTEXT:
- Position: ${sessionData.interviewData?.jobPosition || 'Technical Role'}
- Duration: ${sessionData.interviewData?.duration || 'Not specified'}
- Type: ${sessionData.interviewData?.type || 'Full-time'}

CUSTOM QUESTIONS AVAILABLE (${customQuestions.length} questions):
${customQuestions.map((q: any, i: number) => `${i + 1}. ${typeof q === 'string' ? q : (q.question || q.text || JSON.stringify(q))}`).join('\n')}

${nextQuestion ? `\nNEXT PLANNED QUESTION: "${nextQuestion}"\nIncorporate this naturally into your response.` : ''}

CONVERSATION HISTORY (last 6 exchanges):
${history.slice(-12).map(entry =>
            `${entry.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}: ${entry.content}`
        ).join('\n')}

CURRENT INTERVIEW PHASE: ${sessionData.currentPhase}
TIME EXCEEDED: ${sessionData.timeExceeded}

IMPORTANT TIME-BASED INSTRUCTIONS:
${sessionData.timeExceeded ? `
🔴 TIME EXCEEDED - CRITICAL: You MUST wrap up the interview now. Ask ONE final closing question about:
- Career goals and aspirations (2-3 year vision)
- Work environment preferences and team culture fit
- Decision-making factors for job opportunities
- Any final questions they have for you
- Keep it professional but conclusive
` : (elapsedTime && totalDuration && elapsedTime > totalDuration * 0.8 ? `
🟡 TIME WARNING: You have less than 20% time remaining. Start transitioning to closing questions about:
- Long-term career goals
- Company culture preferences
- Final thoughts or questions
` : `
🟢 TIME OK: Continue with normal interview flow, but be mindful of the time.
`)}

YOUR INTERVIEW STYLE:
- Be HUMAN, WARM, and PROFESSIONAL
- Reference specific details from their resume when relevant
- ${sessionData.timeExceeded ? 'Focus on concluding the interview gracefully with meaningful closing questions' : 'Ask thoughtful follow-up questions'}
- Keep responses concise (1-2 sentences)
- Sound like a real person

RESPONSE FORMAT: Return ONLY valid JSON:
{
  "text": "your response",
  "questionType": "custom" | "resume" | "followup" | "closing",
  "isQuestion": true | false
}`;

        let completion = null;
        let lastError = null;

        for (const model of AVAILABLE_MODELS) {
            try {
                completion = await groq.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        {
                            role: "user",
                            content: `Candidate said: "${message}"
                            
                            ${sessionData.timeExceeded ?
                                    'TIME IS UP - Ask a meaningful closing question about their career goals or decision factors.' :
                                    nextQuestion ? `Work in this question naturally: "${nextQuestion}"` :
                                        'Ask a relevant follow-up based on their resume and conversation.'
                                }`
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 200,
                });
                break;
            } catch (modelError) {
                lastError = modelError;
                continue;
            }
        }

        if (!completion) {
            throw new Error(`All models failed. Last error: ${(lastError as Error)?.message}`);
        }

        const rawContent = completion.choices[0].message.content;
        let response;

        try {
            let cleanedContent = rawContent ?? '';
            cleanedContent = cleanedContent.replace(/```json\n?/gi, '').replace(/```\n?/g, '');

            const jsonMatch = cleanedContent.match(/(\{[\s\S]*\})/);
            if (jsonMatch) {
                cleanedContent = jsonMatch[1].trim();
            }

            response = JSON.parse(cleanedContent);

            if (!response.text) {
                throw new Error('Invalid response format');
            }
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            response = {
                text: sessionData.timeExceeded ?
                    "As we wrap up our time together, where do you see your career heading in the next 2-3 years?" :
                    (nextQuestion || "That's really interesting! Could you tell me more about how you approached that?"),
                questionType: sessionData.timeExceeded ? "closing" : (nextQuestion ? "custom" : "followup"),
                isQuestion: true
            };
        }

        const messages = [{
            text: response.text,
            questionType: response.questionType,
            isQuestion: response.isQuestion
        }];

        // Update interview phase considering time
        updateInterviewPhase(sessionData, history.length, elapsedTime, totalDuration);

        // Add AI message to history
        messages.forEach(msg => {
            history.push({ role: "assistant", content: msg.text, timestamp: new Date() });
        });

        // Keep history manageable
        if (history.length > 25) {
            const intro = history.slice(0, 2);
            const recent = history.slice(-23);
            conversationHistory.set(sessionId, [...intro, ...recent]);
        }

        console.log(`✅ Response sent (${response.questionType || 'followup'} type)`);
        return { messages };

    } catch (error) {
        console.error('❌ Groq API error:', error);

        // Smart fallback considering time
        const nextQuestion = getNextQuestion(sessionData);
        let fallbackText;

        if (sessionData.timeExceeded) {
            fallbackText = "As we conclude our discussion, what are the most important factors you consider when evaluating new opportunities?";
        } else {
            fallbackText = nextQuestion || "That's really interesting! Could you walk me through the technical details of how you implemented that?";
        }

        const messages = [{
            text: fallbackText,
            isQuestion: true,
            questionType: sessionData.timeExceeded ? 'closing' : 'followup'
        }];

        messages.forEach(msg => {
            history.push({ role: "assistant", content: msg.text, timestamp: new Date() });
        });

        return { messages };
    }
}

export function clearConversationHistory(sessionId: string = "default"): void {
    if (conversationHistory.has(sessionId)) {
        conversationHistory.delete(sessionId);
        sessionDataStore.delete(sessionId);
        if (usedQuestions.has(sessionId)) {
            usedQuestions.delete(sessionId);
        }
        console.log('🧹 Cleared session data for:', sessionId);
    }
}
