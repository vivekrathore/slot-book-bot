# PeopleFirst Slot Booking Bot - macOS

This is a standalone macOS application for automated slot booking on PeopleFirst.

## 🚀 Quick Start

### Method 1: Double-click the App
1. **Download** `Slot Booking Bot.app`
2. **Double-click** to launch
3. **Follow the setup prompts**

### Method 2: Terminal
1. **Download** `slot-book-bot-mac` executable
2. **Run** `./slot-book-bot-mac` in Terminal
3. **Or use** `./run-slot-book-bot-mac.sh`

## 📋 First-Time Setup

When you run the bot for the first time, it will:

1. **Ask for your credentials:**
   ```
   👤 Enter your username: your.username
   🔑 Enter your password: ********
   ```

2. **Verify your account:**
   - Sends OTP to your mobile
   - Asks you to enter the OTP code

3. **Choose activity:**
   ```
   🏊 Enter activity code (SWIM/GYMM/ZUMB): SWIM
   ```

4. **Save configuration** for future use

## ⏰ Automated Booking

After setup, the bot will:
- ✅ Save your credentials, preferences, and authentication data
- ⏰ **Wait until 12:00 AM (midnight)**
- 🔄 **Smart Authentication**: Try stored token first, auto-reauthenticate if needed
- 📱 **OTP Handling**: Reuse recent OTP when possible, prompt only when necessary
- 🎯 Automatically book the first available slot
- 💾 Update stored authentication data for next run

## 🎯 Available Activities

- **SWIM** - Swimming (default)
- **GYMM** - Gym activities
- **ZUMB** - Zumba classes

## 📁 Configuration

Your settings are saved in `booking-config.json`:
```json
{
  "username": "your.username",
  "password": "encrypted",
  "activity": "SWIM",
  "gameDate": "2025-12-09",
  "buildingCode": "AL13",
  "locationCode": "RIL0000005"
}
```

## 🔧 Troubleshooting

### "Permission Denied" Error
```bash
chmod +x slot-book-bot-mac
chmod +x run-slot-book-bot-mac.sh
```

### "Login Failed"
- Verify your username and password
- Check your internet connection
- Ensure you can access PeopleFirst normally

### "No Available Slots"
- Slots may be booked quickly
- Try different activities
- Check the date is correct

### "OTP Not Received"
- Check your mobile phone
- Ensure your PeopleFirst mobile number is correct
- Try requesting OTP again

### Gatekeeper Blocks App
If macOS blocks the app:
1. Right-click the `.app` file
2. Select "Open"
3. Click "Open" in the security dialog

## 🛠️ Building from Source

If you need to rebuild the macOS executable:

```bash
# Install dependencies
npm install

# Build macOS executable
npm run build-mac

# Create macOS app bundle
npm run build-mac-app
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Try running the setup again
3. Ensure you're using the latest version

## ⚠️ Important Notes

- **Keep the executable secure** - it contains your login credentials
- **Run on the day you want to book** - the bot waits until midnight
- **Monitor the first run** - ensure setup completes successfully
- **Check booking confirmation** - verify slots are booked correctly

## 🎉 Success Example

```
🤖 PeopleFirst Slot Booking Bot Setup
=====================================

🔐 Authentication Setup:
👤 Enter your username: vivek2.rathore
🔑 Enter your password: ********

✅ Login successful!
✅ OTP verified successfully!
✅ Authentication setup complete!

🎯 Activity Selection:
🏊 Enter activity code (SWIM/GYMM/ZUMB): SWIM

💾 Configuration saved successfully!

⏰ Waiting until midnight... (6h 23m 15s)
🎯 It's midnight! Starting slot booking...

✅ Slot booked successfully!
🎉 You have booked: 06:00-07:00 (SL001) for Swimming
```

---

**Happy booking! 🏊‍♂️**
