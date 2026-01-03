"use client"
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
import { ArrowRight, Briefcase, Calendar, Clock, FileText, Headphones, Sparkles, Video, Zap } from "lucide-react"
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
        schedule_date?: string;
        schedule_time?: string;
        validity?: number;
        [key: string]: any;
    };
}

function Form({ onHandleInputChange, GoToNext, formData }: FormProps) {
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [jobPosition, setJobPosition] = useState(formData?.jobPosition || "");
    const [jobDescription, setJobDescription] = useState(formData?.jobDescription || "");
    const [duration, setDuration] = useState(formData?.duration || "");
    const [isInitialized, setIsInitialized] = useState(false);
    const [scheduleDate, setScheduleDate] = useState<string>(formData?.schedule_date || "");
    const [scheduleTime, setScheduleTime] = useState<string>(formData?.schedule_time || "09:00");
    const [validity, setValidity] = useState<number>(formData?.validity || 1440);

    // Initialize form with saved data only once
    useEffect(() => {
        if (!isInitialized) {
            if (formData?.type && Array.isArray(formData.type)) {
                const typeIndices = formData.type.map(type =>
                    InterviewType.findIndex(item => item.title === type)
                ).filter(index => index !== -1);
                setSelectedTypes(typeIndices);
            }

            // Set default schedule if not set
            if (!formData?.schedule_date) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(9, 0, 0, 0);
                const formattedDate = tomorrow.toISOString().split('T')[0];
                setScheduleDate(formattedDate);
                onHandleInputChange('schedule_date', formattedDate);
                onHandleInputChange('schedule_time', "09:00");
            }

            // Preserve service_type if it exists
            if (formData?.service_type) {
                // Keep service_type in formData
            }

            setIsInitialized(true);
        }
    }, [formData, isInitialized, onHandleInputChange]);

    // Handle type changes
    const handleTypeChange = useCallback((newSelectedTypes: number[]) => {
        setSelectedTypes(newSelectedTypes);
        onHandleInputChange('type', newSelectedTypes.map(i => InterviewType[i].title));
    }, [onHandleInputChange]);

    const toggleType = useCallback((index: number) => {
        const newSelectedTypes = selectedTypes.includes(index)
            ? selectedTypes.filter(i => i !== index)
            : [...selectedTypes, index];
        handleTypeChange(newSelectedTypes);
    }, [selectedTypes, handleTypeChange]);

    const handleJobPositionChange = useCallback((value: string) => {
        setJobPosition(value);
        onHandleInputChange('jobPosition', value);
    }, [onHandleInputChange]);

    const handleJobDescriptionChange = useCallback((value: string) => {
        setJobDescription(value);
        onHandleInputChange('jobDescription', value);
    }, [onHandleInputChange]);

    const handleDurationChange = useCallback((value: string) => {
        setDuration(value);
        onHandleInputChange('duration', value);
    }, [onHandleInputChange]);

    const handleScheduleDateChange = useCallback((value: string) => {
        setScheduleDate(value);
        onHandleInputChange('schedule_date', value);
    }, [onHandleInputChange]);

    const handleScheduleTimeChange = useCallback((value: string) => {
        setScheduleTime(value);
        onHandleInputChange('schedule_time', value);
    }, [onHandleInputChange]);

    const handleValidityChange = useCallback((value: number) => {
        setValidity(value);
        onHandleInputChange('validity', value);
    }, [onHandleInputChange]);

    const getMinDate = useCallback(() => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }, []);

    const getMaxDate = useCallback(() => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 6);
        return maxDate.toISOString().split('T')[0];
    }, []);

    const getMinTime = useCallback(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        if (scheduleDate === today) {
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            return `${currentHour}:${currentMinute}`;
        }
        return "00:00";
    }, [scheduleDate]);

    const formatValidityLabel = useCallback((minutes: number) => {
        if (minutes < 60) return `${minutes} minutes`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
        return `${Math.floor(minutes / 1440)} days`;
    }, []);

    const getFullDateTime = useCallback(() => {
        if (!scheduleDate) return null;
        const date = new Date(scheduleDate);
        const [hours, minutes] = (scheduleTime || "09:00").split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
        return date;
    }, [scheduleDate, scheduleTime]);

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/20 rounded-3xl border-2 border-cyan-200/40 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm">
            {/* Magical background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-cyan-400/8 to-blue-500/8 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-sky-400/6 to-cyan-500/6 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-8 w-24 h-24 bg-gradient-to-br from-blue-400/6 to-sky-500/6 rounded-full animate-pulse delay-500"></div>
            </div>
            {/* Service Type Indicator */}
            {formData?.service_type && (
                <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200/60">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${formData.service_type === 'video'
                            ? 'bg-gradient-to-r from-purple-400 to-pink-600'
                            : 'bg-gradient-to-r from-cyan-400 to-blue-600'}`}>
                            {formData.service_type === 'video' ? (
                                <Video className="w-5 h-5 text-white" />
                            ) : (
                                <Headphones className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">
                                {formData.service_type === 'video' ? 'AI Video Interview' : 'Audio Interview'}
                            </p>
                            <p className="text-sm text-slate-600">
                                {formData.service_type === 'video'
                                    ? 'Video interviews with AI avatars and real-time analysis'
                                    : 'Voice-only interviews with AI-powered analysis'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

                {/* Schedule Section */}
                <div className="group space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                            Interview Schedule (Optional)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Schedule Date */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700">
                                Start Date
                            </label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => handleScheduleDateChange(e.target.value)}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    className="border-2 border-cyan-200/60 bg-white/70 backdrop-blur-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:border-cyan-300 transition-all duration-300 text-slate-700 shadow-sm h-12 rounded-xl pl-4"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Schedule Time */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700">
                                Start Time
                            </label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => handleScheduleTimeChange(e.target.value)}
                                    min={getMinTime()}
                                    step="300"
                                    className="border-2 border-cyan-200/60 bg-white/70 backdrop-blur-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:border-cyan-300 transition-all duration-300 text-slate-700 shadow-sm h-12 rounded-xl pl-4"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Validity Period */}
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">
                                Validity Period
                            </label>
                            <Select value={validity.toString()} onValueChange={(value) => handleValidityChange(parseInt(value))}>
                                <SelectTrigger className="w-full h-12 border-2 border-cyan-200/60 bg-white/70 backdrop-blur-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:border-cyan-300 transition-all duration-300 text-slate-700 shadow-sm rounded-xl">
                                    <SelectValue placeholder="Select validity period">
                                        {formatValidityLabel(validity)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="border-2 border-cyan-200/60 bg-white/95 backdrop-blur-sm shadow-xl shadow-cyan-500/10 rounded-xl">
                                    <SelectItem value="30" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">30 minutes</SelectItem>
                                    <SelectItem value="60" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">1 hour</SelectItem>
                                    <SelectItem value="120" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">2 hours</SelectItem>
                                    <SelectItem value="360" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">6 hours</SelectItem>
                                    <SelectItem value="720" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">12 hours</SelectItem>
                                    <SelectItem value="1440" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">24 hours</SelectItem>
                                    <SelectItem value="2880" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">48 hours</SelectItem>
                                    <SelectItem value="10080" className="hover:bg-cyan-50 focus:bg-cyan-50 rounded-lg">7 days</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                How long the interview link will be valid after start time
                            </p>
                        </div>
                    </div>

                    {/* Schedule Info Box */}
                    {scheduleDate && scheduleTime && (
                        <div className="p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-xl border border-green-200/50">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-3 h-3 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-800 mb-1">
                                        Interview Schedule Active
                                    </p>
                                    <p className="text-xs text-green-700">
                                        Candidates can access this interview from <span className="font-semibold">
                                            {getFullDateTime()?.toLocaleString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {" "}for <span className="font-semibold">{formatValidityLabel(validity)}</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <Button
                        className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-500 hover:from-cyan-600 hover:via-blue-700 hover:to-sky-600 text-white rounded-2xl font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 text-base cursor-pointer"
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