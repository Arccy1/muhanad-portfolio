@echo off
title Push portfolio to GitHub
cd /d "%~dp0"

rem ---------------------------------------------------------------
rem  Pushes this website's code to GitHub.
rem  First run: asks for your repository URL once, then signs you
rem  in through the browser (remembered for future pushes).
rem ---------------------------------------------------------------

where git >nul 2>nul || set "PATH=C:\Users\mohan\git\cmd;%PATH%"

git remote get-url origin >nul 2>nul
if not errorlevel 1 goto push

echo.
echo  This pushes your website code to GitHub.
echo.
echo  1. Open  https://github.com/new  in your browser
echo  2. Name the repository (e.g. muhanad-portfolio), Public or Private
echo  3. Click "Create repository"  (do NOT add a README or license)
echo  4. Copy the repository URL and paste it below
echo     (looks like https://github.com/your-username/muhanad-portfolio.git)
echo.
set /p REPO_URL=Paste repository URL here and press Enter: 
if "%REPO_URL%"=="" goto cancel
:trimtrail
if "%REPO_URL:~-1%"==" " (
  set "REPO_URL=%REPO_URL:~0,-1%"
  goto trimtrail
)
:trimlead
if "%REPO_URL:~0,1%"==" " (
  set "REPO_URL=%REPO_URL:~1%"
  goto trimlead
)
set "REPO_URL=%REPO_URL:"=%"
git remote add origin "%REPO_URL%"
if errorlevel 1 goto cancel

:push
echo.
echo Pushing code to GitHub...
echo (If a browser window asks you to sign in, authorize once - it is remembered.)
echo.
git push -u origin main
if errorlevel 1 goto fail

for /f "delims=" %%u in ('git remote get-url origin') do set "REPO=%%u"
echo.
echo  ============================================================
echo   Done! Your code is on GitHub:
echo   %REPO%
echo  ============================================================
echo.
pause
exit /b 0

:cancel
echo.
echo Cancelled - nothing was changed.
pause
exit /b 1

:fail
echo.
echo [ERROR] Push failed. Most common causes:
echo   - The repository does not exist on GitHub yet (create it at
echo     https://github.com/new , then run this file again)
echo   - No internet connection
echo   - The pasted URL has a typo
pause
exit /b 1
