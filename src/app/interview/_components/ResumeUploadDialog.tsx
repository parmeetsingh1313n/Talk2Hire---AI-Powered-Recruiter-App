import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Briefcase, Award, GraduationCap, Code, Star, Calendar, Target, TrendingUp, Users, Settings } from 'lucide-react';

interface Project {
    name: string;
    main_points: string[];
    technologies: string[];
}

interface Education {
    degree: string;
    institution: string;
    year: string;
}

interface Experience {
    years: number;
    level: string;
}

interface Skills {
    [category: string]: string[];
}

interface AnalysisSummary {
    total_projects: number;
    education_entries: number;
    skill_categories: number;
    certifications_count?: number;
    achievements_count?: number;
    candidate_type: string;
}

interface ResumeAnalysisData {
    education: Education[];
    projects: Project[];
    experience: Experience;
    skills: Skills;
    certifications?: Array<string | { name: string; year: string }>;
    achievements?: string[];
    analysis_summary: AnalysisSummary;
}

interface ResumeAnalysisResult {
    success: boolean;
    data: ResumeAnalysisData;
    timestamp: string;
    filename?: string;
    fileSize?: number;
    extractedTextLength?: number;
    error?: string;
}

interface ResumeUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadSuccess: (data: ResumeAnalysisData) => void;
    existingAnalysisData?: ResumeAnalysisData | null;
    interview_id?: string;
    userName?: string;
    userEmail?: string;
}

const ResumeUploadDialog = ({
    open,
    onOpenChange,
    onUploadSuccess,
    existingAnalysisData,
    interview_id,
    userName,
    userEmail
}: ResumeUploadDialogProps) => {
    const [processing, setProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [shouldLoadExisting, setShouldLoadExisting] = useState(true);
    const [loadingExisting, setLoadingExisting] = useState(false);

    useEffect(() => {
        if (open && existingAnalysisData && !analysisResult && shouldLoadExisting) {
            setLoadingExisting(true);
            setProcessingStatus('Loading previous resume analysis...');

            // Simulate a brief loading effect
            setTimeout(() => {
                setAnalysisResult({
                    success: true,
                    data: existingAnalysisData,
                    timestamp: new Date().toISOString(),
                    filename: 'Previously analyzed resume'
                });
                setLoadingExisting(false);
                setProcessingStatus('');
            }, 800);
        }
    }, [open, existingAnalysisData, analysisResult, shouldLoadExisting]);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, Word document, or text file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setProcessing(true);
        setUploadedFile(file);
        setProcessingStatus('Uploading file...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Add the required fields
            if (interview_id) formData.append('interview_id', interview_id);
            if (userName) formData.append('userName', userName);
            if (userEmail) formData.append('userEmail', userEmail);

            setProcessingStatus('Extracting text from document...');

            const response = await fetch('/api/resume-analysis', {
                method: 'POST',
                body: formData,
            });

            const result: ResumeAnalysisResult = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Upload failed with status ${response.status}`);
            }

            if (!result.success) {
                throw new Error(result.error || 'Analysis failed');
            }

            setAnalysisResult(result);
            setProcessingStatus('Analysis complete!');

            // Call the success callback
            if (result.data) {
                onUploadSuccess(result.data);
            }

        } catch (error) {
            console.error('Upload error:', error);
            setAnalysisResult({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process resume. Please try again.',
                data: {} as ResumeAnalysisData,
                timestamp: new Date().toISOString()
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleConfirm = () => {
        if (analysisResult?.success && analysisResult.data) {
            onUploadSuccess(analysisResult.data);
        }
    };

    const resetDialog = () => {
        setAnalysisResult(null);
        setUploadedFile(null);
        setProcessing(false);
        setProcessingStatus('');
        setShouldLoadExisting(false);
    };

    const handleClose = () => {
        if (!existingAnalysisData) {
            resetDialog();
        }
        onOpenChange(false);
    };

    const getCandidateLevelIcon = (level: string) => {
        if (level.includes('Fresher')) return <Star className="w-4 h-4 text-green-600" />;
        if (level.includes('Junior')) return <TrendingUp className="w-4 h-4 text-blue-600" />;
        if (level.includes('Mid-Level')) return <Users className="w-4 h-4 text-purple-600" />;
        if (level.includes('Senior')) return <Target className="w-4 h-4 text-red-600" />;
        return <Briefcase className="w-4 h-4 text-gray-600" />;
    };

    const getCandidateLevelColor = (level: string) => {
        if (level.includes('Fresher')) return 'bg-green-50 text-green-700 border-green-200';
        if (level.includes('Junior')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (level.includes('Mid-Level')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (level.includes('Senior')) return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Resume Analysis System
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {analysisResult?.success
                            ? "Review your resume analysis results below"
                            : "Upload your resume for AI-powered analysis"}
                    </p>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loadingExisting ? (
                        /* Loading Existing Resume */
                        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
                            <p className="text-xl font-semibold text-blue-900 mb-2">{processingStatus}</p>
                            <p className="text-sm text-blue-600">Please wait while we retrieve your data...</p>
                        </div>
                    ) : processing ? (
                        /* Processing New Upload */
                        <div className="space-y-6">
                            {/* File Info */}
                            {uploadedFile && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium">{uploadedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                </div>
                            )}

                            {/* Processing Animation */}
                            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                                <div className="relative inline-block mb-6">
                                    <Loader2 className="w-20 h-20 animate-spin text-purple-600" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText className="w-10 h-10 text-purple-400 animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-purple-900 mb-2">{processingStatus}</p>
                                <p className="text-sm text-purple-600">This may take a few moments...</p>

                                {/* Progress Steps */}
                                <div className="mt-8 max-w-md mx-auto space-y-3">
                                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${processingStatus.includes('Uploading') ? 'bg-purple-100 border border-purple-300' : 'bg-white border border-gray-200'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStatus.includes('Uploading') ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                            {processingStatus.includes('Extracting') || processingStatus.includes('complete') ? (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            ) : (
                                                <span className="text-white text-xs font-bold">1</span>
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${processingStatus.includes('Uploading') ? 'text-purple-900' : 'text-gray-600'}`}>
                                            Uploading file
                                        </span>
                                    </div>

                                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${processingStatus.includes('Extracting') ? 'bg-purple-100 border border-purple-300' : 'bg-white border border-gray-200'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStatus.includes('Extracting') ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                            {processingStatus.includes('complete') ? (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            ) : (
                                                <span className="text-white text-xs font-bold">2</span>
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${processingStatus.includes('Extracting') ? 'text-purple-900' : 'text-gray-600'}`}>
                                            Extracting and analyzing content
                                        </span>
                                    </div>

                                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${processingStatus.includes('complete') ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStatus.includes('complete') ? 'bg-green-600' : 'bg-gray-300'}`}>
                                            {processingStatus.includes('complete') ? (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            ) : (
                                                <span className="text-white text-xs font-bold">3</span>
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${processingStatus.includes('complete') ? 'text-green-900' : 'text-gray-600'}`}>
                                            Generating insights
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !analysisResult?.success ? (
                        /* Upload Area */
                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center space-y-4">
                                <Upload className="w-16 h-16 text-blue-500" />
                                <h3 className="text-xl font-semibold">Drop your resume here</h3>
                                <p className="text-gray-500">PDF, DOC, DOCX, or TXT • Max 10MB</p>
                                <button
                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                                >
                                    Choose File
                                </button>
                                <input
                                    id="resume-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileInput}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Results Display */
                        <div className="space-y-6">
                            {/* File Info */}
                            {uploadedFile && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium">{uploadedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    {processing && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                                    {!processing && <CheckCircle className="w-5 h-5 text-green-600" />}
                                </div>
                            )}

                            {/* Processing Status */}
                            {processing && (
                                <div className="text-center py-8 bg-blue-50 rounded-lg">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-lg font-medium">{processingStatus}</p>
                                </div>
                            )}

                            {/* Success Header */}
                            {!processing && analysisResult?.success && (
                                <>
                                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <div>
                                            <span className="font-semibold text-green-900">Analysis Complete!</span>
                                            <p className="text-sm text-green-700">
                                                Found {analysisResult.data.analysis_summary.education_entries} education, {analysisResult.data.analysis_summary.total_projects} projects, {analysisResult.data.analysis_summary.skill_categories} skill categories
                                            </p>
                                        </div>
                                    </div>

                                    {/* Experience Level */}
                                    <div className={`p-4 rounded-lg border-2 ${getCandidateLevelColor(analysisResult.data.experience.level)}`}>
                                        <div className="flex items-center gap-2">
                                            {getCandidateLevelIcon(analysisResult.data.experience.level)}
                                            <div>
                                                <span className="font-semibold block">Candidate Level</span>
                                                <p className="text-sm">{analysisResult.data.experience.level}</p>
                                                <p className="text-xs opacity-75">{analysisResult.data.experience.years} years experience</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
                                            <GraduationCap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-700">{analysisResult.data.analysis_summary.education_entries}</p>
                                            <p className="text-sm text-green-600">Education</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
                                            <Code className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-purple-700">{analysisResult.data.analysis_summary.total_projects}</p>
                                            <p className="text-sm text-purple-600">Projects/Experience</p>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-lg text-center border border-orange-200">
                                            <Settings className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-orange-700">{analysisResult.data.analysis_summary.skill_categories}</p>
                                            <p className="text-sm text-orange-600">Skill Categories</p>
                                        </div>
                                        <div className="p-4 bg-yellow-50 rounded-lg text-center border border-yellow-200">
                                            <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-yellow-700">{analysisResult.data.analysis_summary.certifications_count || 0}</p>
                                            <p className="text-sm text-yellow-600">Certifications</p>
                                        </div>
                                    </div>

                                    {/* Education Section */}
                                    {analysisResult.data.education.length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                                Education ({analysisResult.data.education.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {analysisResult.data.education.map((edu, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-indigo-700 font-bold text-sm">{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                                {edu.institution && (
                                                                    <p className="text-sm text-indigo-600 mt-1">{edu.institution}</p>
                                                                )}
                                                                {edu.year && (
                                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {edu.year}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects Section */}
                                    {analysisResult.data.projects.length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                                <Code className="w-5 h-5 text-purple-600" />
                                                Projects ({analysisResult.data.projects.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {analysisResult.data.projects.map((project, index) => (
                                                    <div key={index} className="bg-white p-5 rounded-lg border border-purple-200 shadow-sm">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-purple-700 font-bold text-sm">{index + 1}</span>
                                                            </div>
                                                            <h4 className="font-semibold text-gray-900 flex-1">{project.name}</h4>
                                                        </div>

                                                        {project.main_points.length > 0 && (
                                                            <div className="mb-3 ml-11">
                                                                <p className="text-xs font-medium text-gray-600 mb-2">Key Features:</p>
                                                                <ul className="space-y-1">
                                                                    {project.main_points.slice(0, 3).map((point, pointIndex) => (
                                                                        <li key={pointIndex} className="flex items-start gap-2">
                                                                            <span className="text-purple-600 mt-1">•</span>
                                                                            <span className="text-sm text-gray-700">{point}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {project.technologies.length > 0 && (
                                                            <div className="ml-11">
                                                                <p className="text-xs font-medium text-gray-600 mb-2">Technologies:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {project.technologies.map((tech, techIndex) => (
                                                                        <span
                                                                            key={techIndex}
                                                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                                                                        >
                                                                            {tech}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills Section */}
                                    {Object.keys(analysisResult.data.skills).length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                                <Target className="w-5 h-5 text-green-600" />
                                                Technical Skills
                                            </h3>
                                            <div className="space-y-4">
                                                {Object.entries(analysisResult.data.skills).map(([category, skills]) => (
                                                    <div key={category} className="bg-white p-4 rounded-lg border border-green-200">
                                                        <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skills.map((skill, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certifications */}
                                    {analysisResult.data.certifications && analysisResult.data.certifications.length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                                <Award className="w-5 h-5 text-yellow-600" />
                                                Certifications ({analysisResult.data.certifications.length})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {analysisResult.data.certifications.map((cert, index) => {
                                                    const certName = typeof cert === 'string' ? cert : cert.name;
                                                    const certYear = typeof cert === 'string' ? '' : cert.year;
                                                    return (
                                                        <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
                                                            <div className="flex items-start gap-3">
                                                                <Award className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 text-sm">{certName}</h4>
                                                                    {certYear && <p className="text-xs text-yellow-600 mt-1">{certYear}</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Achievements */}
                                    {analysisResult.data.achievements && analysisResult.data.achievements.length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                                <Star className="w-5 h-5 text-red-600" />
                                                Achievements ({analysisResult.data.achievements.length})
                                            </h3>
                                            <ul className="space-y-3">
                                                {analysisResult.data.achievements.map((achievement, index) => (
                                                    <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-red-200">
                                                        <Star className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                                        <span className="text-sm text-gray-700">{achievement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Error State */}
                            {analysisResult && !analysisResult.success && (
                                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-red-900">Analysis Failed</p>
                                    <p className="text-sm text-red-700 mt-2">{analysisResult.error}</p>
                                    <button
                                        onClick={resetDialog}
                                                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {analysisResult?.success && !processing && (
                    <div className="p-6 border-t bg-gray-50 flex gap-3">
                        <button
                            onClick={resetDialog}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium cursor-pointer"
                        >
                            Upload Different Resume
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium shadow-lg cursor-pointer"
                        >
                            Continue with Analysis
                        </button>
                    </div>
                )}

                {!analysisResult && (
                    <div className="p-6 border-t bg-gray-50 flex justify-end">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadDialog;