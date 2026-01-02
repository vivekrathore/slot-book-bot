@echo off
echo ========================================
echo   PeopleFirst Slot Booking Bot
echo ========================================
echo.

if not exist "slot-book-bot.exe" (
    echo ERROR: slot-book-bot.exe not found!
    echo Please run 'npm run build-exe' first to create the executable.
    pause
    exit /b 1
)

echo Starting Slot Booking Bot...
echo.
slot-book-bot.exe

echo.
echo Press any key to exit...
pause > nul

