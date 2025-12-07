const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Create a cookie jar to maintain session cookies
const cookieJar = new CookieJar();

// Create axios instance with cookie support
const client = wrapper(axios.create({
  jar: cookieJar,
  withCredentials: true,
  headers: {
    'authority': 'peoplefirst.ril.com',
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'content-type': 'application/json',
    'origin': 'https://peoplefirst.ril.com',
    'referer': 'https://peoplefirst.ril.com/v2/',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  }
}));

class PeopleFirstAuth {
  constructor() {
    this.isLoggedIn = false;
    this.sessionCookies = null;
  }

  /**
   * Login to PeopleFirst system
   * @param {string} username - Username for login
   * @param {string} password - Password for login
   * @returns {Promise<Object>} Login response
   */
  async login(username, password) {
    try {
      console.log('🔐 Attempting login to PeopleFirst...');

      const loginData = {
        username: username,
        password: password
      };

      const response = await client.post('https://peoplefirst.ril.com/hrLogin', loginData);

      // Check if login was successful
      if (response.status === 200) {
        console.log('✅ Login successful!');

        // Store cookies for future requests
        this.sessionCookies = await cookieJar.getCookies('https://peoplefirst.ril.com');
        this.isLoggedIn = true;

        // Log the cookies received (for debugging - remove in production)
        console.log('🍪 Session cookies received:', this.sessionCookies.map(cookie => `${cookie.key}=${cookie.value}`));

        return {
          success: true,
          status: response.status,
          data: response.data,
          cookies: this.sessionCookies
        };
      } else {
        console.log('❌ Login failed with status:', response.status);
        return {
          success: false,
          status: response.status,
          data: response.data
        };
      }

    } catch (error) {
      console.error('❌ Login error:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status || 'Unknown'
      };
    }
  }

  /**
   * Get current session cookies
   * @returns {Array} Array of cookie objects
   */
  getSessionCookies() {
    return this.sessionCookies;
  }

  /**
   * Check if user is currently logged in
   * @returns {boolean} Login status
   */
  isAuthenticated() {
    return this.isLoggedIn;
  }

  /**
   * Make authenticated requests using the session
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} Axios response
   */
  async makeAuthenticatedRequest(method, url, config = {}) {
    if (!this.isLoggedIn) {
      throw new Error('Not authenticated. Please login first.');
    }

    try {
      const response = await client.request({
        method,
        url,
        ...config
      });

      return response;
    } catch (error) {
      console.error('❌ Authenticated request failed:', error.message);
      throw error;
    }
  }

  /**
   * Logout and clear session
   */
  logout() {
    this.isLoggedIn = false;
    this.sessionCookies = null;
    console.log('👋 Logged out and cleared session');
  }
}

// Export the authentication class
module.exports = { PeopleFirstAuth };

// Example usage
if (require.main === module) {
  const auth = new PeopleFirstAuth();

  // Replace with actual credentials
  const username = 'vivek2.rathore';
  const password = 'AAbb@122';

  auth.login(username, password)
    .then(result => {
      if (result.success) {
        console.log('🎉 Authentication successful!');
        console.log('📋 Response data:', result.data);
      } else {
        console.log('💥 Authentication failed:', result.error || result.status);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
    });
}
