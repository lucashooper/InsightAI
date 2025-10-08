@echo off
echo ========================================
echo   InsightAI Marketing Site
echo ========================================
echo.
echo Starting development server...
echo.

cd marketing

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite dev server on http://localhost:3001
echo.
call npm run dev

pause
