@echo off
echo ============================================
echo  xTract — Freight Document Audit
echo ============================================
echo.

REM Check if ANTHROPIC_API_KEY is already set
if "%ANTHROPIC_API_KEY%"=="" (
  echo  No ANTHROPIC_API_KEY found in environment.
  echo  You can either:
  echo    1. Set it now by editing this file and replacing YOUR_KEY_HERE below
  echo    2. Enter it directly in the browser when prompted
  echo.
  REM Uncomment the next line and replace YOUR_KEY_HERE with your actual key:
  REM set ANTHROPIC_API_KEY=YOUR_KEY_HERE
) else (
  echo  API key found - server-side extraction enabled.
)

echo  Starting server...
echo  Open your browser at: http://localhost:3000
echo.
node server.js
pause
