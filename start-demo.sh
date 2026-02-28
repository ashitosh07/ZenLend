#!/bin/bash
# ZenLend One-Click Demo Script (Linux/Mac)
# Competitive advantage: PRIVATE Bitcoin lending vs transparent competitors

echo "🚀 ZenLend - Private strkBTC Lending on Starknet"
echo "==================================================="
echo ""
echo "🆚 COMPETITIVE ADVANTAGE:"
echo "   StarkStorm: Transparent P2P lending (amounts visible)" 
echo "   ZenLend:    Private protocol lending for strkBTC (amounts hidden)"
echo "   strkBTC:    Starknet's official private Bitcoin (Feb 26, 2026)"
echo ""
echo "Starting ZenLend demo..."
echo ""

# Check dependencies  
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Start backend
echo "🐍 Starting Flask backend (ZK commitment generation)..."
cd commitments
python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 3
echo "✅ Backend running on http://localhost:5000"

# Start frontend  
echo "⚛️ Starting React frontend..."
cd frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 ZenLend is starting!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "🔒 PRIVACY FEATURES:"
echo "   • Zero-knowledge collateral hiding"
echo "   • Pedersen commitment generation" 
echo "   • Private governance voting"
echo "   • Real-time BTC price feeds"
echo ""
echo "💰 DUAL-TRACK HACKATHON ELIGIBLE:"
echo "   • Privacy Track: $9,675 (ZK innovation)"
echo "   • Bitcoin Track: $9,675 + $5,500 (BTC DeFi)"
echo "   • Total Prize Potential: $24,850"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait