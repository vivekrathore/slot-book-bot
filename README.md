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
Get available slots (placeholder - to be implemented).

## Authentication

The bot includes a PeopleFirst authentication module for accessing RIL's internal systems.

### Usage

```javascript
const { PeopleFirstAuth } = require('./slot-book');

const auth = new PeopleFirstAuth();

// Step 1: Login
const loginResult = await auth.login('username', 'password');

if (loginResult.success) {
  console.log('User:', loginResult.data.data.employeeName);

  // Step 2: Request OTP
  const otpResult = await auth.requestOTP();

  if (otpResult.success) {
    // Step 3: Verify OTP (get OTP from user input)
    const otp = await getUserOTP(); // Implement this function
    const verifyResult = await auth.verifyOTP(otp);

    if (verifyResult.success) {
      // Step 4: Make authenticated requests
      const response = await auth.makeAuthenticatedRequest('GET', 'https://protected-endpoint.com');
    }
  }
}

// Logout
auth.logout();
```

### Testing Authentication

Run the authentication test:
```bash
npm test
```

Or run the login module directly:
```bash
npm run login
```

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
