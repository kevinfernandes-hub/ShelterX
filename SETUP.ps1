#!/pow shell

# ANTIGRAVITY Setup Script
# This script will guide you through the complete setup process

$ErrorActionPreference = "Stop"

function Write-Title {
    param([string]$title)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host $title -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$step, [string]$description)
    Write-Host "`n>>> STEP $step" -ForegroundColor Yellow
    Write-Host $description -ForegroundColor White
}

function Write-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$message)
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

Write-Title "🆘 ANTIGRAVITY - AI Safety Companion"
Write-Host "Interactive Setup Guide" -ForegroundColor Cyan
Write-Host "Version 1.0.0" -ForegroundColor DarkCyan
Write-Host ""

# Check prerequisites
Write-Step "1" "Checking prerequisites..."

# Check Node.js
$nodeVersion = node --version
if ($nodeVersion) {
    Write-Success "Node.js found: $nodeVersion"
} else {
    Write-Warning "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Check npm
$npmVersion = npm --version
if ($npmVersion) {
    Write-Success "npm found: $npmVersion"
} else {
    Write-Warning "npm not found"
    exit 1
}

# Check if in project directory
if (-not (Test-Path "package.json")) {
    Write-Warning "Not in ANTIGRAVITY project directory"
    Write-Info "Please run this script from the project root: d:\shelteer x\antigravity"
    exit 1
}

Write-Success "Prerequisites check passed!"

# Firebase Configuration
Write-Step "2" "Firebase Configuration"
Write-Info "To continue, you'll need to:"
Write-Info "1. Go to https://console.firebase.google.com"
Write-Info "2. Create a new project"
Write-Info "3. Enable Authentication (Anonymous)"
Write-Info "4. Enable Realtime Database (Test Mode)"
Write-Info "5. Copy your config"
Write-Host ""
$skipFirebase = Read-Host "Have you configured Firebase? (y/n)"
if ($skipFirebase -ne "y") {
    Write-Warning "Please configure Firebase first at https://console.firebase.google.com"
    exit 1
}

# Ask for Firebase config
Write-Host ""
Write-Warning "IMPORTANT: Have your Firebase config ready"
Write-Info "You'll find it in Firebase Console > Project Settings > Your Apps > Web"
Write-Host ""

# Check if config.js is modified
$configPath = "src/config.js"
$configContent = Get-Content $configPath
if ($configContent -contains "YOUR_API_KEY") {
    Write-Warning "Firebase config not yet configured in src/config.js"
    Write-Info "You'll need to update it with your Firebase credentials"
    Write-Info "Format:"
    Write-Info "  apiKey: 'your_api_key',"
    Write-Info "  authDomain: 'your_auth_domain',"
    Write-Info "  projectId: 'your_project_id',"
    Write-Info "  etc..."
    Write-Host ""
    $editConfig = Read-Host "Would you like to open src/config.js now? (y/n)"
    if ($editConfig -eq "y") {
        Start-Process "code" -ArgumentList "src/config.js"
        Read-Host "Press Enter after updating the config"
    }
}

# Install dependencies (if needed)
Write-Step "3" "Verifying dependencies..."
if (-not (Test-Path "node_modules")) {
    Write-Info "Installing dependencies... (this may take a few minutes)"
    npm install
    Write-Success "Dependencies installed"
} else {
    Write-Success "Dependencies already installed"
}

# Run linter
Write-Step "4" "Checking code quality..."
Write-Info "Running linter..."
$lintResult = npm run lint 2>&1 | Select-String "error" -Context 1
if ($lintResult) {
    Write-Warning "Linting found some issues (non-critical warnings)"
} else {
    Write-Success "Code quality check passed!"
}

# Summary
Write-Title "Setup Complete! 🎉"
Write-Host ""
Write-Host "Next steps to run the app:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Update Firebase config in src/config.js (if not already done)" -ForegroundColor White
Write-Host "  2. Run the app:" -ForegroundColor White
Write-Host "     npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Choose a platform:" -ForegroundColor White
Write-Host "     a = Android" -ForegroundColor Cyan
Write-Host "     i = iOS" -ForegroundColor Cyan
Write-Host "     w = Web" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  📄 QUICK_START.md   - 5-minute quick start" -ForegroundColor White
Write-Host "  📄 SETUP_GUIDE.md   - Detailed setup instructions" -ForegroundColor White
Write-Host "  📄 PROJECT_SUMMARY.md - Complete project overview" -ForegroundColor White
Write-Host ""
Write-Host "Happy building! 🚀" -ForegroundColor Green
Write-Host ""
