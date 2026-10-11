@echo off
title Muhanad Wael Mahdy - Portfolio
cd /d "%~dp0"

rem ---------------------------------------------------------------
rem  One-click launcher for the portfolio website.
rem  - Starts PostgreSQL (the site database) if installed
rem  - Installs dependencies / database on first run
rem  - Starts the site on http://localhost:3000 and opens the browser
rem ---------------------------------------------------------------

rem Make sure node and git are available (fresh terminals have them already)
where node >nul 2>nul || set "PATH=C:\Users\mohan\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Expected in C:\Users\mohan\nodejs
  pause
  exit /b 1
)

rem Start PostgreSQL if installed (the site database runs on it)
if exist "C:\Users\mohan\pgsql\data\PG_VERSION" (
  "C:\Users\mohan\pgsql\bin\pg_ctl.exe" -D "C:\Users\mohan\pgsql\data" -l "C:\Users\mohan\pgsql\log.txt" status >nul 2>nul
  if errorlevel 1 (
    echo Starting PostgreSQL database...
    "C:\Users\mohan\pgsql\bin\pg_ctl.exe" -D "C:\Users\mohan\pgsql\data" -l "C:\Users\mohan\pgsql\log.txt" start >nul 2>nul
    timeout /t 3 /nobreak >nul
  )
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

rem First run: create the database schema
if not exist "prisma\dev.db" (
  if exist "prisma\migrated-pg.flag" goto db-done
  echo First run detected - pushing the schema to PostgreSQL...
  call npx prisma db push
  if errorlevel 1 goto fail
  echo migrated > "prisma\migrated-pg.flag"
)
:db-done

echo.
echo  ============================================================
echo   Portfolio website starting...
echo.
echo   Website     : http://localhost:3000
echo   Admin panel : http://localhost:3000/admin
echo                 (your credentials are in the .env file)
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

