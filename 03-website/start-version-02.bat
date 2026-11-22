@echo off
cd /d "%~dp0version-02"
if not exist node_modules call npm install
start "" http://localhost:5182
npm run dev -- --port 5182
