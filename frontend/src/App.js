import React, { useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import WalletSection from './components/WalletSection'
import ProtocolStats from './components/ProtocolStats'
import DepositCollateral from './components/DepositCollateral'
import MintPUSD from './components/MintPUSD'
import UserPosition from './components/UserPosition'
import Analytics from './components/Analytics'
import PrivateGovernance from './components/PrivateGovernance'
import { useWallet } from './hooks/useWallet'
import { useProtocol } from './hooks/useProtocol'

function App() {
  const wallet = useWallet()
  const protocol = useProtocol()

  // Fetch user data when wallet connects
  useEffect(() => {
    if (wallet.isConnected && wallet.walletAddress) {
      protocol.fetchUserPosition(wallet.walletAddress)
      protocol.fetchUserBalance(wallet.walletAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected, wallet.walletAddress])

  return (
    <div className='app'>
      <div className='container'>
        <Header />

        <WalletSection
          walletConnected={wallet.isConnected}
          userAddress={wallet.walletAddress}
          isConnecting={wallet.isConnecting}
          isDemoMode={wallet.isDemoMode}
          onConnect={wallet.connectWallet}
          onDisconnect={wallet.disconnectWallet}
          onToggleMode={wallet.toggleMode}
        />

        <ProtocolStats stats={protocol.stats} />

        <Analytics />
        <PrivateGovernance />

        {wallet.isConnected && (
          <div className='user-section'>
            {protocol.userPosition.hasPosition && (
              <UserPosition position={protocol.userPosition} />
            )}

            <div className='card-grid'>
              <DepositCollateral
                onDepositSuccess={protocol.updateAfterDeposit}
              />

              <MintPUSD
                userPUSDBalance={protocol.userPUSDBalance}
                onMintSuccess={protocol.updateAfterMint}
              />
            </div>
          </div>
        )}

        {!wallet.isConnected && (
          <div className='welcome-section'>
            <div className='welcome-card'>
              <h2>Welcome to ZenLend</h2>
              <p>
                The first private Bitcoin lending protocol on Starknet. Built
                for the strkBTC era — borrow against your Bitcoin without
                revealing collateral amounts.
              </p>
              <ul className='feature-list'>
                <li>₿ strkBTC collateral with privacy-by-default</li>
                <li>🔒 Zero-knowledge proof verification</li>
                <li>🏦 Mint PrivateUSD (PUSD) stablecoin</li>
                <li>⚡ Cairo-native liquidation engine</li>
                <li>🔑 Viewing key compatible for compliance</li>
              </ul>
              <p className='connect-prompt'>
                Connect your Starknet wallet to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
