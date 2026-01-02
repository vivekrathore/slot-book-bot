# Manual Build Instructions

If the automated build scripts don't work, follow these manual steps:

## Prerequisites

1. **Install Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Install and restart your terminal

2. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

## Build Steps

### Step 1: Install Dependencies
```bash
cd slot-book-bot
npm install
```

### Step 2: Build Windows Executable
```bash
npm run build-exe
```

### Step 3: Build macOS Executable (optional)
```bash
npm run build-mac-app
```

### Step 4: Create Distribution Package
```bash
npm run create-installer
```

## Output

After building, you'll find:
- `dist/slot-book-bot.exe` - Windows executable
- `dist/slot-book-bot-mac` - macOS executable
- `dist/run-slot-book-bot.bat` - Windows launcher
- `dist/WINDOWS_README.md` - Windows instructions

## Troubleshooting

### "npm command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt
- Try `node --version` to verify

### "pkg command not found"
- Run `npm install` first
- If still failing, try `npm install -g pkg`

### Permission Errors
- On Windows: Run command prompt as Administrator
- On macOS: You might need `sudo npm install`

### Build Fails
- Ensure you're in the correct directory (`slot-book-bot`)
- Check that all files are present
- Try `npm install --force` if dependencies are corrupted

## Alternative: Use Pre-built Executables

If building fails, you can:
1. Ask someone with a working Node.js environment to build it for you
2. Use the source code directly with `node slot-book-bot.js`
3. Set up a cloud environment (AWS, DigitalOcean) to build it

## Support

If you continue having issues:
1. Check the error messages carefully
2. Ensure your Node.js version is 16+
3. Try building on a different machine
4. Check firewall/antivirus settings

