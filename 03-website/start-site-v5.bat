@echo off
cd /d "%~dp0site-v5"
start "" http://localhost:4176
python -m http.server 4176
