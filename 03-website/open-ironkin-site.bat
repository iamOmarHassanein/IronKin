@echo off
title IRONKIN - open a site version
cd /d "%~dp0"
:menu
cls
echo.
echo   IRONKIN website versions
echo   ------------------------
echo   1  v2   Athlete opening + hanger rail      http://localhost:4173
echo   2  v3   Cloth flag + hanger rail           http://localhost:4174
echo   3  v4   "Train in it" gym film             http://localhost:4175
echo   4  v5   "Earn your Iron" flag film         http://localhost:4176
echo   5  v6   "The Rite" red light               http://localhost:4177
echo   6  version 01  (identity v6, light)        http://localhost:5180
echo   7  version 02  (night edition)             http://localhost:5182
echo   8  all of v2-v6 at once + hub page         http://localhost:4170
echo.
set /p c=  Type a number and press Enter:
if "%c%"=="1" start "IRONKIN v2" cmd /c start-site.bat
if "%c%"=="2" start "IRONKIN v3" cmd /c start-site-v3.bat
if "%c%"=="3" start "IRONKIN v4" cmd /c start-site-v4.bat
if "%c%"=="4" start "IRONKIN v5" cmd /c start-site-v5.bat
if "%c%"=="5" start "IRONKIN v6" cmd /c start-site-v6.bat
if "%c%"=="6" (if exist start-version-01.bat (start "IRONKIN version 01" cmd /c start-version-01.bat) else (echo   Version 01 is not on main yet: merge pull request #1 on GitHub, then git pull. & pause))
if "%c%"=="7" (if exist start-version-02.bat (start "IRONKIN version 02" cmd /c start-version-02.bat) else (echo   Version 02 is not on main yet: merge pull request #2 on GitHub, then git pull. & pause))
if "%c%"=="8" call previews\start-all-sites.bat
goto menu
