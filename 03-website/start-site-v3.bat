@echo off
title IRONKIN v3 - http://localhost:4174
rem Starts IRONKIN v3 on http://localhost:4174 and opens it once it is ready. Close this window to stop it.
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ ^(tick "Add to PATH"^), then try again. & pause & exit /b 1)
python tools\serve.py site-v3 4174
if errorlevel 1 pause
