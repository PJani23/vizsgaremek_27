@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
    echo Nincs telepitve Node.js. Telepitsd a 24 LTS verziojat!
    pause
    exit /b 1
)
echo.
echo A szerver indul. Nyisd meg a bongeszoben: http://localhost:3000
 echo Leallitas: Ctrl+C
 echo.
node backend\server.js
pause
