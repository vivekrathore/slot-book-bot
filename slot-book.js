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

        return {
          success: true,
          status: response.status,
          data: response.data,
          cookies: cookieJar.cookies
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
   * Get current session cookies
   * @returns {Object} Cookie jar object
   */
  getSessionCookies() {
    return cookieJar.cookies;
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
   * @param {Object} config - Additional config
   * @returns {Promise} Response object
   */
  async makeAuthenticatedRequest(method, url, config = {}) {
    if (!this.isLoggedIn) {
      throw new Error('Not authenticated. Please login first.');
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
