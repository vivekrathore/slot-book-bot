Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building Slot Booking Bot Executable" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host "Please check your Node.js and npm installation" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Building Windows executable..." -ForegroundColor Green
npm run build-exe

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build executable" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Building macOS executable..." -ForegroundColor Green
npm run build-mac-app

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: macOS build failed (expected on Windows)" -ForegroundColor Yellow
    Write-Host "This is normal if building on Windows" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Creating installer package..." -ForegroundColor Green
npm run create-installer

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Installer creation failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Executables created in 'dist' folder:" -ForegroundColor White
Write-Host "  • slot-book-bot.exe (Windows)" -ForegroundColor White
Write-Host "  • slot-book-bot-mac (macOS)" -ForegroundColor White
Write-Host ""
Write-Host "To run on Windows:" -ForegroundColor White
Write-Host "  1. Go to dist folder" -ForegroundColor White
Write-Host "  2. Double-click: run-slot-book-bot.bat" -ForegroundColor White
Write-Host "  3. Or run: slot-book-bot.exe" -ForegroundColor White
Write-Host ""
Write-Host "For first-time setup, the bot will ask for credentials." -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"

