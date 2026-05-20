#!/bin/bash

# Test Database Teardown Script
# This script stops and removes the test database container

set -e

echo "🛑 Stopping test database..."

# Stop and remove the test database container
docker-compose -f docker-compose.test.yml down

echo "✅ Test database stopped!"
echo ""
echo "💡 To remove all data volumes as well, run:"
echo "  docker-compose -f docker-compose.test.yml down -v"
