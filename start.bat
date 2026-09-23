@echo off
rem Start the site on Windows. Double-click this file. Extra args go to serve.py, e.g. start.bat --port 9000
cd /d "%~dp0"
where py >nul 2>nul && (py -3 serve.py %* & goto :done)
where python >nul 2>nul && (python serve.py %* & goto :done)
echo.
echo Python 3 is required. Install it from https://www.python.org/downloads/
echo (tick "Add python.exe to PATH"), then double-click this file again.
echo.
:done
pause
