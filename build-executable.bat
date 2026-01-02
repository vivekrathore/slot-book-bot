@echo off
echo ========================================
echo   Building Slot Booking Bot Executable
echo ========================================
echo.

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Please check your Node.js and npm installation
    pause
    exit /b 1
)

echo.
echo Building Windows executable...
npm run build-exe

if %errorlevel% neq 0 (
    echo ERROR: Failed to build executable
    pause
    exit /b 1
)

echo.
echo Building macOS executable...
npm run build-mac-app

if %errorlevel% neq 0 (
    echo WARNING: macOS build failed (expected on Windows)
    echo This is normal if building on Windows
)

echo.
echo Creating installer package...
npm run create-installer

if %errorlevel% neq 0 (
    echo WARNING: Installer creation failed
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Executables created in 'dist' folder:
echo   • slot-book-bot.exe (Windows)
echo   • slot-book-bot-mac (macOS)
echo.
echo To run on Windows:
echo   1. Go to dist folder
echo   2. Double-click: run-slot-book-bot.bat
echo   3. Or run: slot-book-bot.exe
echo.
echo For first-time setup, the bot will ask for credentials.
echo.

pause

