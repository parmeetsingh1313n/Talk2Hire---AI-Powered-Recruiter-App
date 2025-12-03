import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Briefcase, Clock, FileText, Sparkles, Zap } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { InterviewType } from "../../../../../../services/Constants"

interface FormProps {
    onHandleInputChange: (field: string, value: any) => void;
    GoToNext: () => void;
    formData: {
        jobPosition?: string;
        jobDescription?: string;
        duration?: string;
        type?: string;
        [key: string]: any;
    };
}

interface InterviewTypeItem {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}

function Form({ onHandleInputChange, GoToNext, formData }: FormProps) {
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [jobPosition, setJobPosition] = useState(formData?.jobPosition || "");
    const [jobDescription, setJobDescription] = useState(formData?.jobDescription || "");
    const [duration, setDuration] = useState(formData?.duration || "");
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize form with saved data only once
    useEffect(() => {
        if (!isInitialized && formData?.type && Array.isArray(formData.type)) {
            const typeIndices = formData.type.map(type =>
                InterviewType.findIndex(item => item.title === type)
            ).filter(index => index !== -1);
            setSelectedTypes(typeIndices);
            setIsInitialized(true);
        } else if (!isInitialized) {
            setIsInitialized(true);
        }
    }, [formData, isInitialized]);

    // Handle type changes with useCallback to prevent re-renders
    const handleTypeChange = useCallback((newSelectedTypes: number[]) => {
        setSelectedTypes(newSelectedTypes);
        onHandleInputChange('type', newSelectedTypes.map(i => InterviewType[i].title));
    }, [onHandleInputChange]);

    const toggleType = (index: number) => {
        const newSelectedTypes = selectedTypes.includes(index)
            ? selectedTypes.filter(i => i !== index)
            : [...selectedTypes, index];
        handleTypeChange(newSelectedTypes);
    };

    const handleJobPositionChange = (value: string) => {
        setJobPosition(value);
        onHandleInputChange('jobPosition', value);
    };

    const handleJobDescriptionChange = (value: string) => {
        setJobDescription(value);
        onHandleInputChange('jobDescription', value);
    };

    const handleDurationChange = (value: string) => {
        setDuration(value);
        onHandleInputChange('duration', value);
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/20 rounded-3xl border-2 border-cyan-200/40 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm">
            {/* Magical background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-cyan-400/8 to-blue-500/8 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-sky-400/6 to-cyan-500/6 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-8 w-24 h-24 bg-gradient-to-br from-blue-400/6 to-sky-500/6 rounded-full animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 p-8 md:p-10 space-y-8">
                {/* Job Position */}
                <div className="group space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                            Job Position
                        </h2>
                    </div>
                    <Input
                        value={jobPosition}
                        placeholder="e.g. Senior Full Stack Developer"
                        className="border-2 border-cyan-200/60 bg-white/70 backdrop-blur-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:border-cyan-300 transition-all duration-300 text-slate-700 placeholder-slate-400 shadow-sm h-12 rounded-xl"
                        onChange={(e) => handleJobPositionChange(e.target.value)}
                    />
                </div>

                {/* Job Description */}
                <div className="group space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-sky-600 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-700 bg-clip-text text-transparent">
                            Job Description
                        </h2>
                    </div>
                    <Textarea
                        value={jobDescription}
                        placeholder="Describe the role, responsibilities, and requirements in detail..."
                        className="border-2 border-cyan-200/60 bg-white/70 backdrop-blur-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:border-cyan-300 transition-all duration-300 text-slate-700 placeholder-slate-400 shadow-sm h-32 rounded-xl resize-none leading-relaxed"
                        onChange={(e) => handleJobDescriptionChange(e.target.value)}
                    />
                </div>

                {/* Interview Duration */}
                <div className="group space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 shadow-lg shadow-sky-500/25 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-700 bg-clip-text text-transparent">
                            Interview Duration
                        </h2>
                    </div>
                    <Select value={duration} onValueChange={handleDurationChange}>
                        <SelectTrigger className="w-full h-12 border-2 border-cyan-200/60 bg-white/70 backdrop-blur-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:border-cyan-300 transition-all duration-300 text-slate-700 shadow-sm rounded-xl">
                            <SelectValue placeholder="Choose interview duration" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-cyan-200/60 bg-white/95 backdrop-blur-sm shadow-xl shadow-cyan-500/10 rounded-xl">
                            <SelectItem value="5 Min" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">5 Minutes - Quick Screen</SelectItem>
                            <SelectItem value="15 Min" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">15 Minutes - Brief Assessment</SelectItem>
                            <SelectItem value="30 Min" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">30 Minutes - Standard Interview</SelectItem>
                            <SelectItem value="45 Min" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">45 Minutes - Comprehensive</SelectItem>
                            <SelectItem value="60 Min" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">60 Minutes - Deep Dive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Interview Type */}
                <div className="group space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                            Interview Focus Areas
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {InterviewType.map((type, index) => (
                            <div
                                key={index}
                                onClick={() => toggleType(index)}
                                className={`group/item relative overflow-hidden cursor-pointer rounded-2xl border-2 p-6 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 ${selectedTypes.includes(index)
                                    ?
                                    'border-cyan-500 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 shadow-xl shadow-cyan-500/20'
                                    :
                                    'border-cyan-200/60 bg-white/50 hover:border-cyan-400 hover:bg-cyan-50/50 shadow-lg shadow-slate-200/50'
                                    }`}
                            >
                                {/* Selection indicator */}
                                {selectedTypes.includes(index) && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={`p-3 rounded-2xl transition-all duration-300 ${selectedTypes.includes(index)
                                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/25 scale-110'
                                        : 'bg-slate-100 group-hover/item:bg-gradient-to-br group-hover/item:from-cyan-100 group-hover/item:to-blue-100'
                                        }`}>
                                        <type.icon className={`w-6 h-6 transition-colors duration-300 ${selectedTypes.includes(index) ? 'text-white' : 'text-slate-600 group-hover/item:text-cyan-600'
                                            }`} />
                                    </div>

                                    <span className={`font-semibold transition-colors duration-300 ${selectedTypes.includes(index)
                                        ? 'text-cyan-700'
                                        : 'text-slate-700 group-hover/item:text-cyan-600'
                                        }`}>
                                        {type.title}
                                    </span>
                                </div>

                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <Button className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-500 hover:from-cyan-600 hover:via-blue-700 hover:to-sky-600 text-white rounded-2xl font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 text-base cursor-pointer"
                        onClick={() => GoToNext()}>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse cursor-pointer"></div>

                        <Sparkles className="w-5 h-5 relative z-10" />
                        <span className="relative z-10 mx-2">Generate AI Questions</span>
                        <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Form