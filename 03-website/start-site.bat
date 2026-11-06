@echo off
rem Starts the IRONKIN site on http://localhost:4173 and opens it. Close this window to stop it.
cd /d "%~dp0site"
start "" http://localhost:4173
python -m http.server 4173 --bind 127.0.0.1
