import React, { useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import WalletSection from './components/WalletSection'
import ProtocolStats from './components/ProtocolStats'
import DepositCollateral from './components/DepositCollateral'
import MintPUSD from './components/MintPUSD'
import UserPosition from './components/UserPosition'
import { useWallet } from './hooks/useWallet'
import { useProtocol } from './hooks/useProtocol'

function App() {
  const wallet = useWallet()
  const protocol = useProtocol()

  useEffect(() => {
    if (wallet.isConnected && wallet.walletAddress) {
      protocol.fetchUserPosition(wallet.walletAddress)
      protocol.fetchUserBalance(wallet.walletAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected, wallet.walletAddress])

  return (
    <div className='app'>
      <Header
        walletConnected={wallet.isConnected}
        userAddress={wallet.walletAddress}
        isConnecting={wallet.isConnecting}
        isDemoMode={wallet.isDemoMode}
        onConnect={wallet.connectWallet}
        onDisconnect={wallet.disconnectWallet}
        onToggleMode={wallet.toggleMode}
        btcPrice={protocol.stats?.btcPrice}
        priceChange={protocol.stats?.priceChange24h}
      />

      <main className='main'>
        <div className='container'>
          <ProtocolStats stats={protocol.stats} />

          {wallet.isConnected ? (
            <div className='dashboard'>
              {protocol.userPosition.hasPosition && (
                <UserPosition
                  position={protocol.userPosition}
                  onRepay={protocol.repayDebt}
                />
              )}
              <div className='action-grid'>
                <div id='deposit-section'>
                  <DepositCollateral
                    onDepositSuccess={protocol.updateAfterDeposit}
                  />
                </div>
                <MintPUSD
                  userPUSDBalance={protocol.userPUSDBalance}
                  onMintSuccess={protocol.updateAfterMint}
                />
              </div>
            </div>
          ) : (
            <WalletSection
              isDemoMode={wallet.isDemoMode}
              isConnecting={wallet.isConnecting}
              onConnect={wallet.connectWallet}
              onToggleMode={wallet.toggleMode}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
