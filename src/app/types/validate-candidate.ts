export interface ValidateCandidate {
    id: number;
    interview_id: string;
    admin_email: string;
    candidate_emails: string[];
    created_at: string;
    updated_at: string;
}

export interface ValidateCandidateInput {
    interview_id: string;
    admin_email: string;
    candidate_emails: string[];
}

export interface EmailValidationResult {
    isValid: boolean;
    message: string;
    allowedEmails?: string[];
}