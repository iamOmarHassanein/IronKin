@echo off
title IRONKIN v6 - http://localhost:4177
rem Starts IRONKIN v6 on http://localhost:4177 and opens it once it is ready. Close this window to stop it.
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ ^(tick "Add to PATH"^), then try again. & pause & exit /b 1)
python tools\serve.py site-v6 4177
if errorlevel 1 pause
