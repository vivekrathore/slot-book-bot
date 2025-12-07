const { PeopleFirstAuth } = require('./slot-book');

async function testLogin() {
  console.log('🧪 Testing PeopleFirst Authentication...\n');

  const auth = new PeopleFirstAuth();

  // Test login
  const result = await auth.login('vivek2.rathore', 'AAbb@122');

  if (result.success) {
    console.log('✅ Login successful!');
    console.log('📊 Response data:', JSON.stringify(result.data, null, 2));
    console.log('🍪 Cookies received:', result.cookies.length);

    // Test if authenticated
    console.log('🔍 Is authenticated:', auth.isAuthenticated());

    // Example of making an authenticated request (uncomment when you know the endpoint)
    /*
    try {
      const testResponse = await auth.makeAuthenticatedRequest('GET', 'https://peoplefirst.ril.com/some-protected-endpoint');
      console.log('🔒 Protected endpoint response:', testResponse.data);
    } catch (error) {
      console.log('⚠️ Protected endpoint test failed (expected if endpoint doesn\'t exist):', error.message);
    }
    */

    // Logout
    auth.logout();
    console.log('🔚 Is authenticated after logout:', auth.isAuthenticated());

  } else {
    console.log('❌ Login failed!');
    console.log('📋 Error details:', result);
  }
}

// Run the test
testLogin().catch(console.error);
