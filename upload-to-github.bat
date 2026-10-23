@echo off
setlocal enabledelayedexpansion

title Real-Time Word Game - 1-Click GitHub Uploader
color 0B

echo ================================================================
echo       REAL-TIME MULTIPLAYER WORD GAME - GITHUB UPLOADER
echo ================================================================
echo.
echo  Is script se aapka pura code aur assets (images, css, js)
echo  aapke GitHub account par 1-click me upload ho jayenge.
echo.
echo ================================================================
echo.

:: 1. Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git install nahi hai!
    echo Kripya Git install karein: https://git-scm.com/downloads
    echo.
    pause
    exit /b
)

:: 2. Ensure repository is initialized
if not exist ".git" (
    echo [*] Git repository initialize kar rahe hain...
    git init
    git branch -M main
)

:: 3. Ask user for GitHub repository URL
echo [STEP 1] GitHub par naya repository banayein: https://github.com/new
echo [STEP 2] Apne repository ka link copy karein.
echo.
set /p REPO_URL="Apne GitHub Repo ka URL enter karein (e.g. https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    color 0C
    echo.
    echo [ERROR] URL khali nahi ho sakta! Please dobara run karein.
    echo.
    pause
    exit /b
)

echo.
echo ================================================================
echo [*] Files stage aur commit kar rahe hain...
git add .
git commit -m "Upload Real-time Multiplayer Word Game with Firebase" >nul 2>&1

echo [*] Remote origin configure kar rahe hain...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [*] Branch set kar rahe hain: main
git branch -M main

echo.
echo [*] GitHub par upload (push) kar rahe hain...
echo     (Agar pehli baar hai, toh browser me GitHub login window khulegi)
echo.

git push -u origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ================================================================
    echo  [SUCCESS] BADHAI HO! Aapka project GitHub par upload ho gaya!
    echo ================================================================
    echo  Aap is link par apna project dekh sakte hain:
    echo  %REPO_URL%
    echo ================================================================
) else (
    echo.
    echo ----------------------------------------------------------------
    echo Agar 'rejected (fetch first)' ka error aaya hai, toh GitHub par
    echo pehle se Readme file thi. Force push try kar rahe hain...
    echo ----------------------------------------------------------------
    set /p FORCE_CHOICE="Kya force push karna chahte hain? (y/n): "
    if /i "!FORCE_CHOICE!"=="y" (
        git push -u origin main --force
        if !errorlevel! equ 0 (
            color 0A
            echo.
            echo [SUCCESS] Force push successful! Project GitHub par upload ho gaya!
        ) else (
            color 0C
            echo.
            echo [ERROR] Push fail ho gaya. Kripya GitHub username aur password / token check karein.
        )
    )
)

echo.
echo Done. Press any key to exit.
pause >nul
