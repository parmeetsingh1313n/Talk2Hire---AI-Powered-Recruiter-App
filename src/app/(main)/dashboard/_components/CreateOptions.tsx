import { Button } from "@/components/ui/button";
import { BarChart3, ChevronRight, Play, Plus, Star, Target, Video } from "lucide-react"
import Link from "next/link";

function CreateOptions() {
    const options = [
        {
            icon: Video,
            title: "AI Video Interview",
            description: "Create intelligent video interviews with real-time AI analysis and candidate scoring",
            features: ["Real-time Analysis", "Auto Scoring", "Custom Questions"],
            color: "from-cyan-400 to-blue-600",
            popular: true
        }
    ];

    return (
        <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4 sm:gap-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Create New Experience</h2>
                    <p className="text-sm md:text-base text-slate-600">
                        Conduct seamless, AI-powered interviews to engage candidates effectively.
                    </p>

                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 w-full">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-cyan-500/15 transition-all duration-500 hover:-translate-y-2 w-full lg:w-auto"
                    >
                        {option.popular && (
                            <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
                                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    <Star className="w-3 h-3" />
                                    Popular
                                </div>
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br ${option.color} shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300`}>
                                    <option.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-300" />
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-3">{option.title}</h3>
                            <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 leading-relaxed">{option.description}</p>

                            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                                {option.features.map((feature, fIndex) => (
                                    <div key={fIndex} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs md:text-sm text-slate-600 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href={"/dashboard/create-interview"}>
                            <Button className={`w-full py-3 px-4 bg-gradient-to-r ${option.color} text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105 text-sm md:text-base cursor-pointer`}>
                                <Play className="w-4 h-4" />
                                Create Interview
                                </Button>
                            </Link>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                ))}

                <div className="flex-1 lg:ml-8 w-full">
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 p-4 md:p-6 h-full min-h-[300px] lg:min-h-[500px]">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3 sm:gap-0">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Analytics Overview</h3>
                                <p className="text-slate-600 text-xs md:text-sm">Real-time insights and performance metrics</p>
                            </div>
                            <div className="flex items-center gap-2 justify-start sm:justify-end">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                                </button>
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Target className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="h-40 md:h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50 mb-4 md:mb-6">
                            <div className="text-center px-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                    <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <h4 className="text-base md:text-lg font-semibold text-slate-700 mb-2">Chart Area</h4>
                                <p className="text-slate-500 text-xs md:text-sm">Your analytics and graphs will appear here</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                            <div className="text-center p-3 md:p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/30">
                                <div className="text-xl md:text-2xl font-bold text-slate-800">24</div>
                                <div className="text-xs md:text-sm text-slate-600">Interviews</div>
                            </div>
                            <div className="text-center p-3 md:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/30">
                                <div className="text-xl md:text-2xl font-bold text-slate-800">89%</div>
                                <div className="text-xs md:text-sm text-slate-600">Success Rate</div>
                            </div>
                            <div className="text-center p-3 md:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200/30">
                                <div className="text-xl md:text-2xl font-bold text-slate-800">4.8</div>
                                <div className="text-xs md:text-sm text-slate-600">Avg Score</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateOptions