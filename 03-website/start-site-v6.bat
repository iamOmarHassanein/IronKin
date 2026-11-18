@echo off
cd /d "%~dp0site-v6"
start "" http://localhost:4177
python -m http.server 4177
