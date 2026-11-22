@echo off
title IRONKIN version 02 - http://localhost:5182
rem Starts IRONKIN version 02 (Vite + React) on http://localhost:5182 and opens it once it is ready. Close this window to stop it.
cd /d "%~dp0version-02"
if not exist package.json (echo version-02 is not in this checkout yet. Run: git pull & pause & exit /b 1)
where npm >nul 2>nul || (echo Node.js is not installed. Get the LTS version from https://nodejs.org/ , then try again. & pause & exit /b 1)
powershell -NoProfile -Command "try{(New-Object Net.Sockets.TcpClient).Connect('127.0.0.1',5182); exit 0}catch{exit 1}" && (echo Already running, opening it. & start "" http://localhost:5182 & exit /b 0)
if not exist node_modules (echo First run: installing packages, this takes a minute... & call npm install || (pause & exit /b 1))
call npm run dev -- --port 5182 --strictPort --open
if errorlevel 1 pause
