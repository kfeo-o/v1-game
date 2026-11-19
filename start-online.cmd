@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 18 or newer to run online matches.
  pause
  exit /b 1
)
if not exist "node_modules\ws\package.json" (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open http://localhost:8080 in your browser, then choose Play Online.
call npm start
pause
