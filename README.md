# Slot Book Bot

A Node.js application for booking slots through an API with PeopleFirst authentication.

## Features

- RESTful API for slot booking
- Health check endpoint
- PeopleFirst authentication module
- Cookie-based session management
- Express.js framework
- Basic project structure for scaling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd slot-book-bot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. For production:
```bash
npm start
```

The server will start on port 3000 by default, or you can set the `PORT` environment variable.

## API Endpoints

### GET /
Returns basic information about the API.

### GET /health
Health check endpoint that returns server status.

### POST /api/book-slot
Book a slot (placeholder - to be implemented).

### GET /api/available-slots
Get available slots (returns mock data - use authenticated endpoints for real data).

### POST /api/book-slot
Book a slot automatically with full authentication flow.
```json
{
  "username": "your.username",
  "password": "your_password",
  "otpCode": "123456",
  "activityCode": "GYMM",
  "gameDate": "2025-12-08",
  "locationCode": "RIL0000005",
  "buildingCode": "AL2"
}
```

### POST /api/check-slots
Check available slots for booking (requires authentication).

## Authentication

The bot includes a complete PeopleFirst authentication module for accessing RIL's internal systems with OTP verification.

### Authentication Flow

1. **Login** - Authenticate with username/password
2. **Request OTP** - Send OTP to mobile/email
3. **Verify OTP** - Complete two-factor authentication
4. **Fetch Token** - Get authentication token for API access

### Usage

```javascript
const { PeopleFirstAuth } = require('./slot-book');

const auth = new PeopleFirstAuth();

try {
  // Step 1: Login
  const loginResult = await auth.login('username', 'password');
  if (!loginResult.success) throw new Error('Login failed');

  // Step 2: Request OTP (mobile by default)
  const otpResult = await auth.requestOTP('m'); // 'm' for mobile, 'e' for email
  if (!otpResult.success) throw new Error('OTP request failed');

  // Step 3: Verify OTP (get from user input)
  const verifyResult = await auth.verifyOTP('123456');
  if (!verifyResult.success) throw new Error('OTP verification failed');

  // Step 4: Fetch authentication token
  const tokenResult = await auth.fetchToken();
  if (!tokenResult.success) throw new Error('Token fetch failed');

  // Now fully authenticated - can make protected requests
  const response = await auth.makeAuthenticatedRequest('GET', 'https://protected-endpoint.com');

} catch (error) {
  console.error('Authentication failed:', error.message);
} finally {
  auth.logout(); // Clean up session
}
```

## Slot Booking

The bot includes automated slot booking functionality for activities like Zumba.

### Booking Flow

1. **Authenticate** - Complete login, OTP, and token steps
2. **Check Availability** - Find available slots for desired activity/date
3. **Book Slot** - Automatically book the first available slot

### Usage

```javascript
const { PeopleFirstAuth } = require('./slot-book');

const auth = new PeopleFirstAuth();

// Automated booking (requires OTP)
const result = await auth.autoBookSlot({
  username: 'your.username',
  password: 'your_password',
  otpCode: '123456',
  activityCode: 'GYMM',    // Zumba/Gym activity
  gameDate: '2025-12-08', // Date to book
  locationCode: 'RIL0000005',
  buildingCode: 'AL2'
});

if (result.success) {
  console.log('✅ Slot booked:', result.bookedSlot.Slots);
}

// Manual booking (after authentication)
const slots = await auth.checkAvailableSlots({
  activityCode: 'GYMM',
  gameDate: '2025-12-08'
});

if (slots.availableSlots.length > 0) {
  const booking = await auth.bookSlot({
    slotCode: slots.availableSlots[0].SlotCode,
    activityCode: 'GYMM',
    gameDate: '2025-12-08'
  });
}
```

**Demo Mode**: When using `demo-token-for-testing`, the methods return mock data for testing without real API calls.

### Activity Codes

- `SWIM` - Swimming activities (default)
- `ZUMB` - Zumba activities
- `GYMM` - Gym activities
- Other codes may be available for different activities

### Default Configuration

- **Activity**: Swimming (`SWIM`)
- **Location**: RIL Mumbai (`RIL0000005`)
- **Building**: AL13 (`AL13`)
- **Date**: Tomorrow's date
- **Slot**: First available slot

### Testing

Run the complete test suite (authentication + slot booking):
```bash
npm test
```

This will test:
- Authentication flow (may fail in sandbox due to network restrictions)
- Slot availability checking with demo data
- Slot booking simulation

Or run the authentication module directly:
```bash
npm run auth
```

### Complete Workflow

Run the full booking workflow with OTP input:
```bash
node slot-book.js
```

This will:
1. Login with your credentials
2. Request OTP to your mobile
3. Prompt for OTP input
4. Verify OTP and fetch token
5. Check available Zumba slots for tomorrow
6. Book the first available slot

### Troubleshooting SSL Issues

If you encounter SSL/TLS handshake errors:

1. **Check your Node.js version**: Ensure you're using Node.js 16+ for better TLS support
2. **Network connectivity**: Ensure you can access `peoplefirst.ril.com` from your network
3. **Corporate proxy**: You may need to configure proxy settings if behind a corporate firewall
4. **VPN**: Some corporate systems require VPN access

#### Alternative: Using Axios (if built-in HTTPS fails)

If the built-in HTTPS client continues to fail, we provide an axios-based alternative:

```bash
npm install axios
npm run auth-axios  # Use axios version
```

The axios version (`slot-book-axios.js`) includes enhanced SSL/TLS configuration that may work better with corporate systems.

**Note**: Tests include demo authentication for slot booking functionality when real authentication fails in sandbox environments.

## Project Structure

```
slot-book-bot/
├── index.js          # Main Express.js application
├── slot-book.js      # PeopleFirst authentication module
├── test-login.js     # Authentication testing script
├── package.json      # Dependencies and scripts
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload (requires nodemon)
- `npm test` - Run tests (placeholder)

### Adding Dependencies

To add new dependencies:

```bash
npm install <package-name>
```

For development dependencies:

```bash
npm install <package-name> --save-dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
