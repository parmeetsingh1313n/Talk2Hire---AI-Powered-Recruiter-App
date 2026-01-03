export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const extractDomain = (email: string): string | null => {
    const match = email.match(/@([^\s@]+)$/);
    return match ? match[1] : null;
};

export const isValidEmailList = (emails: string[]): {
    isValid: boolean;
    invalidEmails: string[];
    validCount: number;
} => {
    const invalidEmails: string[] = [];
    let validCount = 0;

    emails.forEach(email => {
        const trimmed = email.trim();
        if (trimmed) {
            if (validateEmail(trimmed)) {
                validCount++;
            } else {
                invalidEmails.push(trimmed);
            }
        }
    });

    return {
        isValid: invalidEmails.length === 0,
        invalidEmails,
        validCount
    };
};