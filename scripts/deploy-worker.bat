@echo off
title Portfolio Deploy Worker
cd /d "C:\Users\mohan\.zcode\workspace\default\muhanad-portfolio"

rem ============================================
rem  DETACHED deploy worker:
rem  1. Waits for the API response to reach the client
rem  2. Stops the dev server (releases file locks)
rem  3. Builds + publishes to GitHub Pages
rem  4. Restarts the dev server
rem ============================================

rem Let the API response reach the browser first
timeout /t 2 /nobreak >nul

rem Stop the dev server (releases file locks on src/app/api)
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

rem Ensure PostgreSQL is running
"C:\Users\mohan\pgsql\bin\pg_ctl.exe" -D "C:\Users\mohan\pgsql\data" -l "C:\Users\mohan\pgsql\log.txt" start >nul 2>&1
timeout /t 2 /nobreak >nul

rem Run the build and push
set "PATH=C:\Users\mohan\nodejs;C:\Users\mohan\git\cmd;C:\Users\mohan\pgsql\bin;%PATH%"
cd /d "C:\Users\mohan\.zcode\workspace\default\muhanad-portfolio"
node scripts\deploy-pages.mjs

rem Restart the dev server
start "" /min cmd /c "npx next dev -p 3000"

echo Deploy complete.
