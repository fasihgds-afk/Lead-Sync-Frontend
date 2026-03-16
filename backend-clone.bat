@echo off
title LeadSyncFlow Setup Tool
color 0A
cls

:HEADER
echo ==================================================
echo               LeadSyncFlow Setup Tool
echo ==================================================
echo.

:: Check Git
git --version >nul 2>&1
if errorlevel 1 (
color 0C
echo [ERROR] Git is not installed!
echo Install Git from: https://git-scm.com/
echo.
pause
exit /b
)

:: Check Node
node -v >nul 2>&1
if errorlevel 1 (
color 0C
echo [ERROR] Node.js is not installed!
echo Install Node.js from: https://nodejs.org/
echo.
pause
exit /b
)

color 0B

:MENU
cls
echo ==================================================
echo               LeadSyncFlow Setup Tool
echo ==================================================
echo.
echo Select Branch To Clone
echo.
echo   [1] Main Branch   (Stable)
echo   [2] Buggy-Work    (Development)
echo   [3] Exit
echo.
echo ==================================================
echo.

set choice=
set /p choice=Enter your choice: 

if "%choice%"=="" goto MENU

if "%choice%"=="1" (
    set BRANCH_NAME=main
    goto CLONE
)

if "%choice%"=="2" (
    set BRANCH_NAME=buggy-work
    goto CLONE
)

if "%choice%"=="3" (
    exit /b
)

echo.
echo Invalid option!
timeout /t 2 >nul
goto MENU


:CLONE
cls
echo ==================================================
echo           Preparing Repository Setup
echo ==================================================
echo.
echo Selected Branch: %BRANCH_NAME%
echo.

:: Check existing folder
if exist leadsyncflow (
echo Folder "leadsyncflow" already exists.
echo.
set del=
set /p del=Delete existing folder? (y/n): 

if /i "%del%"=="y" (
    echo Removing old project...
    rmdir /s /q leadsyncflow
) else (
    echo Setup cancelled.
    pause
    exit /b
)
)

echo.
echo Cloning repository...
echo.

git clone https://github.com/ShehzadIqbal1/leadsyncflow.git

if errorlevel 1 (
color 0C
echo.
echo [ERROR] Failed to clone repository.
pause
exit /b
)

cd leadsyncflow

echo.
echo Switching to branch: %BRANCH_NAME%
git checkout %BRANCH_NAME%

if errorlevel 1 (
color 0C
echo.
echo [ERROR] Branch not found!
pause
exit /b
)

color 0E
echo.
echo Installing dependencies...
echo.

npm install

if errorlevel 1 (
color 0C
echo.
echo [ERROR] npm install failed.
pause
exit /b
)

color 0A
echo.
echo ==================================================
echo               SETUP COMPLETE
echo ==================================================
echo.
echo Branch   : %BRANCH_NAME%
echo Location : %cd%
echo.
echo Run project with:
echo.
echo     npm run dev
echo.
echo ==================================================
echo.

pause