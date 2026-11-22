@echo off
cd /d "%~dp0version-01"
if not exist node_modules call npm install
start "" http://localhost:5180
npm run dev -- --port 5180
