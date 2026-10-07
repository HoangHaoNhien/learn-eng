@echo off
rem Gom cac file JSON thanh data\bundle.js de mo HTML truc tiep bang file://
cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel%==0 (
  python build.py
  goto done
)
where py >nul 2>&1
if %errorlevel%==0 (
  py build.py
  goto done
)
echo Khong tim thay Python. Cai tai https://www.python.org/downloads/ roi chay lai.

:done
echo.
pause
