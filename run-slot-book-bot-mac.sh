#!/bin/bash

echo "========================================"
echo "  PeopleFirst Slot Booking Bot"
echo "========================================"
echo ""

# Check if executable exists
if [ ! -f "slot-book-bot-mac" ]; then
    echo "ERROR: slot-book-bot-mac not found!"
    echo "Please run 'npm run build-mac' first to create the executable."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Starting Slot Booking Bot..."
echo ""

# Make executable if not already
chmod +x slot-book-bot-mac

# Run the executable
./slot-book-bot-mac

echo ""
echo "Press Enter to exit..."
read -p ""

