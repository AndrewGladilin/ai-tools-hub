#!/bin/bash

# AI News Digest Agent - Setup Script
# This script automates the installation and setup process

set -e  # Exit on error

echo "🤖 AI News Digest Agent - Setup Script"
echo "========================================"
echo ""

# Check Python version
echo "✓ Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "  Found Python $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "✓ Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  Virtual environment created"
else
    echo "  Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate
echo "  Virtual environment activated"
echo ""

# Install requirements
echo "✓ Installing Python dependencies..."
pip install -q -r requirements.txt
echo "  Dependencies installed"
echo ""

# Setup .env file
echo "✓ Setting up .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  Created .env file from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your API keys:"
    echo "   nano .env"
    echo ""
    echo "   Add these values:"
    echo "   - GROQ_API_KEY (from https://console.groq.com/keys)"
    echo "   - TELEGRAM_BOT_TOKEN (from @botfather)"
    echo "   - TELEGRAM_CHANNEL (your channel username, e.g. neuro_andrew)"
else
    echo "  .env file already exists"
fi
echo ""

# Test the setup
echo "✓ Testing configuration..."
echo ""
echo "  To test if everything works, run:"
echo "  source venv/bin/activate"
echo "  python3 main.py"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys: nano .env"
echo "2. Test the script: python3 main.py"
echo "3. Setup cron job: crontab -e"
echo "   Add this line: 0 9 * * * cd $(pwd) && source venv/bin/activate && python3 main.py >> news_agent_cron.log 2>&1"
echo ""
echo "For more help, see README.md"
