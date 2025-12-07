const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Slot Booking Bot API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Placeholder for booking routes
app.post('/api/book-slot', (req, res) => {
  // TODO: Implement slot booking logic
  res.json({ message: 'Slot booking endpoint - Coming soon!' });
});

app.get('/api/available-slots', (req, res) => {
  // TODO: Implement available slots logic
  res.json({ message: 'Available slots endpoint - Coming soon!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Slot Booking Bot server running on port ${port}`);
  console.log(`📊 Health check available at: http://localhost:${port}/health`);
});

module.exports = app;
