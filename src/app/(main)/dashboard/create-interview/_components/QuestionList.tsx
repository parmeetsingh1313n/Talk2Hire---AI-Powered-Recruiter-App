import { useUser } from "@/app/provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Edit, Loader2Icon, Plus, RefreshCcw, Save, Sparkles, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../../../../../../services/supabaseClient";

type Question = {
    question: string;
    type: string;
    id?: string;
};

type QuestionListProps = {
    formData: {
        jobPosition?: string;
        jobDescription?: string;
        duration?: string;
        type?: string;
    };
    onGoToForm: () => void;
    onQuestionsGenerated: () => void;
    onInterviewFinished: (interview_id: string) => void;
};


const QuestionList = ({ formData, onGoToForm, onQuestionsGenerated, onInterviewFinished }: QuestionListProps) => {
    const [loading, setLoading] = useState(false);
    const [questionList, setQuestionList] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ question: "", type: "Technical" });

    const { user } = useUser() as {
        user: {
            name?: string,
            email?: string,
            picture?: string
        }
    };

    useEffect(() => {
        // Load questions from localStorage first
        const savedQuestions = localStorage.getItem('interview_questions');
        if (savedQuestions) {
            const parsedQuestions = JSON.parse(savedQuestions);
            setQuestionList(parsedQuestions);
            onQuestionsGenerated();
            // Clear any existing error when questions are loaded
            setError(null);
        } else if (formData) {
            GenerateQuestionList();
        }
    }, [formData]);

    const GenerateQuestionList = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await axios.post('/api/ai-model', {
                ...formData
            });

            console.log('API Response:', result.data);

            if (result.data.error) {
                setError(result.data.error);
                console.error('API Error:', result.data);
                return;
            }

            let questions: Question[] = [];
            if (result.data.questions && Array.isArray(result.data.questions)) {
                questions = result.data.questions.map((q: Question) => ({
                    ...q,
                    id: uuidv4()
                }));
            } else {
                try {
                    const parsed = JSON.parse(result.data.content || '[]');
                    questions = Array.isArray(parsed) ? parsed.map((q: Question) => ({
                        ...q,
                        id: uuidv4()
                    })) : [];
                } catch (parseError) {
                    console.error('Failed to parse questions:', parseError);
                    setError('Failed to parse the generated questions');
                }
            }

            if (questions.length > 0) {
                setQuestionList(questions);
                // Save to localStorage
                localStorage.setItem('interview_questions', JSON.stringify(questions));
                onQuestionsGenerated();
                // Clear error when questions are successfully generated
                setError(null);
            } else {
                setError('No questions were generated. Please try again.');
            }
        }
        catch (error) {
            console.error('Error fetching AI response:', error);
            setError('Failed to generate questions. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }

    const handleDeleteQuestion = (id: string) => {
        const updatedQuestions = questionList.filter(q => q.id !== id);
        setQuestionList(updatedQuestions);
        localStorage.setItem('interview_questions', JSON.stringify(updatedQuestions));
        toast.success("Question deleted successfully!");
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
    };

    const handleSaveEdit = (updatedQuestion: Question) => {
        const updatedQuestions = questionList.map(q =>
            q.id === updatedQuestion.id ? updatedQuestion : q
        );
        setQuestionList(updatedQuestions);
        localStorage.setItem('interview_questions', JSON.stringify(updatedQuestions));
        setEditingQuestion(null);
        toast.success("Question updated successfully!");
    };

    const handleAddNewQuestion = () => {
        const newQ: Question = {
            ...newQuestion,
            id: uuidv4()
        };
        const updatedQuestions = [...questionList, newQ];
        setQuestionList(updatedQuestions);
        localStorage.setItem('interview_questions', JSON.stringify(updatedQuestions));
        setNewQuestion({ question: "", type: "Technical" });
        setIsAddingNew(false);
        toast.success("New question added successfully!");
    };

    const onFinish = async () => {
        setSaveLoading(true);
        try {
            const interview_id = uuidv4();

            const { data, error } = await supabase
                .from('Interviews')
                .insert([
                    {
                        ...formData,
                        questionList: questionList,
                        userEmail: user?.email,
                        interview_id: interview_id
                    },
                ])
                .select();

            if (error) {
                console.error('Database error:', error);
                toast.error("Failed to save interview. Please try again.");
            }
            else {
                console.log(data);
                toast.success("Interview Link created successfully!");
                onInterviewFinished(interview_id);
            }
        } catch (error) {
            console.error('Error saving interview:', error);
            toast.error("Failed to save interview. Please try again.");
        } finally {
            setSaveLoading(false);
        }
        
    }

    const questionTypes = ["Technical", "Behavioral", "Situational", "General", "Problem-solving"];

    return (
        <div className="space-y-6">
            {loading && (
                <div className="p-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 border-2 border-blue-200/60 rounded-2xl flex items-center gap-5 shadow-lg">
                    <Loader2Icon className="animate-spin w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-xl font-bold text-blue-800 mb-1">Generating Interview Questions ✨</h2>
                        <p className="text-blue-600">Our AI is crafting personalized questions based on your Job Position</p>
                    </div>
                </div>
            )}

            {error && questionList.length === 0 && (
                <div className="p-6 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <X className="w-6 h-6 text-red-600" />
                        <p className="text-red-800 font-bold text-lg">Error:</p>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button
                        onClick={GenerateQuestionList}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            )}

            {!loading && questionList.length > 0 && (
                <div className="space-y-6">
                    {/* Header with actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-white via-cyan-50/30 to-blue-50/30 rounded-2xl border-2 border-cyan-200/40 shadow-lg">
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                Generated Interview Questions ⚡
                            </h3>
                            <p className="text-slate-600">Review, edit, or add more questions to customize your interview</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => setIsAddingNew(true)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-lg  cursor-pointer"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question
                            </Button>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                        {questionList.map((q, index) => (
                            <div key={q.id} className="group relative p-6 border-2 border-cyan-200/40 rounded-2xl bg-gradient-to-r from-white via-cyan-50/20 to-blue-50/20 hover:border-cyan-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full border border-blue-200">
                                            {q.type}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            onClick={() => handleEditQuestion(q)}
                                            size="sm"
                                            variant="outline"
                                            className="border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-700 rounded-lg cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 rounded-lg cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-2 border-red-200 rounded-2xl">
                                                <DialogHeader>
                                                    <DialogTitle className="text-red-800">Delete Question?</DialogTitle>
                                                    <DialogDescription className="text-red-600">
                                                        This action cannot be undone. Are you sure you want to permanently delete this question?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button
                                                        onClick={() => handleDeleteQuestion(q.id!)}
                                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                                <p className="text-slate-800 leading-relaxed text-lg font-medium">{q.question}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Question Dialog */}
            {editingQuestion && (
                <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
                    <DialogContent className="border-2 border-cyan-200 rounded-2xl max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-cyan-800 text-xl">Edit Question</DialogTitle>
                            <DialogDescription className="text-cyan-600">
                                Modify the question content and type as needed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Question Type</label>
                                <Select
                                    value={editingQuestion.type}
                                    onValueChange={(value) => setEditingQuestion({ ...editingQuestion, type: value })}
                                >
                                    <SelectTrigger className="border-2 border-cyan-200 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Question</label>
                                <Textarea
                                    value={editingQuestion.question}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                                    className="border-2 border-cyan-200 rounded-xl min-h-[100px]"
                                    placeholder="Enter the question..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => handleSaveEdit(editingQuestion)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl"
                                disabled={!editingQuestion.question.trim()}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add New Question Dialog */}
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                <DialogContent className="border-2 border-cyan-200 rounded-2xl max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-cyan-800 text-xl">Add New Question</DialogTitle>
                        <DialogDescription className="text-cyan-600">
                            Create a custom question for your interview.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Question Type</label>
                            <Select
                                value={newQuestion.type}
                                onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
                            >
                                <SelectTrigger className="border-2 border-cyan-200 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {questionTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Question</label>
                            <Textarea
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                className="border-2 border-cyan-200 rounded-xl min-h-[100px]"
                                placeholder="Enter your custom question..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleAddNewQuestion}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl cursor-pointer"
                            disabled={!newQuestion.question.trim()}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Gorgeous Finish Button with AlertDialog */}
            {!loading && questionList.length > 0 && (
                <div className="flex justify-end pt-8">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="group relative overflow-hidden px-12 py-6 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-600 text-white rounded-3xl font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-3xl hover:shadow-emerald-500/40 transition-all duration-700 transform hover:scale-110 hover:-translate-y-2 text-lg cursor-pointer border-2 border-white/20 "
                                disabled={saveLoading || questionList.length === 0}
                            >
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:animate-pulse"></div>

                                {/* Floating particles effect */}
                                <div className="absolute inset-0 opacity-30">
                                    <Star className="absolute top-2 left-4 w-3 h-3 text-white animate-pulse delay-100" />
                                    <Sparkles className="absolute top-4 right-6 w-4 h-4 text-white animate-pulse delay-300" />
                                    <Star className="absolute bottom-3 left-8 w-2 h-2 text-white animate-pulse delay-500" />
                                </div>

                                <div className="relative z-10 flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                                    <span>Generate Shareable Link</span>
                                    <Star className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
                                </div>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-2 border-cyan-200 rounded-3xl max-w-lg bg-white shadow-2xl shadow-cyan-500/20">
                            <AlertDialogHeader className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                                    Create Shareable Interview Link? 🔗
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-600 text-base leading-relaxed space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/50">
                                        <p className="font-semibold text-cyan-800 mb-3">Your interview setup:</p>
                                        <div className="space-y-2 text-sm text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                                <span><strong>{questionList.length} questions</strong> ready</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span><strong>{formData.jobPosition}</strong> position</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                                <span><strong>{formData.duration}</strong> duration</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-base">
                                        This will create a unique interview link that you can share with students via
                                        <strong className="text-cyan-700"> WhatsApp, Email, or any platform.</strong>
                                    </p>
                                    <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                                        💡 Once created, you can copy the link from your dashboard and share it with candidates.
                                    </p>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex gap-3 pt-6">
                                <AlertDialogCancel
                                    disabled={saveLoading}
                                    className="flex-1 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 cursor-pointer"
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onFinish}
                                    disabled={saveLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 border-0"
                                >
                                    {saveLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2Icon className="animate-spin w-4 h-4" />
                                            <span>Creating Link...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 cursor-pointer">
                                            <span>Yes, Create Link!</span>
                                            <Star className="w-4 h-4" />
                                        </div>
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {!loading && !error && questionList.length === 0 && formData && (
                <div className="p-6 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                            <RefreshCcw className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-yellow-800 font-semibold text-lg mb-2">No questions generated</p>
                            <p className="text-yellow-700 mb-4">Something went wrong. Let's try generating questions again.</p>
                            <Button
                                onClick={GenerateQuestionList}
                                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl cursor-pointer"
                                disabled={loading}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionList;