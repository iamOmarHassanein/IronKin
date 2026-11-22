@echo off
title IRONKIN - all site versions
rem Runs every IRONKIN site version side by side and opens the hub page. Each server gets its own small window; close them to stop.
cd /d "%~dp0.."
where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ ^(tick "Add to PATH"^), then try again. & pause & exit /b 1)
start "IRONKIN hub :4170" /min python tools\serve.py previews 4170 --no-open
start "IRONKIN v2 :4173"  /min python tools\serve.py site 4173 --no-open
start "IRONKIN v3 :4174"  /min python tools\serve.py site-v3 4174 --no-open
start "IRONKIN v4 :4175"  /min python tools\serve.py site-v4 4175 --no-open
start "IRONKIN v5 :4176"  /min python tools\serve.py site-v5 4176 --no-open
start "IRONKIN v6 :4177"  /min python tools\serve.py site-v6 4177 --no-open
timeout /t 2 /nobreak >nul
start "" http://localhost:4170
echo The hub is open at http://localhost:4170 . Version 01 and 02 run separately: start-version-01.bat / start-version-02.bat
timeout /t 6 >nul
