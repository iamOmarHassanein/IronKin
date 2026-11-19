@echo off
cd /d "%~dp0site-v4"
start "" http://localhost:4175
python -m http.server 4175
