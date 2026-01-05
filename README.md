# Talk2Hire – AI-Powered Recruiter App 🤖💼

<div align="center">
  <img src="public/logo-new.png" alt="Talk2Hire Logo" width="180"/>
  <br/><br/>
  <h3>Revolutionizing Recruitment with AI-Powered Interviews</h3>
  <br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge\&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge\&logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge\&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## ✨ Overview

**Talk2Hire** is a cutting-edge, full-stack recruitment platform that automates the entire interview process using advanced AI technologies. The system features interactive AI avatars, real-time chat-based interviews, automated resume analysis, and comprehensive candidate evaluation — all wrapped in a modern, intuitive interface.

> 🎓 **Academic Project**: Bachelor of Technology (Hons) in Computer Science and Engineering, **GLA University**

---

## 🚀 Key Features

### 🎯 Core Functionality

* 🤖 **AI-Powered Interviews** – Conversational interviews with intelligent AI agents
* 👤 **Interactive AI Avatars** – 3D animated avatars using Three.js & ReadyPlayerMe
* 📄 **Smart Resume Analysis** – AI extracts skills, experience, and qualifications
* 📊 **Real-time Evaluation** – Instant feedback and scoring during interviews
* 🔗 **Multi-Platform Sharing** – Share interviews via Email, WhatsApp, or direct links

### 👨‍💼 Admin Portal

* 📅 **Interview Scheduling** – Create and manage multiple interviews
* 👥 **Candidate Management** – Track and evaluate all candidates
* 📈 **Analytics Dashboard** – Visual insights with interactive charts
* ✉️ **Automated Invitations** – Send personalized interview invites
* 🔐 **Secure Authentication** – Google OAuth with role-based access

### 👤 Candidate Experience

* 💬 **Chat-Style Interface** – WhatsApp-like conversational UI
* 🎤 **Dual Interview Modes** – Video (AI Avatar) & Audio-only options
* 📱 **Mobile Responsive** – Seamless experience across devices
* 📋 **Resume Upload** – Support for PDF, DOCX, and TXT formats
* 📝 **Real-time Feedback** – Immediate performance insights

---

## 🏗️ System Architecture

```
Frontend (Next.js 15)
 ├── React 19
 ├── TypeScript
 ├── Tailwind CSS
 ├── ShadCN UI
 └── Three.js (AI Avatars)

Backend (Python Flask)
 ├── Groq LLM (LLaMA 3)
 ├── AssemblyAI (Speech)
 ├── Resume Analyzer
 └── Email Service

Database & Auth (Supabase)
 ├── PostgreSQL
 ├── Google OAuth
 ├── Storage
 └── Realtime
```

---

## 🔄 Data Flow

1. Admin creates interview → Supabase (Interviews Table)
2. Candidate receives link → uploads resume → Flask Backend
3. Resume analyzed → Groq LLM → structured data → Supabase
4. Candidate enters interview → AI Avatar + Chat Interface
5. Real-time Q/A → AI evaluation → Supabase Conversation Logs
6. Interview completes → Analytics → Admin Dashboard

---

## 🛠️ Technology Stack

### Frontend

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS
* ShadCN UI
* Three.js / React Three Fiber

### Backend & AI

* Python 3.12
* Flask
* Groq LLM (LLaMA-3)
* AssemblyAI
* ReadyPlayerMe

### Database & Infrastructure

* Supabase (PostgreSQL + Auth)
* Google OAuth
* Vercel (Frontend)
* Render (Backend)

---

## 📁 Project Structure

```
Talk2Hire---AI-Powered-Recruiter-App/
├── src/                    # Next.js App Router
├── backend/                # Flask backend
├── public/                 # Static assets & 3D models
├── services/               # Business logic services
├── context/                # React Context
├── utils/                  # Utilities
├── package.json
├── next.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* Python 3.12+
* Supabase account
* Groq API key
* Google OAuth credentials

### Frontend Setup

```bash
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## 🚀 Deployment

### Frontend (Vercel)

* Connect GitHub repository
* Add environment variables
* Deploy

### Backend (Render)

* Root Directory: `backend`
* Build Command: `pip install -r requirements.txt`
* Start Command: `python app.py`

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <strong>Built with ❤️ for the future of recruitment</strong>
  <br/><br/>
  © 2025 Talk2Hire – AI Powered Recruiter App
</div>
