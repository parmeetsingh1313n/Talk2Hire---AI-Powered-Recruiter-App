import { BriefcaseBusinessIcon, Calendar, Code2Icon, LayoutDashboard, List, Puzzle, Settings, User2Icon, UsersIcon, Wallet } from "lucide-react";

export const SidebarOptions = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard"
    },
    {
        name: "Scheduled Interview",
        icon: Calendar,
        path: "/scheduled-interview"
    },
    {
        name: "Active Interview",
        icon: List,
        path: "/all-interview"
    },
    {
        name: "Settings",
        icon: Settings,
        path: "/settings"
    }
]

export const InterviewType = [
    {
        title: "Technical",
        icon: Code2Icon
    },
    {
        title: "Behavioral",
        icon: User2Icon
    },
    {
        title: "Experience",
        icon: BriefcaseBusinessIcon
    },
    {
        title: "Problem Solving",
        icon: Puzzle
    },
    {
        title: "Leadership",
        icon: UsersIcon
    }
]

export const QUESTION_PROMPT = `You are an expert technical interviewer.

Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Interview Duration: {{duration}}
Interview Type: {{type}}

Your task:
1. Analyze the job description to identify key responsibilities, required skills, and expected experience.
2. Generate a list of interview questions depending on the interview duration.
3. Adjust the number and depth of questions to match the interview duration.
4. Ensure the questions match the tone and structure of a real-life {{type}} interview.
5. Format your response in JSON format as an array of questions.

Format:
interviewQuestions = [
  {
    "question": "Your question here",
    "type": "Technical/Behavioral/Experience/Problem Solving/Leadership"
  }
]

The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role.
`;

export const FEEDBACK_PROMPT = `{{conversation}}
Depends on this Interview Conversation between assistant and user,
Give me feedback for user interview. Give me rating out of 10 for technical Skills,
Communication, Problem Solving, Experience. Also give me summery in 3 lines
about the interview and one line to let me know whether is recommended
for hire or not with msg. Give me response in JSON format
{
    feedback:{
        rating:{
            technicalSkills:5,
            communication:6,
            problemSolving:4,
            experience:7
        },
        summery:<in 3 Line>,
        Recommendation:,
        RecommendationMsg:
    }
}`
