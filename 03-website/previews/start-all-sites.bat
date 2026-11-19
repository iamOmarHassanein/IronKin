@echo off
rem Runs every IRONKIN site version side by side on localhost.
rem First run: checks out each version's branch into ..\..\..\IronKin-previews (git worktrees).
rem Later runs: updates them from GitHub, then starts all servers and opens the hub.
setlocal
set "REPO=%~dp0..\.."
set "P=%REPO%\..\IronKin-previews"
cd /d "%REPO%"
git fetch -q origin
if not exist "%P%" mkdir "%P%"
call :wt v1 main
call :wt v2 feat/site-v2
call :wt v3 feat/site-v3
call :wt v4 feat/site-v4
call :wt v5 feat/site-v5
call :wt v6 feat/site-v6
copy /y "%~dp0index.html" "%P%\index.html" >nul
start "IRONKIN hub :4170" /min python -m http.server 4170 --directory "%P%"
start "IRONKIN v1 :4172"  /min python -m http.server 4172 --directory "%P%\v1\03-website\site"
start "IRONKIN v2 :4173"  /min python -m http.server 4173 --directory "%P%\v2\03-website\site"
start "IRONKIN v3 :4174"  /min python -m http.server 4174 --directory "%P%\v3\03-website\site-v3"
start "IRONKIN v4 :4175"  /min python -m http.server 4175 --directory "%P%\v4\03-website\site-v4"
start "IRONKIN v5 :4176"  /min python -m http.server 4176 --directory "%P%\v5\03-website\site-v5"
start "IRONKIN v6 :4177"  /min python -m http.server 4177 --directory "%P%\v6\03-website\site-v6"
timeout /t 2 /nobreak >nul
start "" http://localhost:4170
exit /b

:wt
if exist "%P%\%1\.git" (
  git -C "%P%\%1" pull -q --ff-only
) else (
  git worktree add -q "%P%\%1" %2
)
exit /b
