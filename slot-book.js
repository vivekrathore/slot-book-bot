const https = require('https');
const http = require('http');
const { URL } = require('url');

// Simple cookie jar implementation
class SimpleCookieJar {
  constructor() {
    this.cookies = {};
  }

  setCookie(cookieStr, url) {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;

      if (!this.cookies[domain]) {
        this.cookies[domain] = {};
      }

      // Parse cookie string (simplified)
      const parts = cookieStr.split(';')[0].split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        this.cookies[domain][name] = value;
      }
    } catch (error) {
      console.warn('Failed to parse cookie:', cookieStr);
    }
  }

  getCookieString(url) {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      const domainCookies = this.cookies[domain];

      if (!domainCookies) return '';

      return Object.entries(domainCookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    } catch (error) {
      return '';
    }
  }
}

// Create a cookie jar
const cookieJar = new SimpleCookieJar();

// Helper function to make HTTPS requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';

    const requestModule = isHttps ? https : http;

    const defaultOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
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
    };

    // Merge options
    const requestOptions = { ...defaultOptions, ...options };
    if (options.headers) {
      requestOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }

    // Add cookies
    const cookieString = cookieJar.getCookieString(url);
    if (cookieString) {
      requestOptions.headers.Cookie = cookieString;
    }

    // Add authorization header if provided in options
    if (options.headers?.authorization) {
      requestOptions.headers.authorization = options.headers.authorization;
    }

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';

      // Handle cookies from response
      if (res.headers['set-cookie']) {
        const setCookies = Array.isArray(res.headers['set-cookie'])
          ? res.headers['set-cookie']
          : [res.headers['set-cookie']];

        setCookies.forEach(cookieStr => {
          cookieJar.setCookie(cookieStr, url);
        });
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data
          };

          // Try to parse JSON
          try {
            result.data = JSON.parse(data);
          } catch (e) {
            // Keep as string if not JSON
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Send request body if provided
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

class PeopleFirstAuth {
  constructor() {
    this.isLoggedIn = false;
    this.isFullyAuthenticated = false;
    this.sessionCookies = null;
    this.userData = null;
    this.authToken = null;
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

      const response = await makeRequest('https://peoplefirst.ril.com/hrLogin', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: loginData
      });

      // Check if login was successful
      if (response.status === 200) {
        console.log('✅ Login successful!');

        // Store session info
        this.isLoggedIn = true;
        this.userData = response.data?.data;

        return {
          success: true,
          status: response.status,
          data: response.data,
          cookies: cookieJar.cookies,
          requiresOTP: true
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
        status: 'Unknown'
      };
    }
  }

  /**
   * Request OTP after login (Step 2)
   * @param {string} method - 'm' for mobile, 'e' for email (default: 'm')
   * @returns {Promise<Object>} OTP request response
   */
  async requestOTP(method = 'm') {
    if (!this.isLoggedIn) {
      throw new Error('Must login first before requesting OTP');
    }

    try {
      console.log('📱 Requesting OTP...');

      const otpData = {
        flag: method  // m for mobile, e for email
      };

      const response = await makeRequest('https://peoplefirst.ril.com/api/home-i/v2/requestOTP', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: otpData
      });

      if (response.status === 200) {
        console.log('✅ OTP sent successfully!');
        console.log('📲 Please check your mobile for OTP code');

        return {
          success: true,
          status: response.status,
          data: response.data
        };
      } else {
        console.log('❌ OTP request failed with status:', response.status);
        return {
          success: false,
          status: response.status,
          data: response.data
        };
      }

    } catch (error) {
      console.error('❌ OTP request error:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'Unknown'
      };
    }
  }

  /**
   * Verify OTP and complete authentication (Step 3)
   * @param {string} otp - OTP code entered by user
   * @returns {Promise<Object>} OTP verification response
   */
  async verifyOTP(otp) {
    if (!this.isLoggedIn) {
      throw new Error('Must login first before verifying OTP');
    }

    try {
      console.log('🔍 Verifying OTP...');

      const verifyData = {
        otp: otp
      };

      const response = await makeRequest('https://peoplefirst.ril.com/api/home-i/validateOtp', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: verifyData
      });

      if (response.status === 200) {
        console.log('✅ OTP verified! Fully authenticated.');
        this.isFullyAuthenticated = true;

        return {
          success: true,
          status: response.status,
          data: response.data
        };
      } else {
        console.log('❌ OTP verification failed with status:', response.status);
        return {
          success: false,
          status: response.status,
          data: response.data
        };
      }

    } catch (error) {
      console.error('❌ OTP verification error:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'Unknown'
      };
    }
  }

  /**
   * Fetch authentication token (Step 4)
   * @returns {Promise<Object>} Token fetch response
   */
  async fetchToken() {
    if (!this.isFullyAuthenticated) {
      throw new Error('Must complete OTP verification before fetching token');
    }

    try {
      console.log('🎫 Fetching authentication token...');

      const response = await makeRequest('https://peoplefirst.ril.com/gentoken/fetchToken', {
        method: 'GET',
        headers: {
          'applicationCode': 'HR~PMP'
        }
      });

      if (response.status === 200) {
        console.log('✅ Token fetched successfully!');
        this.authToken = response.data?.token || response.data;

        return {
          success: true,
          status: response.status,
          data: response.data,
          token: this.authToken
        };
      } else {
        console.log('❌ Token fetch failed with status:', response.status);
        return {
          success: false,
          status: response.status,
          data: response.data
        };
      }

    } catch (error) {
      console.error('❌ Token fetch error:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'Unknown'
      };
    }
  }

  /**
   * Check available slots for an activity (Step 5)
   * @param {Object} options - Slot search options
   * @param {string} options.activityCode - Activity code (e.g., 'GYMM' for Zumba)
   * @param {string} options.locationCode - Location code (e.g., 'RIL0000005')
   * @param {string} options.buildingCode - Building code (e.g., 'AL2')
   * @param {string} options.gameDate - Date in YYYY-MM-DD format
   * @param {string} options.slotCode - Specific slot code (optional)
   * @param {string} options.proficiency - Proficiency level (default: '2')
   * @returns {Promise<Object>} Available slots response
   */
  async checkAvailableSlots(options = {}) {
    if (!this.authToken) {
      throw new Error('Must fetch authentication token before checking slots');
    }

    const {
      activityCode = 'GYMM',
      locationCode = 'RIL0000005',
      buildingCode = 'AL2',
      gameDate = new Date().toISOString().split('T')[0],
      slotCode = 'SL339',
      proficiency = '2'
    } = options;

    try {
      console.log(`🔍 Checking available slots for ${activityCode} on ${gameDate}...`);

      const slotData = {
        LocationCode: locationCode,
        ActivityCode: activityCode,
        GameDate: gameDate,
        BuildingCode: buildingCode,
        SlotCode: slotCode,
        GameType: '',
        Proficiency: proficiency,
        IsAvailLocker: 0,
        isMultiplayer: 0,
        PlayersDomainID: []
      };

      const response = await makeRequest('https://peoplefirst.ril.com/wpsapi/WPS_NJ_HostJoinGame/1.0.0/hostgame', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${this.authToken}`,
          'content-type': 'application/json'
        },
        body: slotData
      });

      if (response.status === 200 && response.data?.success) {
        console.log('✅ Available slots retrieved successfully!');
        const availableSlots = response.data.data || [];

        console.log(`📅 Found ${availableSlots.length} slot(s):`);
        availableSlots.forEach(slot => {
          console.log(`  🕐 ${slot.Slots}: ${slot.AvailableCount} spots available (Code: ${slot.SlotCode})`);
        });

        return {
          success: true,
          status: response.status,
          data: response.data,
          availableSlots: availableSlots
        };
      } else {
        console.log('❌ Slot check failed with status:', response.status);
        return {
          success: false,
          status: response.status,
          data: response.data
        };
      }

    } catch (error) {
      console.error('❌ Slot check error:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'Unknown'
      };
    }
  }

  /**
   * Book a slot for an activity (Step 6)
   * @param {Object} options - Booking options
   * @param {string} options.activityCode - Activity code (e.g., 'GYMM' for Zumba)
   * @param {string} options.locationCode - Location code
   * @param {string} options.buildingCode - Building code
   * @param {string} options.gameDate - Date in YYYY-MM-DD format
   * @param {string} options.slotCode - Slot code to book
   * @param {string} options.proficiency - Proficiency level
   * @returns {Promise<Object>} Booking response
   */
  async bookSlot(options = {}) {
    if (!this.authToken) {
      throw new Error('Must fetch authentication token before booking slots');
    }

    const {
      activityCode = 'GYMM',
      locationCode = 'RIL0000005',
      buildingCode = 'AL2',
      gameDate = new Date().toISOString().split('T')[0],
      slotCode = 'SL339',
      proficiency = '2'
    } = options;

    try {
      console.log(`🎯 Booking slot ${slotCode} for ${activityCode} on ${gameDate}...`);

      const bookingData = {
        LocationCode: locationCode,
        ActivityCode: activityCode,
        GameDate: gameDate,
        BuildingCode: buildingCode,
        SlotCode: slotCode,
        GameType: '',
        Proficiency: proficiency,
        IsAvailLocker: 0,
        isMultiplayer: 0,
        PlayersDomainID: []
      };

      const response = await makeRequest('https://peoplefirst.ril.com/wpsapi/WPS_NJ_HostJoinGame/1.0.0/hostgame', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${this.authToken}`,
          'content-type': 'application/json'
        },
        body: bookingData
      });

      if (response.status === 200 && response.data?.success) {
        console.log('✅ Slot booked successfully!');

        return {
          success: true,
          status: response.status,
          data: response.data,
          bookedSlot: slotCode
        };
      } else {
        console.log('❌ Slot booking failed with status:', response.status);
        return {
          success: false,
          status: response.status,
          data: response.data
        };
      }

    } catch (error) {
      console.error('❌ Slot booking error:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'Unknown'
      };
    }
  }

  /**
   * Automated slot booking process
   * @param {Object} options - Booking preferences
   * @returns {Promise<Object>} Complete booking result
   */
  async autoBookSlot(options = {}) {
    try {
      console.log('🤖 Starting automated slot booking process...\n');

      // Step 1: Login
      console.log('🔐 Step 1: Login');
      const loginResult = await this.login(options.username || 'vivek2.rathore', options.password || 'AAbb@122');
      if (!loginResult.success) throw new Error('Login failed');

      // Step 2: Request OTP
      console.log('\n📱 Step 2: Requesting OTP');
      const otpResult = await this.requestOTP('m');
      if (!otpResult.success) throw new Error('OTP request failed');

      // Step 3: Verify OTP (would need user input in real scenario)
      console.log('\n🔍 Step 3: OTP verification needed');
      if (!options.otpCode) {
        throw new Error('OTP code required for automated booking');
      }

      const verifyResult = await this.verifyOTP(options.otpCode);
      if (!verifyResult.success) throw new Error('OTP verification failed');

      // Step 4: Fetch token
      console.log('\n🎫 Step 4: Fetching token');
      const tokenResult = await this.fetchToken();
      if (!tokenResult.success) throw new Error('Token fetch failed');

      // Step 5: Check available slots
      console.log('\n🔍 Step 5: Checking available slots');
      const slotsResult = await this.checkAvailableSlots(options);
      if (!slotsResult.success) throw new Error('Slot check failed');

      const availableSlots = slotsResult.availableSlots.filter(slot => slot.AvailableCount > 0);
      if (availableSlots.length === 0) {
        throw new Error('No available slots found');
      }

      // Step 6: Book first available slot
      const slotToBook = availableSlots[0];
      console.log(`\n🎯 Step 6: Booking slot ${slotToBook.SlotCode} (${slotToBook.Slots})`);

      const bookingResult = await this.bookSlot({
        ...options,
        slotCode: slotToBook.SlotCode
      });

      if (!bookingResult.success) throw new Error('Slot booking failed');

      console.log('\n🎉 Automated booking completed successfully!');
      return {
        success: true,
        bookedSlot: slotToBook,
        bookingDetails: bookingResult
      };

    } catch (error) {
      console.error('❌ Automated booking failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current session cookies
   * @returns {Object} Cookie jar object
   */
  getSessionCookies() {
    return cookieJar.cookies;
  }

  /**
   * Check if user has completed basic login
   * @returns {boolean} Login status
   */
  isLoggedIn() {
    return this.isLoggedIn;
  }

  /**
   * Check if user is fully authenticated (login + OTP)
   * @returns {boolean} Full authentication status
   */
  isFullyAuthenticated() {
    return this.isFullyAuthenticated;
  }

  /**
   * Get user data from login response
   * @returns {Object} User information
   */
  getUserData() {
    return this.userData;
  }

  /**
   * Get authentication token
   * @returns {string} Auth token
   */
  getAuthToken() {
    return this.authToken;
  }

  /**
   * Make authenticated requests using the session
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} config - Additional config
   * @returns {Promise} Response object
   */
  async makeAuthenticatedRequest(method, url, config = {}) {
    if (!this.isFullyAuthenticated) {
      throw new Error('Not fully authenticated. Please complete login and OTP verification.');
    }

    try {
      const response = await makeRequest(url, {
        method,
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
    this.isFullyAuthenticated = false;
    this.sessionCookies = null;
    this.userData = null;
    this.authToken = null;
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

  console.log('🚀 Starting PeopleFirst Authentication Flow...\n');

  auth.login(username, password)
    .then(async (loginResult) => {
      if (loginResult.success) {
        console.log('✅ Step 1 - Login successful!');
        console.log('👤 User:', loginResult.data?.data?.employeeName);
        console.log('📧 Email:', loginResult.data?.data?.emailID);

        // Step 2 - Request OTP
        console.log('\n📱 Step 2 - Requesting OTP...');
        const otpResult = await auth.requestOTP();

        if (otpResult.success) {
          console.log('✅ OTP sent! Please enter the OTP code:');

          // Note: In a real application, you'd get OTP from user input
          // For demo purposes, we'll show the flow
          console.log('🔄 Next: Call auth.verifyOTP(otpCode) with the received OTP');

        } else {
          console.log('❌ OTP request failed:', otpResult.error || otpResult.status);
        }

      } else {
        console.log('❌ Step 1 - Login failed:', loginResult.error || loginResult.status);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
    });
}
