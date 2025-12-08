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
    console.log('👤 User:', loginResult.data?.data?.employeeName);
    console.log('📧 Email:', loginResult.data?.data?.emailID);
    console.log('📱 Mobile:', loginResult.data?.data?.mobile_no);

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
    console.log('\n🔍 Step 3: Verifying OTP');
    const verifyResult = await auth.verifyOTP(otp);

    if (verifyResult.success) {
      console.log('✅ Full authentication successful!');
      console.log('🎉 You are now fully authenticated and can access protected endpoints');

      // Test authenticated request (uncomment when you have a real endpoint)
      /*
      try {
        const testResponse = await auth.makeAuthenticatedRequest('GET', 'https://some-protected-endpoint.com');
        console.log('🔒 Protected endpoint response:', testResponse.data);
      } catch (error) {
        console.log('⚠️ Protected endpoint test failed (expected if endpoint doesn\'t exist):', error.message);
      }
      */

      // Show authentication status
      console.log('\n📊 Authentication Status:');
      console.log('🔓 Logged in:', auth.isLoggedIn());
      console.log('🔒 Fully authenticated:', auth.isFullyAuthenticated());

    } else {
      console.log('❌ OTP verification failed!');
      console.log('📋 Error details:', verifyResult);
    }

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

// Run the full authentication test
testFullAuthentication().catch(console.error);
