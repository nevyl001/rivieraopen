#!/bin/bash

# Test Database Reset Script
# This script resets the test database to a clean state

set -e

echo "🔄 Resetting test database..."

# Stop the container
echo "🛑 Stopping container..."
docker-compose -f docker-compose.test.yml down -v

# Start fresh
echo "🚀 Starting fresh container..."
docker-compose -f docker-compose.test.yml up -d

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=30
counter=0

until docker exec riviera-open-test-db pg_isready -U testuser -d riviera_open_test > /dev/null 2>&1; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "❌ Error: Database failed to start within ${timeout} seconds"
    exit 1
  fi
  echo "  Waiting... ($counter/$timeout)"
  sleep 1
done

echo "✅ Database is ready!"

# Run seed data script if it exists
if [ -f "lib/data/migrations/002_seed_data.ts" ]; then
  echo "🌱 Seeding test data..."
  DATABASE_URL="postgresql://testuser:testpassword@localhost:5433/riviera_open_test" \
  npx tsx lib/data/migrations/002_seed_data.ts
  echo "✅ Test data seeded!"
fi

echo ""
echo "✅ Test database reset complete!"
