# PeopleFirst Slot Booking Bot - Windows Executable

This is a standalone Windows executable (.exe) for automated slot booking on PeopleFirst.

## 🚀 Quick Start

1. **Download the executable** (`slot-book-bot.exe`)
2. **Double-click** `run-slot-book-bot.bat` or run `slot-book-bot.exe` directly
3. **Follow the setup prompts**

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
- ✅ Save your preferences
- ⏰ **Wait until 12:00 AM (midnight)**
- 🔄 Automatically login and book the first available slot
- 🎯 Send confirmation when booking is complete

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

### "SSL/TLS Errors"
- The executable includes SSL fixes
- If issues persist, check your network/VPN settings

## 🛠️ Building from Source

If you need to rebuild the executable:

```bash
# Install dependencies
npm install

# Build Windows executable
npm run build-exe

# The executable will be in the 'dist' folder
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
