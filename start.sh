#!/bin/bash

# Vajra - Start Script
# Runs backend and frontend in parallel

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${GREEN}[*] Starting Vajra...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}[*] Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}[WARN] Backend virtual environment not found. Creating it...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo -e "${GREEN}[*] Installing backend dependencies...${NC}"
    pip install -q -r requirements.txt
    cd ..
else
    echo -e "${GREEN}[OK] Backend venv found${NC}"
fi

# Check if node_modules exists for frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[WARN] Frontend dependencies not found. Installing...${NC}"
    if command -v bun &> /dev/null; then
        bun install
    else
        echo -e "${RED}[ERROR] 'bun' command not found. Please install bun first.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[OK] Frontend dependencies found${NC}"
fi

# Function to kill process on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || fuser $port/tcp 2>/dev/null | awk '{print $1}' || echo "")
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}[*] Killing existing process on port $port...${NC}"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Kill any existing processes on ports 8000 and 3000
kill_port 8000
kill_port 3000

# Start backend
echo -e "${GREEN}[*] Starting backend server on port 8000...${NC}"
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}[ERROR] Backend failed to start. Check backend.log for details.${NC}"
    exit 1
fi

# Start frontend
echo -e "${GREEN}[*] Starting frontend server on port 3000...${NC}"
if command -v bun &> /dev/null; then
    bun run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
else
    echo -e "${RED}[ERROR] 'bun' command not found. Please install bun first.${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Wait a moment for frontend to start
sleep 2

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}[ERROR] Frontend failed to start. Check frontend.log for details.${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}[OK] All services started successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}[API] Backend API:  http://localhost:8000${NC}"
echo -e "${GREEN}[API] API Docs:     http://localhost:8000/docs${NC}"
echo -e "${GREEN}[WEB] Frontend:     http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[TIP] The crawler can be started from the frontend UI${NC}"
echo -e "${YELLOW}[*] Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

