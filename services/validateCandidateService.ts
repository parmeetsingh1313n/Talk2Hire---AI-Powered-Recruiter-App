import { EmailValidationResult, ValidateCandidate, ValidateCandidateInput } from '@/app/types/validate-candidate';
import { supabase } from './supabaseClient';

export class ValidateCandidateService {
    // Create or update candidate emails for an interview
    static async upsertCandidateEmails(input: ValidateCandidateInput): Promise<ValidateCandidate | null> {
        try {
            const { data, error } = await supabase
                .from('Validate-Candidate')
                .upsert({
                    interview_id: input.interview_id,
                    admin_email: input.admin_email,
                    candidate_emails: input.candidate_emails || [] // Ensure array
                }, {
                    onConflict: 'interview_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase upsert error:', error);
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Error upserting candidate emails:', error);
            return null;
        }
    }

    // Get candidate emails for an interview
    static async getCandidateEmails(interview_id: string): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('Validate-Candidate')
                .select('candidate_emails')
                .eq('interview_id', interview_id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return []; // No rows found
                throw error;
            }

            // Return as array, ensuring it's always an array
            if (!data || !data.candidate_emails) return [];

            if (Array.isArray(data.candidate_emails)) {
                return data.candidate_emails;
            } else if (typeof data.candidate_emails === 'string') {
                // Handle legacy string format
                try {
                    const parsed = JSON.parse(data.candidate_emails);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return data.candidate_emails.split(',').map(email => email.trim()).filter(email => email);
                }
            }
            return [];
        } catch (error) {
            console.error('Error getting candidate emails:', error);
            return [];
        }
    }

    // Validate candidate email for an interview
    static async validateCandidateEmail(interview_id: string, candidateEmail: string): Promise<EmailValidationResult> {
        try {
            const emails = await this.getCandidateEmails(interview_id);

            if (emails.length === 0) {
                return {
                    isValid: true,
                    message: 'No email restrictions for this interview',
                    allowedEmails: []
                };
            }

            const isValid = emails.includes(candidateEmail.trim().toLowerCase());

            if (!isValid) {
                return {
                    isValid: false,
                    message: `Email "${candidateEmail}" is not authorized for this interview. Please contact the recruiter.`
                };
            }

            return {
                isValid: true,
                message: 'Email validated successfully',
                allowedEmails: emails
            };
        } catch (error) {
            console.error('Error validating candidate email:', error);
            return {
                isValid: false,
                message: 'Error validating email. Please try again.'
            };
        }
    }

    // Add single email to existing list
    static async addCandidateEmail(interview_id: string, email: string): Promise<boolean> {
        try {
            // Get existing emails
            const existingEmails = await this.getCandidateEmails(interview_id);
            const emailToAdd = email.trim().toLowerCase();

            // Check if email already exists
            if (existingEmails.includes(emailToAdd)) {
                return true; // Already exists
            }

            // Add email to array and update
            const updatedEmails = [...existingEmails, emailToAdd];

            const { error } = await supabase
                .from('Validate-Candidate')
                .upsert({
                    interview_id: interview_id,
                    candidate_emails: updatedEmails
                }, {
                    onConflict: 'interview_id'
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding candidate email:', error);
            return false;
        }
    }

    // Remove email from list
    static async removeCandidateEmail(interview_id: string, email: string): Promise<boolean> {
        try {
            const emails = await this.getCandidateEmails(interview_id);
            const emailToRemove = email.trim().toLowerCase();

            // Filter out the email to remove
            const updatedEmails = emails.filter(e => e !== emailToRemove);

            const { error } = await supabase
                .from('Validate-Candidate')
                .upsert({
                    interview_id: interview_id,
                    candidate_emails: updatedEmails
                }, {
                    onConflict: 'interview_id'
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error removing candidate email:', error);
            return false;
        }
    }
}