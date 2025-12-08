Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PeopleFirst Slot Booking Bot" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$exePath = "slot-book-bot.exe"
if (-not (Test-Path $exePath)) {
    Write-Host "ERROR: slot-book-bot.exe not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build-exe' first to create the executable." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting Slot Booking Bot..." -ForegroundColor Green
Write-Host ""

# Run the executable
& $exePath

Write-Host ""
Read-Host "Press Enter to exit"
