from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
import io
from datetime import datetime
from typing import Dict, List, Any, Optional
import PyPDF2
from docx import Document
import requests
from werkzeug.utils import secure_filename
import openai

app = Flask(__name__)

# CORS configuration
CORS(
    app,
    origins=["http://localhost:3000"],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
    supports_credentials=True,
)

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
]

# Initialize OpenAI client for Groq
try:
    groq_client = openai.OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"), base_url="https://api.groq.com/openai/v1"
    )
    print("✅ Groq client initialized successfully")
except Exception as e:
    groq_client = None
    print(f"⚠️  Groq client initialization failed: {str(e)}")
    print(
        "⚠️  AI analysis will be disabled. Please set GROQ_API_KEY environment variable."
    )


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
        """Extract text from PDF using PyPDF2"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX using python-docx"""
        try:
            doc_file = io.BytesIO(file_content)
            doc = Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")

    def extract_text_from_txt(self, file_content: bytes) -> str:
        """Extract text from TXT file"""
        try:
            return file_content.decode("utf-8").strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from TXT: {str(e)}")

    def analyze_resume_with_groq(self, text: str) -> Dict[str, Any]:
        """Analyze resume text using Groq AI via OpenAI client"""
        if not groq_client:
            raise Exception("Groq client not configured")

        system_prompt = """You are an expert resume analyzer. Extract and structure information from the resume text into the following JSON format:

{
    "education": [
        {
            "degree": "string",
            "institution": "string", 
            "year": "string",
            "gpa": "string (optional)"
        }
    ],
    "projects": [
        {
            "name": "string",
            "main_points": ["string array of key features"],
            "technologies": ["string array of technologies used"]
        }
    ],
    "experience": {
        "years": "number (calculate total years)",
        "level": "string (Fresher, Junior, Mid-Level, Senior)"
    },
    "skills": {
        "Programming Languages": ["string array"],
        "Web Technologies": ["string array"],
        "Databases": ["string array"],
        "Frameworks & Libraries": ["string array"],
        "Tools & Platforms": ["string array"],
        "Soft Skills": ["string array"]
    },
    "certifications": [
        {
            "name": "string",
            "year": "string"
        }
    ],
    "achievements": ["string array"],
    "personal_info": {
        "name": "string",
        "email": "string",
        "phone": "string"
    },
    "analysis_summary": {
        "total_projects": "number",
        "education_entries": "number", 
        "skill_categories": "number",
        "certifications_count": "number",
        "achievements_count": "number",
        "candidate_type": "string",
        "overall_strengths": ["string array of key strengths"]
    }
}

Instructions:
1. Extract all education details including degree, institution, year, and GPA if available
2. Extract projects with their main features/points and technologies used
3. Calculate total years of experience from work history and assign appropriate level
4. Categorize skills into appropriate groups
5. Extract certifications with names and years
6. Extract achievements and awards
7. Extract personal information (name, email, phone)
8. Provide analysis summary with counts and candidate type
9. Be accurate and thorough in extraction

Return ONLY valid JSON, no other text."""

        try:
            # Available Groq models
            models = [
                "openai/gpt-oss-120b",
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768",
                "llama-3.2-1b-preview",
                "llama-3.2-3b-preview",
            ]

            completion = None
            last_error = None

            for model in models:
                try:
                    print(f"🔄 Trying Groq model: {model}")
                    completion = groq_client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {
                                "role": "user",
                                "content": f"Resume Text:\n{text[:15000]}",
                            },
                        ],
                        temperature=0.1,
                        max_tokens=4000,
                        response_format={"type": "json_object"},
                    )
                    print(f"✅ Success with model: {model}")
                    break
                except Exception as model_error:
                    print(f"❌ Model {model} failed: {str(model_error)}")
                    last_error = model_error
                    continue

            if not completion:
                raise Exception(
                    f"All Groq models failed. Last error: {str(last_error)}"
                )

            raw_content = completion.choices[0].message.content
            if not raw_content:
                raise Exception("No content received from Groq")

            print("✅ Raw Groq response received")

            # Parse JSON response
            analysis_result = json.loads(raw_content)

            # Validate and clean the analysis
            return self.validate_and_clean_analysis(analysis_result)

        except Exception as e:
            print(f"❌ Groq analysis error: {str(e)}")
            raise Exception(f"AI analysis failed: {str(e)}")

    def validate_and_clean_analysis(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the analysis result"""
        # Ensure all required fields exist
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
            "analysis_summary": analysis.get(
                "analysis_summary",
                {
                    "total_projects": 0,
                    "education_entries": 0,
                    "skill_categories": 0,
                    "certifications_count": 0,
                    "achievements_count": 0,
                    "candidate_type": "Fresher",
                    "overall_strengths": [],
                },
            ),
        }

        # Calculate experience level if not properly set
        if not validated["experience"].get("level"):
            years = validated["experience"].get("years", 0)
            validated["experience"]["level"] = self.get_experience_level(years)

        # Ensure analysis summary counts are accurate
        validated["analysis_summary"] = {
            "total_projects": len(validated["projects"]),
            "education_entries": len(validated["education"]),
            "skill_categories": len(validated["skills"]),
            "certifications_count": len(validated["certifications"]),
            "achievements_count": len(validated["achievements"]),
            "candidate_type": validated["experience"]["level"],
            "overall_strengths": validated["analysis_summary"].get(
                "overall_strengths", []
            ),
        }

        return validated

    def get_experience_level(self, years: int) -> str:
        """Get experience level based on years"""
        if years == 0:
            return "Fresher"
        elif years <= 2:
            return "Junior Professional (0-2 years)"
        elif years <= 5:
            return "Mid-Level Professional (2-5 years)"
        else:
            return "Senior Professional (5+ years)"

    def analyze_resume_text(self, text: str) -> Dict[str, Any]:
        """Main function to analyze resume text"""
        print("Starting resume analysis...")

        try:
            # Use Groq AI for analysis
            if groq_client:
                print("Using Groq AI for resume analysis...")
                return self.analyze_resume_with_groq(text)
            else:
                raise Exception(
                    "Groq API not configured. Please set GROQ_API_KEY environment variable."
                )

        except Exception as e:
            print(f"AI analysis failed: {str(e)}")
            # Fallback to basic extraction if AI fails
            return self.basic_resume_analysis(text)

    def basic_resume_analysis(self, text: str) -> Dict[str, Any]:
        """Basic resume analysis as fallback"""
        print("Using basic resume analysis as fallback...")

        # Extract email
        email_match = re.search(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text
        )
        email = email_match.group(0) if email_match else ""

        # Extract phone
        phone_match = re.search(
            r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text
        )
        phone = phone_match.group(0) if phone_match else ""

        # Extract name (first line usually)
        lines = text.split("\n")
        name = lines[0].strip() if lines else "Candidate"

        return {
            "education": [],
            "projects": [],
            "experience": {"years": 0, "level": "Fresher"},
            "skills": {},
            "certifications": [],
            "achievements": [],
            "personal_info": {"name": name, "email": email, "phone": phone},
            "analysis_summary": {
                "total_projects": 0,
                "education_entries": 0,
                "skill_categories": 0,
                "certifications_count": 0,
                "achievements_count": 0,
                "candidate_type": "Fresher",
                "overall_strengths": ["Basic information extracted"],
            },
        }


# Initialize analyzer
analyzer = ResumeAnalyzer()


@app.route("/backend/analyze_pdf", methods=["POST", "OPTIONS"])
def analyze_pdf():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Validate file type
        if file.mimetype not in ALLOWED_MIME_TYPES:
            return jsonify({"error": "Unsupported file type"}), 400

        # Read file content
        file_content = file.read()

        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            return jsonify({"error": "File size too large"}), 400

        # Extract text based on file type
        text = ""
        if file.mimetype == "application/pdf":
            text = analyzer.extract_text_from_pdf(file_content)
        elif (
            file.mimetype
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            text = analyzer.extract_text_from_docx(file_content)
        elif file.mimetype == "text/plain":
            text = analyzer.extract_text_from_txt(file_content)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        if not text or len(text) < 50:
            return (
                jsonify({"error": "Could not extract sufficient text from file"}),
                400,
            )

        return jsonify(
            {
                "success": True,
                "text": text,
                "filename": file.filename,
                "text_length": len(text),
            }
        )

    except Exception as e:
        print(f"Text extraction error: {str(e)}")
        return jsonify({"error": f"Failed to extract text: {str(e)}"}), 500


@app.route("/backend/analyze_resume", methods=["POST", "OPTIONS"])
def analyze_resume():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "No text provided for analysis"}), 400

        text = data["text"]
        if not text or len(text.strip()) < 50:
            return jsonify({"error": "Insufficient text for analysis"}), 400

        print(f"Analyzing resume text ({len(text)} characters)...")

        # Analyze the resume
        analysis_result = analyzer.analyze_resume_text(text)

        # Validate the analysis result has all required fields
        if not analysis_result:
            return jsonify({"error": "Analysis returned no results"}), 500

        print(
            f"Analysis completed: {len(analysis_result.get('projects', []))} projects, "
            f"{len(analysis_result.get('education', []))} education entries"
        )

        return jsonify(
            {
                "success": True,
                "data": analysis_result,
                "timestamp": datetime.now().isoformat(),
            }
        )

    except Exception as e:
        print(f"Resume analysis error: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


@app.route("/backend/analyze_resume_direct", methods=["POST", "OPTIONS"])
def analyze_resume_direct():
    """Direct endpoint that handles file upload and analysis in one call"""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Validate file type
        if file.mimetype not in ALLOWED_MIME_TYPES:
            return jsonify({"error": "Unsupported file type"}), 400

        # Read file content
        file_content = file.read()

        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            return jsonify({"error": "File size too large"}), 400

        # Extract text based on file type
        text = ""
        if file.mimetype == "application/pdf":
            text = analyzer.extract_text_from_pdf(file_content)
        elif (
            file.mimetype
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            text = analyzer.extract_text_from_docx(file_content)
        elif file.mimetype == "text/plain":
            text = analyzer.extract_text_from_txt(file_content)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        if not text or len(text) < 50:
            return (
                jsonify({"error": "Could not extract sufficient text from file"}),
                400,
            )

        print(f"Extracted text ({len(text)} characters), starting analysis...")

        # Analyze the resume
        analysis_result = analyzer.analyze_resume_text(text)

        if not analysis_result:
            return jsonify({"error": "Analysis returned no results"}), 500

        return jsonify(
            {
                "success": True,
                "data": analysis_result,
                "timestamp": datetime.now().isoformat(),
                "filename": file.filename,
                "fileSize": len(file_content),
                "extractedTextLength": len(text),
            }
        )

    except Exception as e:
        print(f"Direct resume analysis error: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


@app.route("/backend/debug_extract", methods=["POST"])
def debug_extract():
    """Debug endpoint to see what's being extracted"""
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files["file"]
    file_content = file.read()

    # Extract text
    text = analyzer.extract_text_from_pdf(file_content)

    # Find sections for debugging
    sections = {}
    section_patterns = {
        "education": r"EDUCATION\s*([\s\S]*?)(?=PROJECTS|SKILLS|$)",
        "projects": r"PROJECTS\s*([\s\S]*?)(?=SKILLS|EDUCATION|$)",
        "skills": r"SKILLS\s*([\s\S]*?)(?=CERTIFICATIONS|ACHIEVEMENTS|$)",
        "certifications": r"CERTIFICATIONS\s*([\s\S]*?)(?=ACHIEVEMENTS|$)",
        "achievements": r"ACHIEVEMENTS\s*([\s\S]*?)(?=DECLARATION|$)",
    }

    for section, pattern in section_patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        sections[section] = match.group(1)[:500] + "..." if match else "NOT FOUND"

    return jsonify(
        {
            "full_text_preview": text[:1000] + "...",
            "sections": sections,
            "text_length": len(text),
        }
    )


@app.route("/health", methods=["GET"])
def health_check():
    groq_status = "configured" if groq_client else "not configured"
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "groq_status": groq_status,
        }
    )


# Error handling
@app.errorhandler(413)
def file_too_large(error):
    return jsonify({"error": "File size too large"}), 413


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Starting Flask server on port {port}")
    print(
        f"🔑 Groq API Status: {'✅ Configured' if groq_client else '❌ Not Configured'}"
    )
    app.run(host="0.0.0.0", port=port, debug=True)
