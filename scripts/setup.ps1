$ErrorActionPreference = "Stop"

Write-Host "PodAccess Setup" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed." -ForegroundColor Red
    Write-Host "Install Node.js 18+ from https://nodejs.org/ and rerun this script."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not available in PATH." -ForegroundColor Red
    exit 1
}

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Installing backend dependencies..."
Set-Location (Join-Path $root "backend")
npm install

Write-Host "Installing frontend dependencies..."
Set-Location (Join-Path $root "frontend")
npm install

if (-not (Test-Path (Join-Path $root "backend\.env"))) {
    Copy-Item (Join-Path $root "backend\.env.example") (Join-Path $root "backend\.env")
    Write-Host "Created backend/.env from .env.example - update OPENAI_API_KEY before processing audio."
}

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host "1. Edit backend/.env with your OpenAI API key"
Write-Host "2. Start MongoDB"
Write-Host "3. Run backend:  cd backend && npm run dev"
Write-Host "4. Run frontend: cd frontend && npm run dev"
Write-Host "5. Open http://localhost:5173"

Set-Location $root
