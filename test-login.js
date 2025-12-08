const { PeopleFirstAuth } = require('./slot-book');
const readline = require('readline');

async function testFullAuthentication() {
  console.log('🧪 Testing Complete PeopleFirst Authentication Flow...\n');

  const auth = new PeopleFirstAuth();

  try {
    // Step 1: Login
    console.log('🔐 Step 1: Login');
    const loginResult = await auth.login('vivek2.rathore', 'AAbb@122');

    if (!loginResult.success) {
      console.log('❌ Login failed!');
      console.log('📋 Error details:', loginResult);
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User:', loginResult.data?.data?.employeeName || 'Unknown');
    console.log('📧 Email:', loginResult.data?.data?.emailID || 'Unknown');
    console.log('📱 Mobile:', loginResult.data?.data?.mobile_no || 'Unknown');

    // Step 2: Request OTP
    console.log('\n📱 Step 2: Requesting OTP');
    const otpResult = await auth.requestOTP();

    if (!otpResult.success) {
      console.log('❌ OTP request failed!');
      console.log('📋 Error details:', otpResult);
      return;
    }

    console.log('✅ OTP sent successfully!');
    console.log('📲 Please check your mobile for the OTP code\n');

    // Step 3: Get OTP from user input
    const otp = await getOTPFromUser();

    // Step 4: Verify OTP
    console.log('\n🔍 Step 4: Verifying OTP');
    const verifyResult = await auth.verifyOTP(otp);

    if (!verifyResult.success) {
      console.log('❌ OTP verification failed!');
      console.log('📋 Error details:', verifyResult);
      return;
    }

    console.log('✅ OTP verified! Fully authenticated.');

    // Step 5: Fetch token
    console.log('\n🎫 Step 5: Fetching authentication token');
    const tokenResult = await auth.fetchToken();

    if (!tokenResult.success) {
      console.log('❌ Token fetch failed!');
      console.log('📋 Error details:', tokenResult);
      return;
    }

    console.log('✅ Token fetched successfully!');
    console.log('🔑 Token:', tokenResult.token);

    // Test authenticated request (uncomment when you have a real endpoint)
    /*
    try {
      const testResponse = await auth.makeAuthenticatedRequest('GET', 'https://some-protected-endpoint.com');
      console.log('🔒 Protected endpoint response:', testResponse.data);
    } catch (error) {
      console.log('⚠️ Protected endpoint test failed (expected if endpoint doesn\'t exist):', error.message);
    }
    */

    // Show final authentication status
    console.log('\n📊 Final Authentication Status:');
    console.log('🔓 Logged in:', auth.isLoggedIn===true);
    console.log('🔒 Fully authenticated:', auth.isFullyAuthenticated===true);
    console.log('🎫 Token available:', !!auth.getAuthToken());

    // Logout
    auth.logout();
    console.log('\n👋 Logged out successfully');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

function getOTPFromUser() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter OTP code: ', (otp) => {
      rl.close();
      resolve(otp.trim());
    });
  });
}

async function testSlotBooking() {
  console.log('🎯 Testing Complete Slot Booking Flow...\n');

  const auth = new PeopleFirstAuth();

  try {
    // For demo purposes, we'll simulate the authentication steps
    // In a real scenario, you would complete the full auth flow first

    console.log('⚠️  Note: This test assumes authentication is already completed');
    console.log('💡 In production, complete login → OTP → token first\n');

    // Test slot availability check
    console.log('🔍 Checking available Zumba slots...');
    const slotsResult = await auth.checkAvailableSlots({
      activityCode: 'GYMM',
      gameDate: '2025-12-08',
      locationCode: 'RIL0000005',
      buildingCode: 'AL2'
    });

    if (slotsResult.success) {
      console.log('✅ Slot check completed!');

      // Find available slots
      const availableSlots = slotsResult.availableSlots.filter(slot => slot.AvailableCount > 0);

      if (availableSlots.length > 0) {
        console.log(`📅 Found ${availableSlots.length} available slot(s)`);

        // For demo, we'll just log the available slots
        // In production, you could automatically book the first available
        availableSlots.forEach(slot => {
          console.log(`  🕐 ${slot.Slots}: ${slot.AvailableCount} spots available`);
        });

        // Example booking (commented out to avoid actual booking)
        /*
        console.log('\n🎯 Booking first available slot...');
        const slotToBook = availableSlots[0];
        const bookingResult = await auth.bookSlot({
          activityCode: 'GYMM',
          gameDate: '2025-12-08',
          slotCode: slotToBook.SlotCode,
          locationCode: 'RIL0000005',
          buildingCode: 'AL2'
        });

        if (bookingResult.success) {
          console.log('✅ Slot booked successfully!');
          console.log(`🎉 You have booked: ${slotToBook.Slots} (${slotToBook.SlotCode})`);
        } else {
          console.log('❌ Booking failed:', bookingResult.error || bookingResult.status);
        }
        */

      } else {
        console.log('❌ No available slots found');
      }

    } else {
      console.log('❌ Slot check failed:', slotsResult.error || slotsResult.status);
    }

  } catch (error) {
    console.error('💥 Slot booking test failed:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Running All Tests...\n');

  console.log('=' .repeat(50));
  console.log('🧪 AUTHENTICATION TEST');
  console.log('=' .repeat(50));
  await testFullAuthentication();

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 SLOT BOOKING TEST');
  console.log('=' .repeat(50));
  await testSlotBooking();
}

runAllTests().catch(console.error);
