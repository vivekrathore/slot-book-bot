#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Creating Windows Installer Package...');

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy necessary files
const filesToCopy = [
    'slot-book-bot.exe',
    'slot-book-bot-mac',
    'run-slot-book-bot.bat',
    'run-slot-book-bot.ps1',
    'run-slot-book-bot-mac.sh',
    'WINDOWS_README.md',
    'MAC_README.md',
    'booking-config.json' // Will be created during setup
];

console.log('📋 Copying files...');
filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(__dirname, 'dist', file);

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied: ${file}`);
    } else {
        console.log(`⚠️  Skipped: ${file} (not found)`);
    }
});

// Create a simple installer script
const installerScript = `@echo off
echo ========================================
echo   PeopleFirst Slot Booking Bot Installer
echo ========================================
echo.

echo Installing to: %~dp0
echo.

if not exist "slot-book-bot.exe" (
    echo ERROR: slot-book-bot.exe not found in current directory!
    echo Please ensure the executable is in the same folder as this installer.
    pause
    exit /b 1
)

echo ✅ Installation complete!
echo.
echo To run the bot:
echo   1. Double-click: run-slot-book-bot.bat
echo   2. Or run: slot-book-bot.exe
echo.
echo For first-time setup, the bot will ask for your credentials.
echo.

pause`;

fs.writeFileSync(path.join(__dirname, 'dist', 'install.bat'), installerScript);
console.log('✅ Created: install.bat');

// Create desktop shortcut batch file (optional)
const desktopShortcut = `@echo off
echo Creating desktop shortcut...
echo.

set "DESKTOP=%USERPROFILE%\\Desktop"
set "TARGET=%~dp0slot-book-bot.exe"
set "SHORTCUT=%DESKTOP%\\Slot Booking Bot.lnk"

echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%SHORTCUT%" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%TARGET%" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> CreateShortcut.vbs
echo oLink.Description = "PeopleFirst Slot Booking Bot" >> CreateShortcut.vbs
echo oLink.IconLocation = "shell32.dll,13" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

cscript //nologo CreateShortcut.vbs
del CreateShortcut.vbs

echo ✅ Desktop shortcut created!
echo.
pause`;

fs.writeFileSync(path.join(__dirname, 'dist', 'create-shortcut.bat'), desktopShortcut);
console.log('✅ Created: create-shortcut.bat');

console.log('\n🎉 Cross-platform installer package created in "dist" folder!');
console.log('\n📦 Package includes:');
console.log('   📋 Windows:');
console.log('   • slot-book-bot.exe - Windows executable');
console.log('   • run-slot-book-bot.bat - Windows batch launcher');
console.log('   • run-slot-book-bot.ps1 - PowerShell launcher');
console.log('   • WINDOWS_README.md - Windows instructions');
console.log('   • install.bat - Windows installation helper');
console.log('   • create-shortcut.bat - Windows desktop shortcut');
console.log('');
console.log('   🍎 macOS:');
console.log('   • slot-book-bot-mac - macOS executable');
console.log('   • run-slot-book-bot-mac.sh - macOS shell launcher');
console.log('   • MAC_README.md - macOS instructions');

console.log('\n🚀 To distribute:');
console.log('   1. Zip the "dist" folder');
console.log('   2. Share with Windows users');
console.log('   3. They run install.bat to set up');

// Try to build the executables if pkg is available
try {
    console.log('\n🔨 Attempting to build executables...');

    // Build Windows executable
    try {
        console.log('📦 Building Windows executable...');
        execSync('npm run build-exe', { stdio: 'pipe' });
        console.log('✅ Windows executable built successfully!');
    } catch (winError) {
        console.log('⚠️  Windows executable build failed (may not be on Windows)');
    }

    // Build macOS executable
    try {
        console.log('🍎 Building macOS executable...');
        execSync('npm run build-mac-app', { stdio: 'pipe' });
        console.log('✅ macOS executable built successfully!');
    } catch (macError) {
        console.log('⚠️  macOS executable build failed (may not be on macOS)');
    }

    console.log('✅ Executable builds completed!');
} catch (error) {
    console.log('⚠️  Could not build executables (pkg may not be installed)');
    console.log('   Run: npm install');
    console.log('   Then: npm run build-exe (Windows) or npm run build-mac-app (macOS)');
}
