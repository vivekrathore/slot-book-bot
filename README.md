# Slot Book Bot

A Node.js application for booking slots through an API.

## Features

- RESTful API for slot booking
- Health check endpoint
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

## Project Structure

```
slot-book-bot/
├── index.js          # Main application file
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
