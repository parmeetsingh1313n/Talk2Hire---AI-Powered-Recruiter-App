from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    
    # CORS settings
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # API settings
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # External API settings (if needed)
    GRADIO_MODEL_URL = os.getenv('GRADIO_MODEL_URL', 'mr-ez0/test-gradio')
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
    
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS