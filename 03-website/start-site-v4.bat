@echo off
title IRONKIN v4 - http://localhost:4175
rem Starts IRONKIN v4 on http://localhost:4175 and opens it once it is ready. Close this window to stop it.
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ ^(tick "Add to PATH"^), then try again. & pause & exit /b 1)
python tools\serve.py site-v4 4175
if errorlevel 1 pause
