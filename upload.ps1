# upload.ps1 - Recycle Bin GitHub Upload Script
# Run with: powershell -ExecutionPolicy Bypass -File .\upload.ps1

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Recycle Bin - GitHub Upload Script     " -ForegroundColor Cyan
Write-Host " Powered by CRTY                        " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1 - Init git
Write-Host "[1/5] Checking git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "  > Git initialized." -ForegroundColor Green
} else {
    Write-Host "  > Git already initialized." -ForegroundColor Gray
}

# 2 - Remove stale cached files (node_modules, dist, logs, lock)
Write-Host "[2/5] Removing cached build/lock artifacts from git index..." -ForegroundColor Yellow
$toRemove = @("node_modules", "dist", "build", "*.log", "pnpm-lock.yaml", ".env", "packages/core/drizzle")
foreach ($item in $toRemove) {
    git rm -r --cached $item 2>$null
}
Write-Host "  > Cache cleaned." -ForegroundColor Green

# 3 - Stage all source files (respects .gitignore)
Write-Host "[3/5] Staging source files..." -ForegroundColor Yellow
git add .
Write-Host "  > Files staged." -ForegroundColor Green

# 4 - Commit
Write-Host "[4/5] Committing..." -ForegroundColor Yellow
$commitResult = git commit -m "chore: initialize Recycle Bin MVP - Powered by CRTY" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  > Nothing new to commit (or already committed)." -ForegroundColor Gray
} else {
    Write-Host "  > Committed successfully." -ForegroundColor Green
}

# 5 - Set remote and push
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/CRTYPUBG/recycle-bin.git
git push -u origin main

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " SUCCESS! Repository uploaded.          " -ForegroundColor Green
    Write-Host " https://github.com/CRTYPUBG/recycle-bin" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " ERROR: Push failed!                    " -ForegroundColor Red
    Write-Host " Ensure git credentials are configured. " -ForegroundColor Red
    Write-Host " Run: gh auth login                     " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Red
}
Write-Host ""
