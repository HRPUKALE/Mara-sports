#!/usr/bin/env python3
"""
Start the Mara Sports Backend API
"""

import subprocess
import sys
import os

def main():
    """Start the FastAPI server."""
    print("🏆 Starting Mara Sports Festival Backend...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("app/main.py"):
        print("❌ Error: Please run this script from the backend directory")
        sys.exit(1)
    
    try:
        print("🚀 Starting FastAPI server on http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔄 Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
