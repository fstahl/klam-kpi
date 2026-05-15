#!/bin/sh
set -e

PORT=${PORT:-3000}

echo "Pulling data..."
python3 pull_data.py

echo "Starting server..."
node server.js &
SERVER_PID=$!

until curl -sf "http://localhost:$PORT/api/board-kpi" > /dev/null 2>&1; do
  sleep 0.2
done

echo "Opening browser..."
open "http://localhost:$PORT"

wait $SERVER_PID
