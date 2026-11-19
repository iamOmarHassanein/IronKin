@echo off
rem Runs every IRONKIN site version side by side on localhost, straight from this checkout of main.
setlocal
set "W=%~dp0.."
start "IRONKIN hub :4170" /min python -m http.server 4170 --directory "%~dp0."
start "IRONKIN v2 :4173"  /min python -m http.server 4173 --directory "%W%\site"
start "IRONKIN v3 :4174"  /min python -m http.server 4174 --directory "%W%\site-v3"
start "IRONKIN v4 :4175"  /min python -m http.server 4175 --directory "%W%\site-v4"
start "IRONKIN v5 :4176"  /min python -m http.server 4176 --directory "%W%\site-v5"
start "IRONKIN v6 :4177"  /min python -m http.server 4177 --directory "%W%\site-v6"
timeout /t 2 /nobreak >nul
start "" http://localhost:4170
