@echo off
title Muhanad Wael Mahdy - Portfolio
cd /d "%~dp0"

rem ---------------------------------------------------------------
rem  One-click launcher for the portfolio website.
rem  - Uses the portable Node.js at C:\Users\mohan\nodejs if needed
rem  - Installs dependencies / database on first run
rem  - Starts the site on http://localhost:3000 and opens the browser
rem ---------------------------------------------------------------

rem Make sure node is available (fresh terminals have it on PATH already)
where node >nul 2>nul || set "PATH=C:\Users\mohan\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Expected in C:\Users\mohan\nodejs
  pause
  exit /b 1
)

rem If the site is already running, just open it
netstat -ano 2>nul | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo The website is already running - opening http://localhost:3000
  start "" http://localhost:3000
  timeout /t 3 /nobreak >nul
  exit /b 0
)

rem First run: install dependencies
if not exist "node_modules" (
  echo First run detected - installing dependencies, this can take a few minutes...
  call npm install --no-audit --no-fund
  if errorlevel 1 goto fail
)

rem First run: create and seed the database
if not exist "prisma\dev.db" (
  echo First run detected - creating and seeding the database...
  call npx prisma db push
  if errorlevel 1 goto fail
  call npm run db:seed
  if errorlevel 1 goto fail
)

echo.
echo  ============================================================
echo   Portfolio website starting...
echo.
echo   Website     : http://localhost:3000
echo   Admin panel : http://localhost:3000/admin
echo                 login: admin@muhanad.dev  /  admin123
echo.
echo   Keep this window OPEN while using the site.
echo   Close this window (or press Ctrl+C) to stop the website.
echo  ============================================================
echo.

start "" /min cmd /c "timeout /t 8 /nobreak >nul & start "" http://localhost:3000"
call npm run dev
goto :eof

:fail
echo.
echo [ERROR] Setup failed - read the messages above for the cause.
pause
