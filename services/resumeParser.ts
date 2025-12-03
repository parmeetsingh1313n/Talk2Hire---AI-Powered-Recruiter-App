// services/resumeParser.ts
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for Next.js - CRITICAL FIX
if (typeof window === 'undefined') {
    // Server-side: use legacy build for Node.js compatibility
    const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.entry');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
} else {
    // Client-side: use CDN worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface ParsedResume {
    name?: string;
    email?: string;
    phone?: string;
    profile?: string;
    skills: { [category: string]: string[] };
    experience: Array<{
        jobTitle?: string;
        company?: string;
        duration?: string;
        description?: string;
        responsibilities?: string[];
    }>;
    education: Array<{
        degree?: string;
        institution?: string;
        duration?: string;
        gpa?: string;
    }>;
    projects: Array<{
        name?: string;
        description?: string[] | string;
        technologies?: string[];
    }>;
    certifications: Array<string | { name: string; year: string }>;
    achievements: string[];
    languages?: string[];
}

class ResumeParser {
    private async extractTextFromPDF(buffer: Buffer): Promise<string> {
        try {
            console.log('Starting PDF extraction, buffer size:', buffer.length);

            const uint8Array = new Uint8Array(buffer);

            // Load PDF with proper configuration
            const loadingTask = pdfjsLib.getDocument({
                data: uint8Array,
                useSystemFonts: true,
                standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
                cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
                cMapPacked: true,
            });

            const pdf = await loadingTask.promise;
            console.log('PDF loaded successfully, pages:', pdf.numPages);

            let fullText = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();

                    // Extract text with better spacing
                    const pageText = textContent.items
                        .map((item: any) => {
                            if ('str' in item) {
                                return item.str;
                            }
                            return '';
                        })
                        .filter(text => text.trim().length > 0)
                        .join(' ');

                    fullText += pageText + '\n';
                    console.log(`Extracted page ${pageNum}, text length: ${pageText.length}`);
                } catch (pageError) {
                    console.error(`Error extracting page ${pageNum}:`, pageError);
                    // Continue with other pages
                }
            }

            console.log('Total extracted text length:', fullText.length);

            if (fullText.trim().length === 0) {
                throw new Error('No text could be extracted from the PDF. The PDF might be image-based or corrupted.');
            }

            return fullText;
        } catch (error) {
            console.error('PDF extraction error:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to extract text from PDF: ${error.message}`);
            }
            throw new Error('Failed to extract text from PDF');
        }
    }

    private extractEmail(text: string): string | undefined {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const match = text.match(emailRegex);
        return match ? match[0] : undefined;
    }

    private extractPhone(text: string): string | undefined {
        const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
        const match = text.match(phoneRegex);
        return match ? match[0] : undefined;
    }

    private extractName(text: string): string | undefined {
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // Check if it looks like a name (2-4 words, capitalized)
            if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(firstLine)) {
                return firstLine;
            }
            // Try second line if first doesn't match
            if (lines.length > 1) {
                const secondLine = lines[1].trim();
                if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(secondLine)) {
                    return secondLine;
                }
            }
        }
        return undefined;
    }

    private extractSkills(text: string): { [category: string]: string[] } {
        const skills: { [category: string]: string[] } = {};

        const techSkills = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
            'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
            'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'SQL',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
            'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS', 'Material-UI',
            'REST API', 'GraphQL', 'WebSocket', 'Microservices',
            'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
            'Agile', 'Scrum', 'CI/CD', 'DevOps', 'Testing', 'Jest', 'Mocha', 'Pytest'
        ];

        const foundSkills: string[] = [];
        const lowerText = text.toLowerCase();

        techSkills.forEach(skill => {
            const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
            if (regex.test(lowerText)) {
                foundSkills.push(skill);
            }
        });

        // Categorize skills
        const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'];
        const frameworks = ['React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel'];
        const databases = ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'SQL'];
        const cloud = ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'];

        skills['Programming Languages'] = foundSkills.filter(s => languages.includes(s));
        skills['Frameworks & Libraries'] = foundSkills.filter(s => frameworks.includes(s));
        skills['Databases'] = foundSkills.filter(s => databases.includes(s));
        skills['Cloud & DevOps'] = foundSkills.filter(s => cloud.includes(s));
        skills['Other Technologies'] = foundSkills.filter(s =>
            !languages.includes(s) && !frameworks.includes(s) && !databases.includes(s) && !cloud.includes(s)
        );

        // Remove empty categories
        Object.keys(skills).forEach(key => {
            if (skills[key].length === 0) delete skills[key];
        });

        // If no skills found, add a generic entry
        if (Object.keys(skills).length === 0) {
            skills['Technical Skills'] = ['Various technical skills'];
        }

        return skills;
    }

    private extractExperience(text: string): Array<any> {
        const experience: Array<any> = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let inExperienceSection = false;
        let currentExp: any = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (lowerLine.match(/^(experience|work experience|employment|professional experience)/)) {
                inExperienceSection = true;
                continue;
            }

            if (inExperienceSection && lowerLine.match(/^(education|projects|skills|certifications|achievements)/)) {
                if (currentExp) experience.push(currentExp);
                break;
            }

            if (inExperienceSection) {
                const datePattern = /\b(20\d{2}|19\d{2})\b.*\b(20\d{2}|19\d{2}|present|current)\b/i;

                if (datePattern.test(line)) {
                    if (currentExp) experience.push(currentExp);
                    currentExp = {
                        duration: line,
                        description: '',
                        responsibilities: []
                    };
                } else if (currentExp) {
                    if (!currentExp.jobTitle) {
                        currentExp.jobTitle = line;
                    } else if (!currentExp.company) {
                        currentExp.company = line;
                    } else {
                        currentExp.responsibilities.push(line);
                    }
                }
            }
        }

        if (currentExp) experience.push(currentExp);
        return experience;
    }

    private extractEducation(text: string): Array<any> {
        const education: Array<any> = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let inEducationSection = false;
        let currentEdu: any = null;

        const degreePatterns = [
            /\b(bachelor|master|phd|doctorate|b\.?tech|m\.?tech|b\.?e\.|m\.?e\.|b\.?s\.|m\.?s\.|bca|mca|bba|mba)\b/i
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (lowerLine.match(/^(education|academic|qualifications)/)) {
                inEducationSection = true;
                continue;
            }

            if (inEducationSection && lowerLine.match(/^(experience|projects|skills|certifications|achievements)/)) {
                if (currentEdu) education.push(currentEdu);
                break;
            }

            if (inEducationSection) {
                const hasDegree = degreePatterns.some(pattern => pattern.test(line));
                const hasYear = /\b(20\d{2}|19\d{2})\b/.test(line);

                if (hasDegree || hasYear) {
                    if (currentEdu) education.push(currentEdu);
                    currentEdu = {
                        degree: hasDegree ? line : '',
                        duration: hasYear ? line : '',
                        institution: ''
                    };
                } else if (currentEdu && !currentEdu.institution && line.length > 3) {
                    currentEdu.institution = line;
                }
            }
        }

        if (currentEdu) education.push(currentEdu);

        // If no education found, add a default entry
        if (education.length === 0) {
            education.push({
                degree: 'Education details not specified',
                institution: '',
                duration: ''
            });
        }

        return education;
    }

    private extractProjects(text: string): Array<any> {
        const projects: Array<any> = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let inProjectSection = false;
        let currentProject: any = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (lowerLine.match(/^(projects|personal projects|key projects|academic projects)/)) {
                inProjectSection = true;
                continue;
            }

            if (inProjectSection && lowerLine.match(/^(experience|education|skills|certifications|achievements)/)) {
                if (currentProject) projects.push(currentProject);
                break;
            }

            if (inProjectSection) {
                if (line.match(/^[A-Z]/) && !line.includes('.') && line.length < 100 && line.length > 3) {
                    if (currentProject) projects.push(currentProject);
                    currentProject = {
                        name: line,
                        description: [],
                        technologies: []
                    };
                } else if (currentProject) {
                    const techRegex = /\b(React|Node|Python|Java|MongoDB|JavaScript|TypeScript|AWS|Docker|etc\.)\b/gi;
                    const techMatches = line.match(techRegex);
                    if (techMatches) {
                        currentProject.technologies.push(...techMatches);
                    }
                    if (line.length > 10) {
                        currentProject.description.push(line);
                    }
                }
            }
        }

        if (currentProject) projects.push(currentProject);

        // Clean up technologies (remove duplicates)
        projects.forEach(project => {
            project.technologies = [...new Set(project.technologies)];
        });

        return projects;
    }

    private extractCertifications(text: string): Array<string> {
        const certifications: string[] = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let inCertSection = false;

        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            if (lowerLine.match(/^(certifications|certificates|licenses|professional certifications)/)) {
                inCertSection = true;
                continue;
            }

            if (inCertSection && lowerLine.match(/^(experience|education|projects|skills|achievements)/)) {
                break;
            }

            if (inCertSection && line.length > 3) {
                certifications.push(line);
            }
        }

        return certifications;
    }

    private extractAchievements(text: string): string[] {
        const achievements: string[] = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let inAchievementSection = false;

        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            if (lowerLine.match(/^(achievements|accomplishments|awards|honors|recognition)/)) {
                inAchievementSection = true;
                continue;
            }

            if (inAchievementSection && lowerLine.match(/^(experience|education|projects|skills|certifications)/)) {
                break;
            }

            if (inAchievementSection && line.length > 10) {
                achievements.push(line);
            }
        }

        return achievements;
    }

    async parseResume(buffer: Buffer): Promise<ParsedResume> {
        try {
            console.log('Starting resume parsing...');
            const text = await this.extractTextFromPDF(buffer);

            console.log('Text extracted, parsing sections...');

            const parsedData: ParsedResume = {
                name: this.extractName(text),
                email: this.extractEmail(text),
                phone: this.extractPhone(text),
                skills: this.extractSkills(text),
                experience: this.extractExperience(text),
                education: this.extractEducation(text),
                projects: this.extractProjects(text),
                certifications: this.extractCertifications(text),
                achievements: this.extractAchievements(text)
            };

            console.log('Resume parsing complete:', {
                skills: Object.keys(parsedData.skills).length,
                experience: parsedData.experience.length,
                education: parsedData.education.length,
                projects: parsedData.projects.length
            });

            return parsedData;
        } catch (error) {
            console.error('Resume parsing error:', error);
            throw error;
        }
    }
}

export const resumeParser = new ResumeParser();