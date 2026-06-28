#!/bin/bash
export PATH=$PATH:/opt/homebrew/bin:/usr/local/bin
# SchedSim — Start both the C++ engine and React dashboard

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔══════════════════════════════════════╗"
echo "║    SchedSim — CPU Scheduler Suite    ║"
echo "╚══════════════════════════════════════╝"

# 1. Build engine if needed
echo ""
echo "▶ Building C++ Engine..."
cd "$SCRIPT_DIR/engine"
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=. --log-level=WARNING > /dev/null
cmake --build build --parallel 4 > /dev/null
echo "  ✓ Engine built"

# 2. Start engine in background
echo ""
echo "▶ Starting C++ Engine on :8080..."
pkill -f "scheduler_engine" 2>/dev/null || true
./build/scheduler_engine &
ENGINE_PID=$!
echo "  ✓ Engine PID=$ENGINE_PID"
sleep 1

# Check health
HEALTH=$(curl -s http://localhost:8080/health 2>/dev/null || echo '{"status":"error"}')
if echo "$HEALTH" | grep -q '"ok"'; then
    echo "  ✓ Engine healthy"
else
    echo "  ✗ Engine failed to start. Check port 8080."
    exit 1
fi

# 3. Start React dashboard
echo ""
echo "▶ Starting React Dashboard..."
cd "$SCRIPT_DIR/dashboard"
echo ""
echo "══════════════════════════════════════"
echo "  Dashboard → http://localhost:5180"
echo "  Engine    → http://localhost:8080"
echo "══════════════════════════════════════"
echo ""
echo "  Press Ctrl+C to stop both services"
echo ""

trap "kill $ENGINE_PID 2>/dev/null; echo 'Stopped.'" EXIT
npm run dev
