// types.ts - Enhanced version with all necessary types

export interface Interview {
    id: string;
    jobPosition: string;
    jobDescription: any;
    duration: string;
    type: string;
    userEmail: string;
    interview_id: string;
    schedule_date: string;
    schedule_time: string;
    validity: number;
    created_at: string;
    questionList: any;
    service_type?: string;
}

export interface FeedbackRating {
    technicalSkills?: number;
    communication?: number;
    problemSolving?: number;
    experience?: number;
    [key: string]: number | undefined;
}

export interface FeedbackData {
    rating?: FeedbackRating;
    summary?: string;
    recommendation?: boolean;
    recommendationMsg?: string;
}

export interface InterviewFeedback {
    id: string;
    userName: string;
    userEmail: string;
    interview_id: string;
    feedback: FeedbackData;
    recommended: boolean;
    created_at: string;
}

export interface InterviewConversation {
    id: number;
    created_at: string;
    interview_id: string;
    question_sequence: number;
    question_type: string;
    ai_question: string;
    candidate_answer: string;
    ai_response: string;
    expected_answer: string;
    improvement_feedback: string;
    technical_skill_rating: number;
    communication_rating: number;
    problem_solving_rating: number;
    experience_relevance_rating: number;
    overall_rating: number;
    keywords_matched: any;
    analysis_insights: string;
}

export interface ResumeData {
    id: string;
    created_at: string;
    interview_id: string;
    user_name: string;
    user_email: string;
    professional_summary: string;
    experience_years: string;
    technical_skills: any;
    projects: any;
    work_experience: any;
    education: any;
    certifications: any;
    achievements: any;
    languages: any;
    key_highlights: any;
    raw_analysis_data: any;
}

export interface CandidatePerformance {
    interview: Interview;
    feedback?: InterviewFeedback;
    conversations: InterviewConversation[];
    resumeData?: ResumeData;
    conversationCount: number;
    avgRating: number;
    technicalRating: number;
    communicationRating: number;
    problemSolvingRating: number;
    experienceRating: number;
}

export interface MonthlyTrend {
    month: string;
    interviews: number;
    candidates: number;
    avgRating: number;
    completionRate: number;
}

export interface SkillAnalysis {
    skill: string;
    count: number;
    avgProficiency: number;
}

export interface PositionAnalytics {
    position: string;
    totalInterviews: number;
    totalCandidates: number;
    avgRating: number;
    recommendationRate: number;
    completionRate: number;
}