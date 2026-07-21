#!/bin/sh
set -e

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo "⏳ Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting Vite Frontend Development Server..."
exec "$@"
