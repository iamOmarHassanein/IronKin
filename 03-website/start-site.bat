@echo off
title IRONKIN v2 - http://localhost:4173
rem Starts IRONKIN v2 on http://localhost:4173 and opens it once it is ready. Close this window to stop it.
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ ^(tick "Add to PATH"^), then try again. & pause & exit /b 1)
python tools\serve.py site 4173
if errorlevel 1 pause
