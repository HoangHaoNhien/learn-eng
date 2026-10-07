@echo off
rem Chay web server tinh de trang doc thang cac file .json (sua JSON xong chi can F5)
cd /d "%~dp0"

where python >nul 2>&1
if not %errorlevel%==0 (
  echo Khong tim thay Python. Hay dung build.bat va mo thang file HTML.
  pause
  exit /b
)

echo Dang chay tai http://localhost:8000/khung-cau-giao-tiep.html
echo Nhan Ctrl+C de dung.
start "" "http://localhost:8000/khung-cau-giao-tiep.html"
python -m http.server 8000
