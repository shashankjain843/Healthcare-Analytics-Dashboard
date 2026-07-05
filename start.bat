@echo off
title Healthcare Analytics Dashboard
echo ================================================
echo   Healthcare Analytics Dashboard
echo ================================================
echo.
echo [1/2] Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul
echo.
echo [2/2] Starting server (Frontend + Backend together)...
echo.
echo  Open browser at: http://localhost:3000
echo  Press Ctrl+C to stop the server
echo.
npm run dev
pause
