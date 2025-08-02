#!/bin/bash

# Kill any existing processes on port 3000
echo "Stopping any existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Set environment variables
export NODE_ENV=production
export PORT=3000
export HOSTNAME=0.0.0.0

# Start the application
echo "Starting CV Analyzer Frontend on port 3000..."
npx next start -p 3000 -H 0.0.0.0