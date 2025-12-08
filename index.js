const express = require('express');
const { PeopleFirstAuth } = require('./slot-book');
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

// Slot booking endpoints
app.post('/api/book-slot', async (req, res) => {
  try {
    const auth = new PeopleFirstAuth();
    const { username, password, otpCode, ...bookingOptions } = req.body;

    console.log('🎯 Received slot booking request');

    const result = await auth.autoBookSlot({
      username: username || 'vivek2.rathore',
      password: password || 'AAbb@122',
      otpCode,
      ...bookingOptions
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Slot booked successfully!',
        bookedSlot: result.bookedSlot,
        details: result.bookingDetails
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Slot booking failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Booking API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.get('/api/available-slots', async (req, res) => {
  try {
    // Note: This endpoint would need authentication to work
    // For demo purposes, we'll return mock data
    const mockSlots = [
      {
        SlotCode: 'SL339',
        FromSlot: '20:00',
        ToSlot: '21:00',
        Capacity: 120,
        Slots: '20:00-21:00',
        AvailableCount: 21
      },
      {
        SlotCode: 'SL340',
        FromSlot: '21:00',
        ToSlot: '22:00',
        Capacity: 120,
        Slots: '21:00-22:00',
        AvailableCount: 113
      }
    ];

    res.json({
      success: true,
      message: 'Available slots retrieved (mock data)',
      data: mockSlots,
      note: 'Use POST /api/book-slot with authentication for real booking'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving slots',
      error: error.message
    });
  }
});

app.post('/api/check-slots', async (req, res) => {
  try {
    const auth = new PeopleFirstAuth();
    const { username, password, otpCode, ...slotOptions } = req.body;

    console.log('🔍 Received slot availability request');

    // This would require full authentication in production
    // For now, return mock data
    const mockResult = {
      success: true,
      availableSlots: [
        {
          SlotCode: 'SL339',
          FromSlot: '20:00',
          ToSlot: '21:00',
          Capacity: 120,
          Slots: '20:00-21:00',
          AvailableCount: 21
        }
      ]
    };

    res.json({
      success: true,
      message: 'Slot availability checked (mock data)',
      ...mockResult,
      note: 'Full authentication required for real slot checking'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking slots',
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Slot Booking Bot server running on port ${port}`);
  console.log(`📊 Health check available at: http://localhost:${port}/health`);
});

module.exports = app;
