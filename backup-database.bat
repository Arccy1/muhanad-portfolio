@echo off
rem Daily PostgreSQL backup for the portfolio site (used by Task Scheduler)
cd /d "C:\Users\mohan\.zcode\workspace\default\muhanad-portfolio"
set "PATH=C:\Users\mohan\nodejs;C:\Users\mohan\pgsql\bin;%PATH%"
node scripts\backup-database.mjs
