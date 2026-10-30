@echo off
rem Daily PostgreSQL backup for the portfolio site (used by Task Scheduler)
cd /d "C:\Users\mohan\.zcode\workspace\default\muhanad-portfolio"
set "PATH=C:\Users\mohan\nodejs;C:\Users\mohan\pgsql\bin;%PATH%"

rem Make sure PostgreSQL is up before backing up
"C:\Users\mohan\pgsql\bin\pg_ctl.exe" -D "C:\Users\mohan\pgsql\data" -l "C:\Users\mohan\pgsql\log.txt" status >nul 2>nul
if errorlevel 1 (
  "C:\Users\mohan\pgsql\bin\pg_ctl.exe" -D "C:\Users\mohan\pgsql\data" -l "C:\Users\mohan\pgsql\log.txt" start >nul 2>nul
  timeout /t 3 /nobreak >nul
)

node scripts\backup-database.mjs
