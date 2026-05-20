#!/bin/bash

# Environment Switcher Script
# Quickly switch between dev and prod environments

set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: npm run env:switch <dev|prod>"
  echo ""
  echo "Examples:"
  echo "  npm run env:switch dev   - Switch to dev mode (mock data)"
  echo "  npm run env:switch prod  - Switch to prod mode (SQL database)"
  exit 1
fi

case $ENV in
  dev)
    echo "🔄 Switching to DEV environment..."
    echo "NEXT_PUBLIC_ENV=dev" > .env.local
    echo "✅ Environment set to DEV"
    echo ""
    echo "📝 Configuration:"
    echo "  - Mode: Development"
    echo "  - Data: Mock repositories (in-memory)"
    echo "  - Database: Not required"
    echo ""
    echo "🚀 Start the server:"
    echo "  npm run dev"
    ;;
    
  prod)
    echo "🔄 Switching to PROD environment..."
    
    # Check if database is running
    if ! docker ps | grep -q riviera-open-test-db; then
      echo "⚠️  Warning: Test database is not running"
      echo ""
      echo "Starting test database..."
      npm run test:db:setup
      echo ""
    fi
    
    cat > .env.local << EOF
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
EOF
    
    echo "✅ Environment set to PROD"
    echo ""
    echo "📝 Configuration:"
    echo "  - Mode: Production"
    echo "  - Data: SQL repositories (PostgreSQL)"
    echo "  - Database: localhost:5433"
    echo ""
    echo "🚀 Start the server:"
    echo "  npm run dev"
    echo ""
    echo "💡 To stop the database:"
    echo "  npm run test:db:stop"
    ;;
    
  *)
    echo "❌ Error: Invalid environment '$ENV'"
    echo ""
    echo "Valid options:"
    echo "  dev   - Development mode with mock data"
    echo "  prod  - Production mode with SQL database"
    exit 1
    ;;
esac

echo ""
echo "⚠️  Remember to restart your dev server for changes to take effect!"
