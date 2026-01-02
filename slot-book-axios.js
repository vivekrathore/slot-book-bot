const axios = require('axios');
const readline = require('readline');

// Simple cookie jar implementation for axios
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

// Create axios instance with enhanced SSL/TLS support
const client = axios.create({
  timeout: 30000,
  httpsAgent: new (require('https').Agent)({
    rejectUnauthorized: false, // Allow self-signed certificates
    minVersion: 'TLSv1.2', // Use TLS 1.2 minimum
    ciphers: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384'
    ].join(':'),
    secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1
  }),
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
});

// Add request/response interceptors for cookies
client.interceptors.request.use((config) => {
  const cookieString = cookieJar.getCookieString(config.url);
  if (cookieString) {
    config.headers.Cookie = cookieString;
  }
  return config;
});

client.interceptors.response.use((response) => {
  if (response.headers['set-cookie']) {
    const setCookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [response.headers['set-cookie']];

    setCookies.forEach(cookieStr => {
      cookieJar.setCookie(cookieStr, response.config.url);
    });
  }
  return response;
});

class PeopleFirstAuth {
  constructor() {
    this.isLoggedIn = false;
    this.isFullyAuthenticated = false;
    this.sessionCookies = null;
    this.userData = null;
    this.authToken = null;
  }

  async login(username, password) {
    try {
      console.log('🔐 Attempting login to PeopleFirst...');

      const loginData = {
        username: username,
        password: password
      };

      const response = await client.post('https://peoplefirst.ril.com/hrLogin', loginData);

      if (response.status === 200) {
        console.log('✅ Login successful!');

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
        status: error.response?.status || 'Unknown'
      };
    }
  }

  async requestOTP(method = 'm') {
    if (!this.isLoggedIn) {
      throw new Error('Must login first before requesting OTP');
    }

    try {
      console.log('📱 Requesting OTP...');

      const otpData = { flag: method };

      const response = await client.post('https://peoplefirst.ril.com/api/home-i/v2/requestOTP', otpData);

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
        status: error.response?.status || 'Unknown'
      };
    }
  }

  async verifyOTP(otp) {
    if (!this.isLoggedIn) {
      throw new Error('Must login first before verifying OTP');
    }

    try {
      console.log('🔍 Verifying OTP...');

      const verifyData = { otp: otp };

      const response = await client.post('https://peoplefirst.ril.com/api/home-i/validateOtp', verifyData);

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
        status: error.response?.status || 'Unknown'
      };
    }
  }

  async fetchToken() {
    if (!this.isFullyAuthenticated) {
      throw new Error('Must complete OTP verification before fetching token');
    }

    try {
      console.log('🎫 Fetching authentication token...');

      const response = await client.get('https://peoplefirst.ril.com/gentoken/fetchToken', {
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
        status: error.response?.status || 'Unknown'
      };
    }
  }

  // ... rest of the methods remain the same as the original implementation
  // (checkAvailableSlots, bookSlot, autoBookSlot, etc.)
}

// Example usage with axios
if (require.main === module) {
  const auth = new PeopleFirstAuth();

  const username = 'shivam.gangwar';
  const password = 'Gate#2029@143*';

  console.log('🚀 Starting PeopleFirst Authentication Flow with Axios...\n');

  auth.login(username, password)
    .then(async (loginResult) => {
      if (loginResult.success) {
        console.log('✅ Step 1 - Login successful!');
        console.log('👤 User:', loginResult.data?.data?.employeeName);
        console.log('📧 Email:', loginResult.data?.data?.emailID);

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const otp = await new Promise((resolve) => {
          rl.question('Enter OTP code: ', (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });

        console.log('🔄 OTP code received, verifying...');

        const verifyResult = await auth.verifyOTP(otp);
        if (verifyResult.success) {
          console.log('✅ OTP verified!');

          const tokenResult = await auth.fetchToken();
          if (tokenResult.success) {
            console.log('✅ Token fetched!');
            console.log('🎉 Authentication completed successfully!');
          } else {
            console.log('❌ Token fetch failed:', tokenResult.error || tokenResult.status);
          }
        } else {
          console.log('❌ OTP verification failed:', verifyResult.error || verifyResult.status);
        }
      } else {
        console.log('❌ Step 1 - Login failed:', loginResult.error || loginResult.status);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
    });
}

module.exports = { PeopleFirstAuth };

