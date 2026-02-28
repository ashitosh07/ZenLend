@echo off
REM ZenLend One-Click Demo Script (Windows)
REM Competitive advantage: PRIVATE Bitcoin lending vs transparent competitors

echo 🚀 ZenLend - Private strkBTC Lending on Starknet
echo ===================================================
echo.
echo 🆚 COMPETITIVE ADVANTAGE:
echo    StarkStorm: Transparent P2P lending (amounts visible)
echo    ZenLend:    Private protocol lending for strkBTC (amounts hidden)
echo    strkBTC:    Starknet's official private Bitcoin (Feb 26, 2026)
echo.
echo Starting ZenLend demo...
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
)

REM Start backend
echo 🐍 Starting Flask backend (ZK commitment generation)...
cd commitments
python -m venv .venv 2>nul
call .venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
start /b python app.py
cd ..

REM Wait for backend
timeout /t 3 >nul
echo ✅ Backend running on http://localhost:5000

REM Start frontend
echo ⚛️ Starting React frontend...
cd frontend
npm install >nul 2>&1
start /b npm start
cd ..

echo.
echo 🎉 ZenLend is starting!
echo.
echo 📱 Frontend: http://localhost:3000  
echo 🔧 Backend:  http://localhost:5000
echo.
echo 🔒 PRIVACY FEATURES:
echo    • Zero-knowledge collateral hiding
echo    • Pedersen commitment generation
echo    • Private governance voting  
echo    • Real-time BTC price feeds
echo.
echo 💰 DUAL-TRACK HACKATHON ELIGIBLE:
echo    • Privacy Track: $9,675 (ZK innovation)
echo    • Bitcoin Track: $9,675 + $5,500 (BTC DeFi)
echo    • Total Prize Potential: $24,850
echo.
echo Press any key to open ZenLend in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo 🚀 ZenLend is now running!
echo Close this window to stop the servers.
echo.
pause