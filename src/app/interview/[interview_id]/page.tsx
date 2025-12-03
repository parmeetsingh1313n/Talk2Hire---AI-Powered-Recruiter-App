"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Video, CheckCircle, Wifi, Camera, Mic, Play, Shield, Star, MonitorUp, Mail, User, Briefcase, Code, Award } from "lucide-react";
import { Federant } from "next/font/google";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../../../services/supabaseClient";
import ResumeUploadDialog from "../_components/ResumeUploadDialog";

const federant = Federant({ subsets: ['latin'], weight: ['400'], });

interface InterviewData {
    jobPosition: string;
    jobDescription: string;
    duration: string;
    type: string;
}

interface Project {
    name: string;
    description: string;
    technologies: string[];
}

interface WorkExperience {
    jobTitle: string;
    company: string;
    duration: string;
    responsibilities: string[];
    description: string;
}

interface Education {
    degree: string;
    institution: string;
    year: string;
    details: string;
}

interface Certification {
    name: string;
    year: string;
}

interface Languages {
    programming: string[];
    spoken: string[];
}

interface ResumeData {
    professionalSummary: string;
    experienceYears: number;
    technicalSkills: string[];
    projects: Project[];
    workExperience: WorkExperience[];
    education: Education[];
    certifications: Certification[];
    achievements: string[];
    languages: Languages;
    keyHighlights: string[];
}

interface ResumeAnalysisData {
    education: Array<{ degree: string; institution: string; year: string }>;
    projects: Array<{ name: string; main_points: string[]; technologies: string[] }>;
    experience: { years: number; level: string };
    skills: { [key: string]: string[] };
    certifications?: Array<string | { name: string; year: string }>;
    achievements?: string[];
    analysis_summary: {
        total_projects: number;
        education_entries: number;
        skill_categories: number;
        certifications_count?: number;
        achievements_count?: number;
        candidate_type: string;
    };
}

function Interview() {
    const { interview_id } = useParams();
    const router = useRouter();
    console.log(interview_id);

    const [interviewData, setInterviewData] = useState<InterviewData | undefined>();
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [showResumeDialog, setShowResumeDialog] = useState(false);
    const [storedAnalysisData, setStoredAnalysisData] = useState<ResumeAnalysisData | null>(null);

    useEffect(() => {
        interview_id && GetInterviewDetails();
    }, [interview_id])

    const GetInterviewDetails = async () => {
        setLoading(true);
        try {
            let { data: Interviews, error } = await supabase
                .from('Interviews')
                .select("jobPosition,jobDescription,duration,type")
                .eq('interview_id', interview_id);

            setInterviewData(Interviews?.[0]);
            setLoading(false);
            if (Interviews?.length == 0) {
                toast('Incorrect Interview Link')
                return;
            }
        }
        catch (e) {
            setLoading(false);
            toast('Incorrect Interview Link')
        }
    }

    const handleContinue = () => {
        if (!userName || !email) {
            toast('Please fill in all required fields');
            return;
        }
        setShowResumeDialog(true);
    };

    const saveResumeDataToSupabase = async (analysisData: ResumeAnalysisData) => {
        try {
            console.log('Raw analysis data received:', analysisData);

            // Validate input data
            if (!analysisData || typeof analysisData !== 'object') {
                console.error('Invalid analysis data received');
                toast.error('Invalid analysis data');
                return null;
            }

            // Transform certifications - handle both string and object formats
            const safeCertifications: Certification[] = (analysisData.certifications || [])
                .map(cert => {
                    if (typeof cert === 'string') {
                        return { name: cert, year: '' };
                    }
                    if (cert && typeof cert === 'object' && 'name' in cert) {
                        return {
                            name: cert.name || 'Unnamed Certification',
                            year: cert.year || ''
                        };
                    }
                    return null;
                })
                .filter((cert): cert is Certification => cert !== null);

            // Transform achievements - ensure they are strings
            const safeAchievements: string[] = (analysisData.achievements || [])
                .map(achievement => {
                    if (typeof achievement === 'string') {
                        return achievement;
                    }
                    if (achievement && typeof achievement === 'object') {
                        return JSON.stringify(achievement);
                    }
                    return null;
                })
                .filter((ach): ach is string => ach !== null && ach.length > 0);

            // Get experience data safely
            const experienceYears = analysisData.experience?.years ?? 0;
            const experienceLevel = analysisData.experience?.level ?? 'Fresher';

            // Convert experience to string format for database
            const experienceYearsString = experienceYears === 0
                ? 'Fresher'
                : experienceYears.toString();

            // Transform education data
            const safeEducation: Education[] = (analysisData.education || []).map(edu => ({
                degree: edu.degree || 'Not specified',
                institution: edu.institution || 'Not specified',
                year: edu.year || '',
                details: ''
            }));

            // Transform projects data - CLEAN FORMAT
            const safeProjects: Project[] = (analysisData.projects || []).map((project, index) => ({
                name: project.name || `Project ${index + 1}`,
                description: (project.main_points || [])
                    .filter(point => point && point.trim().length > 0)
                    .join('. ') || 'No description available',
                technologies: (project.technologies || [])
                    .filter(tech => tech && tech.trim().length > 0)
            }));

            // Flatten skills from categorized format
            const allSkills = Object.values(analysisData.skills || {})
                .flat()
                .filter((skill, index, self) => skill && self.indexOf(skill) === index); // Remove duplicates

            // Create professional summary
            const professionalSummary = experienceYears === 0
                ? `Entry-level professional with ${safeProjects.length} project${safeProjects.length !== 1 ? 's' : ''} and expertise in ${allSkills.slice(0, 3).join(', ')}`
                : `${experienceLevel} with ${experienceYears} year${experienceYears !== 1 ? 's' : ''} of experience, ${safeProjects.length} notable project${safeProjects.length !== 1 ? 's' : ''}, and proficiency in ${allSkills.slice(0, 5).join(', ')}`;

            // Create key highlights
            const keyHighlights: string[] = [
                ...safeEducation.map(edu => `${edu.degree}${edu.institution ? ` from ${edu.institution}` : ''}`),
                ...safeProjects.slice(0, 3).map(proj => `Developed: ${proj.name}`),
                ...safeCertifications.slice(0, 3).map(cert => `Certified: ${cert.name}`),
                ...safeAchievements.slice(0, 2),
                `${experienceLevel} - ${experienceYears} years experience`
            ].filter(Boolean);

            // Transform the AI analysis data to match our ResumeData interface
            const resumeData: ResumeData = {
                professionalSummary,
                experienceYears,
                technicalSkills: allSkills,
                projects: safeProjects,
                workExperience: [], // Empty as we don't extract this from current parsing
                education: safeEducation,
                certifications: safeCertifications,
                achievements: safeAchievements,
                languages: {
                    programming: allSkills,
                    spoken: ['English'] // Default
                },
                keyHighlights
            };

            console.log('Transformed resume data for database:', resumeData);

            // Save to Supabase
            const { data, error } = await supabase
                .from('ResumeData')
                .insert([
                    {
                        interview_id: interview_id,
                        user_name: userName,
                        user_email: email,
                        professional_summary: resumeData.professionalSummary,
                        experience_years: experienceYearsString,
                        technical_skills: resumeData.technicalSkills,
                        projects: resumeData.projects,
                        work_experience: resumeData.workExperience,
                        education: resumeData.education,
                        certifications: resumeData.certifications,
                        achievements: resumeData.achievements,
                        languages: resumeData.languages,
                        key_highlights: resumeData.keyHighlights,
                        raw_analysis_data: analysisData
                    }
                ])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                toast.error('Error saving resume data: ' + error.message);
                return null;
            }

            console.log('Successfully saved to database:', data);
            return resumeData;
        } catch (error) {
            console.error('Error in saveResumeDataToSupabase:', error);
            toast.error('Error saving resume data');
            return null;
        }
    };

    const handleResumeUpload = async (data: ResumeAnalysisData) => {
        const savedResumeData = await saveResumeDataToSupabase(data);
        if (savedResumeData) {
            setResumeData(savedResumeData);
            setStoredAnalysisData(data); // Store the analysis data for dialog reopening
            setShowResumeDialog(false);
            toast.success('Resume analyzed and saved successfully!');
        }
    };

    const handleDialogOpenChange = (open: boolean) => {
        setShowResumeDialog(open);
        // If opening the dialog and we have stored analysis data, pass it to the dialog
        if (open && storedAnalysisData) {
            // The dialog will receive the stored data through props
        }
    };

    const proceedToInterview = () => {
        if (!resumeData) {
            toast('Please upload and analyze your resume first');
            return;
        }

        // Navigate to the room page
        router.push(`/interview/${interview_id}/room`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-100/10 to-cyan-100/10 rounded-full blur-2xl animate-ping delay-500"></div>
            </div>

            <div className="relative z-10 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-4 mb-6 p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40">
                            <div className="relative">
                                <Image src="/logo.png" alt="logo" width={60} height={60} className='rounded-xl shadow-lg' />
                            </div>
                            <span className={`text-3xl md:text-4xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold ${federant.className}`}>
                                Talk2Hire
                            </span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <p className="text-xl font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">AI-Powered Interview Platform</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Shield className="w-4 h-4" />
                                <span>Secure</span>
                                <span>•</span>
                                <Star className="w-4 h-4" />
                                <span>Professional</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Hero Card */}
                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/30 overflow-hidden mb-6 w-full mx-auto">
                        {/* Large Video Hero Section */}
                        <div className="relative bg-gradient-to-br from-blue-400/80 via-blue-500/80 to-cyan-500/80 p-4 md:p-6">
                            <div className="flex flex-col items-center space-y-4 text-white">
                                <div className="flex flex-col items-center space-y-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                        {interviewData?.jobPosition || "Loading Position..."}
                                    </h1>
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-medium">{interviewData?.duration || "Duration"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section - Side by Side Layout */}
                        <div className="p-4 md:p-6">
                            {!resumeData ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column - Video */}
                                    <div className="space-y-6">
                                        <div className="relative group">
                                            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl bg-black/30 border-4 border-white/20">
                                                <video
                                                    src="/taking-interview.mp4"
                                                    autoPlay
                                                    loop
                                                    muted
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                                            <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-full p-2">
                                                <Play className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        {/* Stats Footer */}
                                        <div className="flex items-center justify-around text-center">
                                            <div className="flex flex-col items-center space-y-1">
                                                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">10K+</span>
                                                <span className="text-xs text-gray-600">Interviews</span>
                                            </div>
                                            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                                            <div className="flex flex-col items-center space-y-1">
                                                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">95%</span>
                                                <span className="text-xs text-gray-600">Success Rate</span>
                                            </div>
                                            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                                            <div className="flex flex-col items-center space-y-1">
                                                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">24/7</span>
                                                <span className="text-xs text-gray-600">AI Available</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Form */}
                                    <div className="space-y-6">
                                        {/* User Details Input Section */}
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    1
                                                </div>
                                                <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Enter your details</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        placeholder="Full Name"
                                                        value={userName}
                                                        onChange={(e) => setUserName(e.target.value)}
                                                        className="pl-10 text-base p-3 border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-md focus:shadow-lg"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="pl-10 text-base p-3 border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-md focus:shadow-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prerequisites Section */}
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    2
                                                </div>
                                                <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Before you begin</h3>
                                            </div>
                                            <div className="flex flex-col space-y-3">
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-100/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                        <Wifi className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <span className="font-medium text-gray-800 text-sm">Stable Internet</span>
                                                        <span className="text-xs text-gray-600">Ensure reliable connection</span>
                                                    </div>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-100/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                                                        <Camera className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <span className="font-medium text-gray-800 text-sm">Camera & Audio</span>
                                                        <span className="text-xs text-gray-600">Test your equipment</span>
                                                    </div>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-100/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                                                        <Mic className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <span className="font-medium text-gray-800 text-sm">Quiet Environment</span>
                                                        <span className="text-xs text-gray-600">Find peaceful location</span>
                                                    </div>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Join Button Section */}
                                        <div className="flex flex-col items-center space-y-3 pt-4">
                                            <Button
                                                onClick={handleContinue}
                                                disabled={loading || !userName || !email}
                                                className={`
                                                    group relative overflow-hidden px-8 py-3 text-base font-semibold rounded-xl
                                                    bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 
                                                    hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600
                                                    shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1 
                                                    transition-all duration-300 border border-white/20
                                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                                    min-w-[200px] cursor-pointer
                                                `}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                <div className="relative flex items-center justify-center gap-2">
                                                    <MonitorUp className="w-4 h-4" />
                                                    {loading ? "Preparing..." : "Upload Resume"}
                                                </div>
                                            </Button>
                                            <p className="text-xs text-gray-500 max-w-xs text-center">
                                                Next step: Upload your resume for professional analysis
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Resume Analysis Summary */
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            ✓
                                        </div>
                                        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Resume Analysis Complete</h3>
                                    </div>

                                    {/* Professional Overview - FIXED: Better responsive grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200 min-w-0">
                                            <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-blue-700 truncate">
                                                {resumeData.experienceYears === 0 ? 'Fresher' : `${resumeData.experienceYears} years`}
                                            </p>
                                            <p className="text-xs text-blue-600 truncate">
                                                {resumeData.experienceYears === 0 ? 'Experience Level' : 'Years Experience'}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center border border-purple-200 min-w-0">
                                            <Code className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-purple-700 truncate">{(resumeData.projects || []).length}</p>
                                            <p className="text-xs text-purple-600 truncate">Projects</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center border border-green-200 min-w-0">
                                            <Briefcase className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-green-700 truncate">{(resumeData.technicalSkills || []).length}</p>
                                            <p className="text-xs text-green-600 truncate">Technical Skills</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg text-center border border-orange-200 min-w-0">
                                            <Award className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-orange-700 truncate">{(resumeData.achievements || []).length}</p>
                                            <p className="text-xs text-orange-600 truncate">Achievements</p>
                                        </div>
                                    </div>

                                    {/* Key Highlights Preview */}
                                    {(resumeData.keyHighlights || []).length > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-cyan-600" />
                                                Professional Highlights
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {(resumeData.keyHighlights || []).slice(0, 4).map((highlight, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-gray-700">{highlight}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Skills Preview */}
                                    {(resumeData.technicalSkills || []).length > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Code className="w-4 h-4 text-indigo-600" />
                                                Top Technical Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(resumeData.technicalSkills || []).slice(0, 8).map((skill, index) => (
                                                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(resumeData.technicalSkills || []).length > 8 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                        +{(resumeData.technicalSkills || []).length - 8} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certifications Preview */}
                                    {(resumeData.certifications || []).length > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Award className="w-4 h-4 text-yellow-600" />
                                                Certifications ({(resumeData.certifications || []).length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(resumeData.certifications || []).map((cert, index) => (
                                                    <div key={index} className="bg-white/60 border border-yellow-200 rounded-lg p-3">
                                                        <h5 className="font-medium text-gray-900 text-sm">{cert.name}</h5>
                                                        {cert.year && <p className="text-xs text-yellow-600 mt-1">{cert.year}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Achievements Preview */}
                                    {(resumeData.achievements || []).length > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-red-600" />
                                                Achievements ({(resumeData.achievements || []).length})
                                            </h4>
                                            <div className="space-y-2">
                                                {(resumeData.achievements || []).map((achievement, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-gray-700">{achievement}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowResumeDialog(true)}
                                            className="flex-1 border-2 border-blue-200 hover:border-blue-400 text-blue-700 hover:bg-blue-50"
                                        >
                                            <MonitorUp className="w-4 h-4 mr-2" />
                                            View Full Analysis
                                        </Button>
                                        <Button
                                            onClick={proceedToInterview}
                                            className="flex-1 bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 hover:from-green-600 hover:via-green-700 hover:to-emerald-600 shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            Start Tailored Interview
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ResumeUploadDialog */}
                    {showResumeDialog && (
                        <ResumeUploadDialog
                            open={showResumeDialog}
                            onOpenChange={handleDialogOpenChange}
                            onUploadSuccess={handleResumeUpload}
                            existingAnalysisData={storedAnalysisData}
                            interview_id={interview_id as string}
                            userName={userName}
                            userEmail={email}
                        />
                    )}
                </div>

            </div>
        </div>
    )
}

export default Interview;