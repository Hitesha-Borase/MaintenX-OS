@echo off
echo ========================================================
echo   MaintenX OS - Restart PostgreSQL 18 Service
echo ========================================================
echo.
echo 1. Stopping stuck postgres.exe processes...
taskkill /F /IM postgres.exe /T >nul 2>&1

echo 2. Waiting 2 seconds for port 5432 to release...
timeout /t 2 /nobreak >nul

echo 3. Starting postgresql-x64-18 Windows Service...
net start postgresql-x64-18

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] PostgreSQL 18 started successfully!
    echo You can now connect in pgAdmin 4 and refresh the app.
) else (
    echo [NOTE] If you got Access Denied, please right-click this
    echo file and select "Run as administrator".
)
echo ========================================================
pause
