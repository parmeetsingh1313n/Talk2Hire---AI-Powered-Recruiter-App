from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
import io
import traceback
from datetime import datetime
import pdfplumber
from docx import Document
import requests

app = Flask(__name__)

# CORS configuration
CORS(app)

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Groq API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

print(f"🔑 Groq API Key: {GROQ_API_KEY[:15]}...")


def allowed_file(filename):
    """Check if file extension is allowed"""
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt"}
    return "." in filename and filename.rsplit(".", 1)[1].lower() in [
        ext[1:] for ext in allowed_extensions
    ]


class ResumeAnalyzer:
    def __init__(self):
        self.skill_categories = {
            "Programming Languages": [
                "python",
                "java",
                "javascript",
                "typescript",
                "c++",
                "c#",
                "php",
                "ruby",
                "go",
                "rust",
                "swift",
                "kotlin",
                "scala",
                "r",
                "matlab",
                "c",
                "perl",
            ],
            "Web Technologies": [
                "html",
                "css",
                "react",
                "angular",
                "vue",
                "nextjs",
                "express",
                "nodejs",
                "bootstrap",
                "tailwind",
                "sass",
                "jquery",
                "webpack",
            ],
            "Databases": [
                "mysql",
                "postgresql",
                "mongodb",
                "redis",
                "sqlite",
                "oracle",
                "sql server",
                "dynamodb",
                "elasticsearch",
            ],
            "Frameworks & Libraries": [
                "django",
                "flask",
                "spring",
                "spring boot",
                "laravel",
                "tensorflow",
                "pytorch",
                "pandas",
                "numpy",
                "scikit-learn",
                "keras",
            ],
            "Tools & Platforms": [
                "git",
                "github",
                "docker",
                "kubernetes",
                "aws",
                "azure",
                "linux",
                "jenkins",
                "postman",
                "figma",
                "jira",
            ],
        }

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF using pdfplumber"""
        try:
            text = ""
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            print(f"PDF extraction error: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX using python-docx"""
        try:
            doc = Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"DOCX extraction error: {str(e)}")
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")

    def extract_text_from_txt(self, file_content: bytes) -> str:
        """Extract text from TXT file"""
        try:
            encodings = ["utf-8", "latin-1", "iso-8859-1", "windows-1252"]
            for encoding in encodings:
                try:
                    return file_content.decode(encoding).strip()
                except UnicodeDecodeError:
                    continue
            return file_content.decode("utf-8", errors="ignore").strip()
        except Exception as e:
            print(f"TXT extraction error: {str(e)}")
            raise Exception(f"Failed to extract text from TXT: {str(e)}")

    def extract_personal_info(self, text: str):
        """Extract personal information from text"""
        info = {"name": "", "email": "", "phone": ""}

        # Extract email
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        email_match = re.search(email_pattern, text)
        if email_match:
            info["email"] = email_match.group(0)

        # Extract phone
        phone_patterns = [
            r"\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
            r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
            r"\d{3}[-.\s]?\d{3}[-.\s]?\d{4}",
        ]

        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                info["phone"] = phone_match.group(0)
                break

        # Try to extract name (simple heuristic)
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:3]:
            if (
                len(line) < 50
                and len(line.split()) <= 4
                and "@" not in line
                and not re.search(r"\d{10}", line)
            ):
                info["name"] = line
                break

        return info

    def analyze_resume_with_groq(self, text: str):
        """Analyze resume text using Groq API directly"""
        if not GROQ_API_KEY:
            raise Exception("Groq API key not configured")

        system_prompt = """You are an expert resume analyzer. Extract and structure information from the resume text into JSON format.

Extract the following information in JSON format:
{
    "education": [{"degree": "...", "institution": "...", "year": "..."}],
    "projects": [{"name": "...", "description": "...", "technologies": ["..."], "main_points": ["..."]}],
    "experience": {"years": 0, "level": "Fresher/Junior/Mid-Level/Senior"},
    "skills": {"Programming Languages": [], "Web Technologies": [], "Databases": [], "Frameworks & Libraries": [], "Tools & Platforms": []},
    "certifications": [{"name": "...", "year": "..."}],
    "achievements": ["..."],
    "personal_info": {"name": "...", "email": "...", "phone": "..."},
    "analysis_summary": {"total_projects": 0, "education_entries": 0, "skill_categories": 0, "certifications_count": 0, "achievements_count": 0, "candidate_type": "...", "overall_strengths": []}
}

IMPORTANT: For projects, include BOTH "description" (string) AND "main_points" (array of strings).
"main_points" should be key features/bullet points extracted from the project description.

Return ONLY the JSON, no other text."""

        try:
            # Truncate if too long
            truncated_text = text[:5000] if len(text) > 5000 else text

            print(f"🤖 Sending {len(truncated_text)} chars to Groq API...")

            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            }

            data = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Analyze this resume:\n\n{truncated_text}",
                    },
                ],
                "temperature": 0.1,
                "max_tokens": 2000,
            }

            response = requests.post(
                GROQ_API_URL, headers=headers, json=data, timeout=30
            )

            if response.status_code != 200:
                print(f"❌ Groq API error: {response.status_code} - {response.text}")
                raise Exception(f"API error: {response.status_code}")

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # Extract JSON from response
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                analysis_result = json.loads(json_str)
                return self.validate_and_clean_analysis(analysis_result)
            else:
                print(f"⚠️ No JSON found in response: {content[:200]}")
                raise Exception("Invalid response format from AI")

        except Exception as e:
            print(f"❌ Groq analysis error: {str(e)}")
            raise Exception(f"AI analysis failed: {str(e)}")

    def validate_and_clean_analysis(self, analysis):
        """Validate and clean the analysis result"""
        validated = {
            "education": analysis.get("education", []),
            "projects": analysis.get("projects", []),
            "experience": analysis.get("experience", {"years": 0, "level": "Fresher"}),
            "skills": analysis.get("skills", {}),
            "certifications": analysis.get("certifications", []),
            "achievements": analysis.get("achievements", []),
            "personal_info": analysis.get(
                "personal_info", {"name": "", "email": "", "phone": ""}
            ),
            "analysis_summary": analysis.get("analysis_summary", {}),
        }

        # Ensure projects have main_points array
        for project in validated["projects"]:
            if "main_points" not in project or not isinstance(
                project["main_points"], list
            ):
                project["main_points"] = []

        # Calculate experience level
        years = validated["experience"].get("years", 0)
        if years == 0:
            level = "Fresher"
        elif years <= 2:
            level = "Junior"
        elif years <= 5:
            level = "Mid-Level"
        else:
            level = "Senior"

        validated["experience"]["level"] = level

        # Update summary
        validated["analysis_summary"] = {
            "total_projects": len(validated["projects"]),
            "education_entries": len(validated["education"]),
            "skill_categories": len(validated["skills"]),
            "certifications_count": len(validated["certifications"]),
            "achievements_count": len(validated["achievements"]),
            "candidate_type": level,
            "overall_strengths": validated["analysis_summary"].get(
                "overall_strengths", []
            ),
        }

        return validated

    def analyze_resume_text(self, text: str):
        """Main function to analyze resume text"""
        print(f"📄 Analyzing resume text ({len(text)} characters)...")

        try:
            print("🤖 Using Groq API for analysis...")
            result = self.analyze_resume_with_groq(text)

            # Enhance with personal info from text
            personal_info = self.extract_personal_info(text)
            if not result["personal_info"]["name"] and personal_info["name"]:
                result["personal_info"]["name"] = personal_info["name"]
            if not result["personal_info"]["email"] and personal_info["email"]:
                result["personal_info"]["email"] = personal_info["email"]
            if not result["personal_info"]["phone"] and personal_info["phone"]:
                result["personal_info"]["phone"] = personal_info["phone"]

            return result

        except Exception as e:
            print(f"⚠️ AI analysis failed, using fallback: {str(e)}")
            return self.basic_resume_analysis(text)

    def basic_resume_analysis(self, text: str):
        """Basic resume analysis as fallback"""
        personal_info = self.extract_personal_info(text)

        # Simple skill extraction
        skills_found = {}
        for category, skill_list in self.skill_categories.items():
            found = []
            for skill in skill_list:
                if re.search(r"\b" + re.escape(skill) + r"\b", text, re.IGNORECASE):
                    found.append(skill.title())
            if found:
                skills_found[category] = found

        return {
            "education": [],
            "projects": [],
            "experience": {"years": 0, "level": "Fresher"},
            "skills": skills_found,
            "certifications": [],
            "achievements": [],
            "personal_info": personal_info,
            "analysis_summary": {
                "total_projects": 0,
                "education_entries": 0,
                "skill_categories": len(skills_found),
                "certifications_count": 0,
                "achievements_count": 0,
                "candidate_type": "Fresher",
                "overall_strengths": ["Basic information extracted"],
            },
        }


# Initialize analyzer
analyzer = ResumeAnalyzer()


@app.route("/")
def index():
    return jsonify(
        {
            "message": "Resume Analyzer API",
            "status": "running",
            "endpoints": {
                "POST /upload": "Upload and analyze resume",
                "POST /analyze": "Analyze resume text",
                "GET /health": "Health check",
                "POST /backend/analyze_resume_direct": "Legacy endpoint",
            },
        }
    )


@app.route("/upload", methods=["POST", "OPTIONS"])
def upload_file():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Check file size
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 10MB)"}), 413

        # Check file type
        if not allowed_file(file.filename):
            return (
                jsonify({"error": "Invalid file type. Allowed: PDF, DOC, DOCX, TXT"}),
                400,
            )

        # Read and extract text
        file_content = file.read()
        filename = file.filename.lower()

        text = ""
        if filename.endswith(".pdf"):
            text = analyzer.extract_text_from_pdf(file_content)
        elif filename.endswith((".docx", ".doc")):
            text = analyzer.extract_text_from_docx(file_content)
        elif filename.endswith(".txt"):
            text = analyzer.extract_text_from_txt(file_content)

        if not text or len(text.strip()) < 50:
            return jsonify({"error": "Could not extract sufficient text"}), 400

        # Analyze
        result = analyzer.analyze_resume_text(text)

        return jsonify(
            {
                "success": True,
                "data": result,
                "filename": file.filename,
                "fileSize": file_size,
                "extractedTextLength": len(text),
                "timestamp": datetime.now().isoformat(),
            }
        )

    except Exception as e:
        print(f"Upload error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data["text"].strip()
        if len(text) < 50:
            return jsonify({"error": "Text too short"}), 400

        result = analyzer.analyze_resume_text(text)

        return jsonify(
            {"success": True, "data": result, "timestamp": datetime.now().isoformat()}
        )

    except Exception as e:
        print(f"Analysis error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/backend/analyze_resume_direct", methods=["POST", "OPTIONS"])
def analyze_resume_direct():
    """Legacy endpoint for frontend compatibility"""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Check file size
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large"}), 413

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        file_content = file.read()
        filename = file.filename.lower()

        text = ""
        if filename.endswith(".pdf"):
            text = analyzer.extract_text_from_pdf(file_content)
        elif filename.endswith((".docx", ".doc")):
            text = analyzer.extract_text_from_docx(file_content)
        elif filename.endswith(".txt"):
            text = analyzer.extract_text_from_txt(file_content)

        if not text or len(text.strip()) < 50:
            return jsonify({"error": "Insufficient text"}), 400

        result = analyzer.analyze_resume_text(text)

        return jsonify(
            {
                "success": True,
                "data": result,
                "filename": file.filename,
                "fileSize": file_size,
                "extractedTextLength": len(text),
                "timestamp": datetime.now().isoformat(),
            }
        )

    except Exception as e:
        print(f"Direct analysis error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "resume-analyzer",
            "groq_api_key_configured": bool(GROQ_API_KEY),
        }
    )


@app.route("/test", methods=["GET"])
def test():
    return jsonify(
        {
            "message": "Resume Analyzer API is working",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(
        f"""
    ============================================
    🚀 Resume Analyzer API
    📍 Port: {port}
    🤖 Groq API: {'✅ READY' if GROQ_API_KEY else '❌ NO KEY'}
    ============================================
    """
    )
    app.run(host="0.0.0.0", port=port, debug=True)
