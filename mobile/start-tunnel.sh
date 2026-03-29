#!/bin/bash

# Kill any existing ngrok or expo processes
pkill -f ngrok
pkill -f "expo start"

echo "🚀 Starting ngrok tunnel..."

# Start ngrok in background and capture output
ngrok http 8082 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start and get the URL
echo "⏳ Waiting for ngrok to initialize..."
sleep 3

# Get the ngrok tunnel URL from the API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $NGROK_PID
    exit 1
fi

echo "✅ Ngrok tunnel running at: $NGROK_URL"

# Extract the hostname from the URL (remove https://)
NGROK_HOST=$(echo $NGROK_URL | sed 's|https://||')

echo "🎯 Starting Expo with tunnel URL..."
echo "📱 Open the development build and connect to Metro"

# Start Expo with ngrok hostname so the dev client uses the tunnel URL
REACT_NATIVE_PACKAGER_HOSTNAME=$NGROK_HOST npx expo start --dev-client --port 8082

# Cleanup on exit
trap "kill $NGROK_PID" EXIT
