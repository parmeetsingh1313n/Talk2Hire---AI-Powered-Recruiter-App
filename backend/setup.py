#!/usr/bin/env python3
"""
Setup script for Resume Analysis Backend
Run this script to set up the backend environment
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd,
            capture_output=True, 
            text=True
        )
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error output: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {command}: {str(e)}")
        return False

def create_env_file():
    """Create .env file with default values"""
    env_content = """# Flask Backend Configuration
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production
GRADIO_MODEL_URL=mr-ez0/test-gradio

# Add other environment variables as needed
"""
    
    env_path = Path('.env')
    if not env_path.exists():
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
    else:
        print("ℹ️  .env file already exists")

def setup_backend():
    """Set up the Flask backend"""
    print("🚀 Setting up Resume Analysis Backend...")
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    
    print(f"✅ Python version: {sys.version}")
    
    # Create virtual environment
    print("📦 Creating virtual environment...")
    if not run_command("python -m venv backend_env"):
        print("❌ Failed to create virtual environment")
        return False
    
    # Activate virtual environment and install dependencies
    print("📥 Installing dependencies...")
    
    # Commands for different operating systems
    if os.name == 'nt':  # Windows
        activate_cmd = "backend_env\\Scripts\\activate"
        pip_cmd = f"{activate_cmd} && pip install -r requirements.txt"
    else:  # Unix/Linux/macOS
        activate_cmd = "source backend_env/bin/activate"
        pip_cmd = f"{activate_cmd} && pip install -r requirements.txt"
    
    if not run_command(pip_cmd):
        print("❌ Failed to install dependencies")
        return False
    
    # Create .env file
    create_env_file()
    
    # Create uploads directory
    uploads_dir = Path('uploads')
    uploads_dir.mkdir(exist_ok=True)
    print("✅ Created uploads directory")
    
    print("🎉 Backend setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Activate the virtual environment:")
    if os.name == 'nt':
        print("   backend_env\\Scripts\\activate")
    else:
        print("   source backend_env/bin/activate")
    print("2. Run the Flask app:")
    print("   python app.py")
    print("3. The backend will be available at http://localhost:5000")
    
    return True

if __name__ == "__main__":
    success = setup_backend()
    if not success:
        sys.exit(1)