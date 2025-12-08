#!/usr/bin/env node

const { PeopleFirstAuth } = require('./slot-book');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Configuration file path
const CONFIG_FILE = path.join(__dirname, 'booking-config.json');

// Available activities
const ACTIVITIES = {
  'SWIM': { name: 'Swimming', building: 'AL13' },
  'GYMM': { name: 'Gym', building: 'AL2' },
  'ZUMB': { name: 'Zumba', building: 'AL20' }
};

// Create readline interface
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Ask user a question
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Validate activity choice
function validateActivity(activity) {
  const upperActivity = activity.toUpperCase();
  return ACTIVITIES[upperActivity] ? upperActivity : null;
}

// Save booking configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('💾 Configuration saved successfully!');
  } catch (error) {
    console.error('❌ Failed to save configuration:', error.message);
  }
}

// Load booking configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(data);

      // Validate configuration has required fields
      const required = ['username', 'password', 'activity', 'buildingCode'];
      const missing = required.filter(field => !config[field]);

      if (missing.length > 0) {
        console.log(`⚠️  Configuration missing fields: ${missing.join(', ')}`);
        console.log('💡 Please run setup again.');
        return null;
      }

      return config;
    }
  } catch (error) {
    console.error('❌ Failed to load configuration:', error.message);
  }
  return null;
}

// Calculate time until midnight
function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight

  const timeDiff = midnight - now;
  return timeDiff;
}

// Smart authentication function that tries stored data first
async function authenticateWithStoredData(auth, config) {
  console.log('🔄 Attempting smart authentication...');

  // Try to use stored token if it's recent (within 1 hour)
  if (config.authToken && config.lastLogin) {
    const lastLogin = new Date(config.lastLogin);
    const now = new Date();
    const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60);

    if (hoursSinceLogin < 1) { // Token valid for 1 hour
      console.log('🔄 Using stored authentication token...');

      // Try to make a test API call to check if token is still valid
      try {
        const testResult = await auth.checkAvailableSlots({
          activityCode: config.activity,
          buildingCode: config.buildingCode
        });

        if (testResult.success) {
          console.log('✅ Stored token is still valid!');
          return { success: true, method: 'stored' };
        }
      } catch (error) {
        console.log('⚠️  Stored token expired, proceeding with fresh authentication...');
      }
    }
  }

  // Fall back to fresh authentication
  console.log('🔐 Performing fresh authentication...');

  // Login
  const loginResult = await auth.login(config.username, config.password);
  if (!loginResult.success) {
    throw new Error('Login failed: ' + (loginResult.error || loginResult.status));
  }
  console.log('✅ Login successful!');

  // Request OTP
  const otpResult = await auth.requestOTP();
  if (!otpResult.success) {
    throw new Error('OTP request failed: ' + (otpResult.error || otpResult.status));
  }
  console.log('✅ OTP sent to mobile!');

  // Try saved OTP first
  let otp = null;
  if (config.lastOTP && config.lastOTPTime) {
    const otpAge = Date.now() - new Date(config.lastOTPTime).getTime();
    const maxOTPAge = 5 * 60 * 1000; // 5 minutes

    if (otpAge < maxOTPAge) {
      console.log('🔄 Trying saved OTP...');
      otp = config.lastOTP;
    }
  }

  // If no saved OTP or it's too old, ask for new one
  if (!otp) {
    console.log('\n⚠️  OTP Required for booking!');
    console.log('📱 Please check your mobile for OTP code.');

    const rl = createReadlineInterface();
    otp = await askQuestion(rl, '🔢 Enter OTP code: ');
    rl.close();
  }

  // Verify OTP
  const verifyResult = await auth.verifyOTP(otp);
  if (!verifyResult.success) {
    // If saved OTP failed, try getting new one
    if (otp === config.lastOTP) {
      console.log('❌ Saved OTP failed, please enter current OTP:');
      const rl = createReadlineInterface();
      otp = await askQuestion(rl, '🔢 Enter current OTP code: ');
      rl.close();

      const retryResult = await auth.verifyOTP(otp);
      if (!retryResult.success) {
        throw new Error('OTP verification failed: ' + (retryResult.error || retryResult.status));
      }
    } else {
      throw new Error('OTP verification failed: ' + (verifyResult.error || verifyResult.status));
    }
  }
  console.log('✅ OTP verified!');

  // Fetch token
  const tokenResult = await auth.fetchToken();
  if (!tokenResult.success) {
    throw new Error('Token fetch failed: ' + (tokenResult.error || tokenResult.status));
  }
  console.log('✅ Token fetched!');

  // Update stored data
  config.authToken = auth.getAuthToken();
  config.sessionCookies = auth.getSessionCookies();
  config.lastOTP = otp;
  config.lastOTPTime = new Date().toISOString();
  config.lastLogin = new Date().toISOString();
  saveConfig(config);

  return { success: true, method: 'fresh', otp: otp };
}

// Format time duration
function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}

// Wait until midnight
function waitUntilMidnight() {
  return new Promise((resolve) => {
    const timeUntilMidnight = getTimeUntilMidnight();

    console.log(`⏰ Waiting until midnight... (${formatTime(timeUntilMidnight)})`);

    setTimeout(() => {
      console.log('🎯 It\'s midnight! Starting slot booking...');
      resolve();
    }, timeUntilMidnight);
  });
}

// Main setup function
async function setupBooking() {
  console.log('🤖 PeopleFirst Slot Booking Bot Setup');
  console.log('=====================================\n');

  const rl = createReadlineInterface();

  try {
    // Check if config already exists
    const existingConfig = loadConfig();
    if (existingConfig) {
      console.log('📋 Found existing configuration:');
      console.log(`   👤 User: ${existingConfig.username}`);
      console.log(`   🎯 Activity: ${existingConfig.activity} (${ACTIVITIES[existingConfig.activity]?.name})`);
      console.log(`   📅 Date: ${existingConfig.gameDate}`);

      const reuse = await askQuestion(rl, '\n🔄 Use existing configuration? (y/n): ');
      if (reuse.toLowerCase() === 'y' || reuse.toLowerCase() === 'yes') {
        rl.close();
        await runAutomatedBooking(existingConfig);
        return;
      }
    }

    // Get user credentials
    console.log('\n🔐 Authentication Setup:');
    const username = await askQuestion(rl, '👤 Enter your username: ');
    const password = await askQuestion(rl, '🔑 Enter your password: ');

    // Test login
    console.log('\n🔍 Testing login...');
    const auth = new PeopleFirstAuth();
    const loginResult = await auth.login(username, password);

    if (!loginResult.success) {
      console.log('❌ Login failed! Please check your credentials.');
      rl.close();
      return;
    }

    console.log('✅ Login successful!');

    // Request OTP to test the flow
    console.log('\n📱 Requesting OTP for verification...');
    const otpResult = await auth.requestOTP();

    if (!otpResult.success) {
      console.log('❌ OTP request failed!');
      rl.close();
      return;
    }

    console.log('✅ OTP sent! Please check your mobile.');

    // Get OTP for verification
    const otp = await askQuestion(rl, '🔢 Enter OTP code: ');

    console.log('🔍 Verifying OTP...');
    const verifyResult = await auth.verifyOTP(otp);

    if (!verifyResult.success) {
      console.log('❌ OTP verification failed!');
      rl.close();
      return;
    }

    console.log('✅ OTP verified successfully!');

    // Fetch token
    console.log('🎫 Fetching authentication token...');
    const tokenResult = await auth.fetchToken();

    if (!tokenResult.success) {
      console.log('❌ Token fetch failed!');
      rl.close();
      return;
    }

    console.log('✅ Authentication setup complete!');

    // Get activity preference
    console.log('\n🎯 Activity Selection:');
    console.log('Available activities:');
    Object.entries(ACTIVITIES).forEach(([code, info]) => {
      console.log(`   ${code} - ${info.name}`);
    });

    let activity;
    while (!activity) {
      const activityInput = await askQuestion(rl, '\n🏊 Enter activity code (SWIM/GYMM/ZUMB): ');
      activity = validateActivity(activityInput);

      if (!activity) {
        console.log('❌ Invalid activity code. Please choose from: SWIM, GYMM, ZUMB');
      }
    }

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const gameDate = tomorrow.toISOString().split('T')[0];

    // Save configuration with authentication data
    const config = {
      username,
      password,
      activity,
      gameDate,
      buildingCode: ACTIVITIES[activity].building,
      locationCode: 'RIL0000005',
      // Store authentication data for automatic re-authentication
      authToken: auth.getAuthToken(),
      sessionCookies: auth.getSessionCookies(),
      lastOTP: otp,  // Save OTP for potential reuse
      lastOTPTime: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    saveConfig(config);

    console.log('\n🎉 Setup complete!');
    console.log(`📅 Will book ${ACTIVITIES[activity].name} slot for ${gameDate}`);

    rl.close();

    // Start automated booking
    await runAutomatedBooking(config);

  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    rl.close();
  }
}

// Automated booking function
async function runAutomatedBooking(config) {
  console.log('\n🚀 Starting Automated Slot Booking');
  console.log('==================================');

  try {
    // Wait until midnight
    await waitUntilMidnight();

    console.log('\n🔐 Starting automated authentication...');
    const auth = new PeopleFirstAuth();

    // Use smart authentication that tries stored data first
    const authResult = await authenticateWithStoredData(auth, config);

    if (!authResult.success) {
      throw new Error('Authentication failed');
    }

    if (authResult.method === 'stored') {
      console.log('✅ Using stored authentication - no manual intervention needed!');
    } else {
      console.log('✅ Fresh authentication completed successfully!');
    }

    // Check available slots
    console.log(`\n🔍 Checking available ${ACTIVITIES[config.activity].name} slots...`);
    const slotsResult = await auth.checkAvailableSlots({
      activityCode: config.activity,
      buildingCode: config.buildingCode,
      gameDate: config.gameDate
    });

    if (!slotsResult.success) {
      throw new Error('Slot check failed: ' + (slotsResult.error || slotsResult.status));
    }

    const availableSlots = slotsResult.availableSlots.filter(slot => slot.AvailableCount > 0);
    if (availableSlots.length === 0) {
      throw new Error('No available slots found for booking');
    }

    console.log(`📅 Found ${availableSlots.length} available slot(s)`);

    // Book first available slot
    const slotToBook = availableSlots[0];
    console.log(`🎯 Booking slot: ${slotToBook.Slots} (${slotToBook.SlotCode})`);

    const bookingResult = await auth.bookSlot({
      activityCode: config.activity,
      buildingCode: config.buildingCode,
      gameDate: config.gameDate,
      slotCode: slotToBook.SlotCode
    });

    if (!bookingResult.success) {
      throw new Error('Slot booking failed: ' + (bookingResult.error || bookingResult.status));
    }

    console.log('✅ Slot booked successfully!');
    console.log(`🎉 You have booked: ${slotToBook.Slots} (${slotToBook.SlotCode}) for ${ACTIVITIES[config.activity].name}`);

    // Clean up
    auth.logout();

  } catch (error) {
    console.error('❌ Automated booking failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify your credentials are correct');
    console.log('   - Ensure slots are available for booking');
    console.log('   - Try running setup again: node slot-book-bot.js');
  }
}

// Main execution
if (require.main === module) {
  setupBooking().catch(console.error);
}

module.exports = { setupBooking, runAutomatedBooking, ACTIVITIES };
