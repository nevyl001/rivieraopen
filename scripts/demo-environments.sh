#!/bin/bash

# Demo Script - Show both Dev and Prod environments
# This script demonstrates the difference between dev and prod modes

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Environment Demo - Dev vs Prod                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to wait for user
wait_for_user() {
  echo ""
  read -p "Press Enter to continue..."
  echo ""
}

# Check if dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠️  Warning: Port 3000 is already in use"
  echo "Please stop any running dev servers and try again."
  exit 1
fi

echo "This demo will show you both environments:"
echo "  1. DEV mode (mock data, fast)"
echo "  2. PROD mode (SQL database, realistic)"
echo ""
wait_for_user

# ============================================================================
# PART 1: DEV MODE
# ============================================================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PART 1: DEV MODE (Mock Data)                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🔄 Switching to DEV mode..."
npm run env:switch dev > /dev/null 2>&1

echo ""
echo "📊 Current configuration:"
cat .env.local
echo ""

echo "✅ DEV mode configured!"
echo ""
echo "In DEV mode:"
echo "  ✓ Uses mock repositories (in-memory data)"
echo "  ✓ No database required"
echo "  ✓ Fast startup and page loads"
echo "  ✓ Perfect for UI development"
echo ""

echo "💡 To test DEV mode manually:"
echo "  1. Run: npm run dev"
echo "  2. Visit: http://localhost:3000/rankings"
echo "  3. Notice: Instant page load with mock data"
echo ""

wait_for_user

# ============================================================================
# PART 2: PROD MODE
# ============================================================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PART 2: PROD MODE (SQL Database)                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🔄 Switching to PROD mode..."
echo ""

# Check if database is running
if ! docker ps | grep -q riviera-open-test-db; then
  echo "📦 Starting PostgreSQL database..."
  npm run test:db:setup
  echo ""
else
  echo "✅ Database already running"
  echo ""
fi

npm run env:switch prod > /dev/null 2>&1

echo ""
echo "📊 Current configuration:"
cat .env.local
echo ""

echo "✅ PROD mode configured!"
echo ""
echo "In PROD mode:"
echo "  ✓ Uses SQL repositories (PostgreSQL)"
echo "  ✓ Database required (running on port 5433)"
echo "  ✓ Realistic production behavior"
echo "  ✓ Data persists across restarts"
echo ""

echo "💡 To test PROD mode manually:"
echo "  1. Run: npm run dev"
echo "  2. Visit: http://localhost:3000/rankings"
echo "  3. Notice: Data loaded from PostgreSQL"
echo ""

wait_for_user

# ============================================================================
# COMPARISON
# ============================================================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  COMPARISON: Dev vs Prod                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "┌─────────────────┬──────────────────┬──────────────────┐"
echo "│ Feature         │ DEV Mode         │ PROD Mode        │"
echo "├─────────────────┼──────────────────┼──────────────────┤"
echo "│ Data Source     │ In-memory mock   │ PostgreSQL       │"
echo "│ Startup Time    │ Instant          │ +2-3s (DB conn)  │"
echo "│ Page Load       │ ~50ms            │ ~150-300ms       │"
echo "│ Database Needed │ No               │ Yes              │"
echo "│ Data Persists   │ No               │ Yes              │"
echo "│ Best For        │ UI development   │ Integration test │"
echo "└─────────────────┴──────────────────┴──────────────────┘"
echo ""

wait_for_user

# ============================================================================
# QUICK COMMANDS
# ============================================================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Quick Commands Reference                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "Switch Environments:"
echo "  npm run env:switch dev   - Switch to dev mode"
echo "  npm run env:switch prod  - Switch to prod mode"
echo ""

echo "Database Management:"
echo "  npm run test:db:setup    - Start database"
echo "  npm run test:db:stop     - Stop database"
echo "  npm run test:db:reset    - Reset to clean state"
echo ""

echo "Testing:"
echo "  npm test                 - Run unit tests"
echo "  npm run test:integration - Run integration tests"
echo ""

echo "Development:"
echo "  npm run dev              - Start dev server"
echo "  npm run build            - Build for production"
echo ""

# ============================================================================
# CLEANUP
# ============================================================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Demo Complete!                                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "Current environment: PROD (with database running)"
echo ""
echo "What would you like to do?"
echo "  1. Keep PROD mode and database running"
echo "  2. Switch back to DEV mode"
echo "  3. Stop database and switch to DEV mode"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "✅ Keeping PROD mode"
    echo "💡 Run 'npm run dev' to start the server"
    ;;
  2)
    echo ""
    echo "🔄 Switching to DEV mode..."
    npm run env:switch dev > /dev/null 2>&1
    echo "✅ Switched to DEV mode (database still running)"
    echo "💡 Run 'npm run dev' to start the server"
    echo "💡 Run 'npm run test:db:stop' to stop the database"
    ;;
  3)
    echo ""
    echo "🔄 Switching to DEV mode and stopping database..."
    npm run env:switch dev > /dev/null 2>&1
    npm run test:db:stop
    echo "✅ Switched to DEV mode and stopped database"
    echo "💡 Run 'npm run dev' to start the server"
    ;;
  *)
    echo ""
    echo "Invalid choice. No changes made."
    ;;
esac

echo ""
echo "📚 For more information, see: LOCAL_TESTING_GUIDE.md"
echo ""
