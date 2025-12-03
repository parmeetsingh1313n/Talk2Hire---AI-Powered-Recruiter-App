// types/interview.ts
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

export interface ConversationEntry {
    sequence: number;
    question_type: string;
    ai_question: string;
    candidate_answer: string;
    ai_response: string;
    analysis: ConversationAnalysis;
    timestamp: string;
}

export interface InterviewConversation {
    id?: string;
    created_at?: string;
    userEmail: string;
    interview_id: string;
    conversation_data: ConversationEntry[];
    overall_feedback?: {
        rating: {
            technicalSkills: number;
            communication: number;
            problemSolving: number;
            experience: number;
        };
        summary: string;
        recommendation: boolean;
        recommendationMsg: string;
    };
}

export interface OverallStats {
    technical: number;
    communication: number;
    problemSolving: number;
    experience: number;
    overall: number;
}

export interface InterviewData {
    jobPosition: string;
    jobDescription: string;
    questionList: any[];
    duration: string;
    type: string;
}

export interface ResumeData {
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

export interface AIMessage {
    text: string;
    isQuestion?: boolean;
    questionType?: string;
}

export interface SessionData {
    interviewData?: InterviewData;
    resumeData?: ResumeData;
    askedQuestions: Set<string>;
    currentPhase: string;
    questionIndex: number;
    dataLoaded: boolean;
    timeExceeded: boolean;
}