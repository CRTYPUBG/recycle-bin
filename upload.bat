@echo off
chcp 65001 >nul
setlocal

echo.
echo ========================================
echo  Recycle Bin - GitHub Upload Script
echo  Powered by CRTY
echo ========================================
echo.

REM --- Approve esbuild build scripts to prevent pnpm install error ---
echo [1/6] Approving build scripts...
pnpm approve-builds --yes >nul 2>&1

REM --- Git init if not already initialized ---
if not exist ".git" (
    echo [2/6] Initializing git...
    git init
) else (
    echo [2/6] Git already initialized, skipping...
)

REM --- Clear any old tracking for node_modules / dist etc ---
echo [3/6] Cleaning up tracked build artifacts...
git rm -r --cached node_modules/ >nul 2>&1
git rm -r --cached dist/ >nul 2>&1
git rm -r --cached build/ >nul 2>&1
git rm -r --cached "packages/core/drizzle/" >nul 2>&1
git rm -r --cached "*.log" >nul 2>&1
git rm -r --cached "pnpm-lock.yaml" >nul 2>&1
git rm -r --cached ".env" >nul 2>&1

REM --- Stage all remaining files (respects .gitignore) ---
echo [4/6] Staging source files...
git add .

REM --- Commit ---
echo [5/6] Committing...
git commit -m "chore: initialize Recycle Bin MVP - Powered by CRTY" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Nothing new to commit, or commit already made.
)

REM --- Set branch and remote ---
echo [6/6] Pushing to GitHub...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/CRTYPUBG/recycle-bin.git
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo  SUCCESS! Repository uploaded.
    echo  https://github.com/CRTYPUBG/recycle-bin
    echo ========================================
) else (
    echo ========================================
    echo  ERROR: Push failed!
    echo  Make sure you are logged into GitHub
    echo  and have write access to the repo.
    echo ========================================
)
echo.
pause
