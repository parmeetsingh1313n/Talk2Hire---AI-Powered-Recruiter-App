# Talk2Hire - AI-Powered Recruiter App 🤖💼

<div align="center">
  <img src="public/logo-new.png" alt="Talk2Hire Logo" width="180"/>
  <br/>
  <h3>Revolutionizing Recruitment with AI-Powered Interviews</h3>
  <br/>

  ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
  ![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
</div>

<br/>

## ✨ Overview

**Talk2Hire** is a cutting-edge, full-stack recruitment platform that automates the entire interview process using advanced AI technologies. The system features interactive AI avatars, real-time chat-based interviews, automated resume analysis, and comprehensive candidate evaluation—all wrapped in a modern, intuitive interface.

> 🎓 **Academic Project**: Bachelor of Technology (Hons) in Computer Science and Engineering, GLA University

---

## 🚀 Key Features

### 🎯 **Core Functionality**
- **🤖 AI-Powered Interviews** - Conversational interviews with intelligent AI agents.
- **👤 Interactive AI Avatars** - 3D animated avatars using Three.js/ReadyPlayerMe.
- **📄 Smart Resume Analysis** - AI extracts skills, experience, and qualifications.
- **📊 Real-time Evaluation** - Instant feedback and scoring during interviews.
- **🔗 Multi-Platform Sharing** - Share interviews via email, WhatsApp, or direct links.

### 👨‍💼 **Admin Portal**
- **📅 Interview Scheduling** - Create and manage multiple interviews.
- **👥 Candidate Management** - Track and evaluate all candidates.
- **📈 Analytics Dashboard** - Visual insights with interactive charts.
- **✉️ Automated Invitations** - Send personalized interview invites.
- **🔐 Secure Authentication** - Google OAuth with role-based access.

### 👤 **Candidate Experience**
- **💬 Chat-Style Interface** - WhatsApp-like conversational UI.
- **🎤 Dual Interview Modes** - Video (AI Avatar) & Audio-only options.
- **📱 Mobile Responsive** - Seamless experience across devices.
- **📋 Resume Upload** - Support for PDF, DOCX, and TXT formats.
- **📝 Real-time Feedback** - Immediate performance insights.

---

## 🏗️ System Architecture

graph TD
    User((User/Candidate))
    Admin((Recruiter))
    
    subgraph Frontend [Next.js Client]
        UI[ShadCN UI / React]
        ThreeJS[3D Avatar Engine]
        Audio[Speech Recognition]
    end
    
    subgraph Backend [Python Flask]
        API[API Server]
        RAG[RAG Engine]
        ResumeParser[Resume Parser]
    end
    
    subgraph External_Services [AI Services]
        Groq[Groq LLM]
        Assembly[AssemblyAI STT]
        Email[SMTP Service]
    end
    
    subgraph Database [Supabase]
        DB[(PostgreSQL)]
        Auth[Auth]
        Storage[Bucket]
    end

    User --> UI
    Admin --> UI
    UI -->|API Requests| API
    UI -->|Auth/Realtime| DB
    UI --> ThreeJS
    
    API --> Groq
    API --> Assembly
    API --> Email
    API --> DB
    
    ResumeParser --> Groq
🛠️ Technology StackCategoryTechnologiesFrontendBackendAI & MLData & Auth📁 Project StructureBashTalk2Hire/
├── 📂 src/app/                  # Next.js 15 App Router
│   ├── (main)/                 # Protected admin dashboard routes
│   ├── interview/              # Candidate interview interface
│   ├── auth/                   # Authentication pages
│   └── api/                    # Next.js API routes (Edge functions)
├── 📂 backend/                  # Python Flask Server
│   ├── app.py                  # Main application entry point
│   ├── requirements.txt        # Python dependencies
│   └── services/               # AI & Logic services
├── 📂 components/               # Reusable UI components (ShadCN)
├── 📂 public/                   # Static assets (3D models, images)
│   ├── models/                 # GLB/GLTF Avatar models
│   └── animation/              # Avatar animations
└── 📂 utils/                    # Helper functions and hooks
🚀 Getting StartedPrerequisitesNode.js 18+Python 3.12+Supabase AccountGroq API Key1. InstallationBash# Clone the repository
git clone [https://github.com/yourusername/Talk2Hire.git](https://github.com/yourusername/Talk2Hire.git)
cd Talk2Hire
2. Frontend SetupBash# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# (Fill in your Supabase & Backend URLs)

# Run Frontend
npm run dev
3. Backend SetupBashcd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Backend
python app.py
4. Database SetupCreate a project on Supabase.Run the SQL scripts provided in docs/schema.sql in the Supabase SQL Editor.Enable Google OAuth in Supabase Authentication settings.🔧 Environment VariablesFrontend (.env.local)Code snippetNEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
Backend (.env)Code snippetGROQ_API_KEY=your_groq_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
📊 Features in Detail🎭 Interactive AI AvatarsCustom-built using react-three-fiber and ReadyPlayerMe. The avatar synchronizes lip movements with audio using viseme mapping and blends facial expressions (happy, thinking, neutral) based on the context of the conversation.📄 Advanced Resume AnalysisPython# Utilizing RAG for Context-Aware Parsing
def analyze_resume(file_content):
    # 1. Text Extraction (OCR/PDF Parse)
    # 2. Vector Embedding generation
    # 3. Storage in Supabase Vector Store
    return structured_data
💬 Intelligent Interview FlowThe system generates dynamic follow-up questions based on the candidate's previous answers, ensuring a unique and probing interview experience rather than a static script.📈 Performance MetricsMetricResultTargetResume Processing1.5s< 3sAI Latency800ms< 2sAvatar FPS60 FPS30+ FPSConcurrent Users50+25+
