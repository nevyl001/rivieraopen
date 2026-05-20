#!/bin/bash

# Test Database Setup Script
# This script sets up the test database for integration testing

set -e

echo "🚀 Setting up test database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start the test database container
echo "📦 Starting PostgreSQL test container..."
docker-compose -f docker-compose.test.yml up -d

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=30
counter=0

until docker exec riviera-open-test-db pg_isready -U testuser -d riviera_open_test > /dev/null 2>&1; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "❌ Error: Database failed to start within ${timeout} seconds"
    docker-compose -f docker-compose.test.yml logs
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
echo "✅ Test database setup complete!"
echo ""
echo "📝 Connection details:"
echo "  Host: localhost"
echo "  Port: 5433"
echo "  Database: riviera_open_test"
echo "  User: testuser"
echo "  Password: testpassword"
echo ""
echo "🔗 Connection string:"
echo "  postgresql://testuser:testpassword@localhost:5433/riviera_open_test"
echo ""
echo "🌐 Database Browser (Adminer):"
echo "  URL: http://localhost:8080"
echo "  System: PostgreSQL"
echo "  Server: postgres-test"
echo "  Username: testuser"
echo "  Password: testpassword"
echo "  Database: riviera_open_test"
echo ""
echo "💡 To run integration tests:"
echo "  npm run test:integration"
echo ""
echo "🛑 To stop the test database:"
echo "  npm run test:db:stop"
