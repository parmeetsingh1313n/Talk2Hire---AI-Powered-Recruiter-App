// services/emailservice.tsx - Updated to use API routes

export interface EmailData {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface InterviewEmailData {
    from: string;
    to: string;
    jobPosition: string;
    duration: string;
    questionCount: number;
    interviewType: string;
    interviewLink: string;
    customMessage?: string;
}

/**
 * Send interview invitation via API route (server-side)
 */
export const sendInterviewInvitation = async (emailData: any) => {
    try {
        const res = await fetch('/api/send-interview-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const data = await res.json();
        return data;
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Test email configuration via API route
 */
export const testEmailConfiguration = async () => {
    try {
        const response = await fetch('/api/test-email-config', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Failed to test email configuration'
            };
        }

        return result;

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to test email configuration'
        };
    }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Check if email is from a workspace domain
 */
export const isWorkspaceEmail = (email: string): boolean => {
    const personalDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'live.com', 'icloud.com', 'protonmail.com', 'mail.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? !personalDomains.includes(domain) : false;
};

/**
 * Get workspace domain suggestions
 */
export const getWorkspaceDomainSuggestions = () => {
    return [
        { name: 'Google Workspace', format: 'user@company.com' },
        { name: 'Microsoft 365', format: 'user@company.com' },
        { name: 'Custom Domain', format: 'user@yourcompany.com' }
    ];
};

// Legacy function - now deprecated, use sendInterviewInvitation instead
export const sendEmail = async (emailData: EmailData) => {
    console.warn('sendEmail is deprecated. Use sendInterviewInvitation for interview emails or create a specific API route.');
    return {
        success: false,
        error: 'This function is deprecated. Please use sendInterviewInvitation instead.'
    };
};

export default {
    sendInterviewInvitation,
    testEmailConfiguration,
    validateEmail,
    isWorkspaceEmail,
    getWorkspaceDomainSuggestions
};