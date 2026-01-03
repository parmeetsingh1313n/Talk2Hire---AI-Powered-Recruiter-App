import { Button } from "@/components/ui/button";
import { BarChart3, ChevronRight, Play, Mic, Video, Phone, Star, Target, Headphones, Zap } from "lucide-react"
import Link from "next/link";

function CreateOptions() {
    const options = [
        {
            icon: Video,
            title: "AI Video Interview",
            description: "Conduct video interviews with AI avatars that analyze responses in real-time",
            features: ["AI Avatar Interviewer", "Real-time Analysis", "Video Recording", "Premium Features"],
            color: "from-purple-400 to-pink-600",
            premium: true,
            popular: false,
            link: "/dashboard/create-interview?type=video",
            badge: "Premium"
        },
        {
            icon: Headphones,
            title: "Audio Interview",
            description: "Voice-only interviews with AI-powered analysis and candidate evaluation",
            features: ["Voice Analysis", "Auto Scoring", "Custom Questions", "Fast Setup"],
            color: "from-cyan-400 to-blue-600",
            premium: false,
            popular: true,
            link: "/dashboard/create-interview?type=audio",
            badge: "Popular"
        }
    ];

    return (
        <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4 sm:gap-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Create New Interview</h2>
                    <p className="text-sm md:text-base text-slate-600">
                        Choose your interview format - AI-powered video with avatar or voice-only audio interviews
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                        <span className="text-xs text-slate-600">Video (Premium)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                        <span className="text-xs text-slate-600">Audio (Popular)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 w-full"
                    >
                        {/* Badge */}
                        {(option.premium || option.popular) && (
                            <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
                                <div className={`flex items-center gap-1 ${option.premium
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'} 
                                    px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                    {option.premium && <Zap className="w-3 h-3" />}
                                    {option.popular && <Star className="w-3 h-3" />}
                                    {option.badge}
                                </div>
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br ${option.color} shadow-lg ${option.premium ? 'shadow-purple-500/25' : 'shadow-blue-500/25'} group-hover:scale-110 transition-transform duration-300`}>
                                    <option.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-300" />
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-3">{option.title}</h3>
                            <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 leading-relaxed">{option.description}</p>

                            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                                {option.features.map((feature, fIndex) => (
                                    <div key={fIndex} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 bg-gradient-to-r ${option.color} rounded-full flex-shrink-0`}></div>
                                        <span className="text-xs md:text-sm text-slate-600 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href={option.link}>
                                <Button className={`w-full py-3 px-4 bg-gradient-to-r ${option.color} text-white rounded-xl font-semibold shadow-lg ${option.premium ? 'shadow-purple-500/20 hover:shadow-purple-500/30' : 'shadow-blue-500/20 hover:shadow-blue-500/30'} transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105 text-sm md:text-base cursor-pointer`}>
                                    <Play className="w-4 h-4" />
                                    Create {option.title.split(' ')[0]} Interview
                                </Button>
                            </Link>
                        </div>

                        {/* Background decoration */}
                        <div className={`absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${option.color.replace('from-', 'from-').replace('to-', 'to-')}/10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                    </div>
                ))}
            </div>

            {/* Comparison Table */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Feature Comparison</h3>
                    <p className="text-sm text-slate-600">Compare features between interview formats</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800">Features</h4>
                            <ul className="space-y-3">
                                <li className="text-sm text-slate-600">Real-time AI Analysis</li>
                                <li className="text-sm text-slate-600">Custom Questions</li>
                                <li className="text-sm text-slate-600">Auto Scoring</li>
                                <li className="text-sm text-slate-600">Recording</li>
                                <li className="text-sm text-slate-600">Candidate Evaluation</li>
                                <li className="text-sm text-slate-600">Detailed Reports</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Video className="w-4 h-4 text-purple-600" />
                                Video Interview
                            </h4>
                            <ul className="space-y-3">
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                                    <span>✓ Included</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                                    <span>✓ Included</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                                    <span>✓ Included</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                                    <span>Video + Audio</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                                    <span>Advanced AI</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                                    <span>Comprehensive</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-blue-600" />
                                Audio Interview
                            </h4>
                            <ul className="space-y-3">
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                                    <span>✓ Included</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                                    <span>✓ Included</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                                    <span>✓ Included</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                                    <span>Audio Only</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                                    <span>Basic AI</span>
                                </li>
                                <li className="text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>
                                    <span>Standard</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateOptions