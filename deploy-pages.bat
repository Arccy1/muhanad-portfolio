@echo off
title Deploy portfolio to GitHub Pages
cd /d "%~dp0"

rem Builds the static site from your current database content and publishes
rem it to GitHub Pages (https://arccy1.github.io/muhanad-portfolio/).
rem Run this any time you change content in the admin panel.

where node >nul 2>nul || set "PATH=C:\Users\mohan\nodejs;%PATH%"
where git >nul 2>nul || set "PATH=C:\Users\mohan\git\cmd;%PATH%"

node scripts\deploy-pages.mjs
pause
