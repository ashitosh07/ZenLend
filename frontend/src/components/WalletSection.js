import React from 'react'
import './WalletSection.css'

const WalletSection = ({
  walletConnected,
  userAddress,
  isConnecting,
  isDemoMode,
  onConnect,
  onDisconnect,
  onToggleMode,
}) => {
  return (
    <div className='wallet-section'>
      {/* Mode Toggle */}
      <div className='mode-toggle'>
        <span className='mode-label'>Mode:</span>
        <button
          className={`mode-btn ${isDemoMode ? 'active' : ''}`}
          onClick={onToggleMode}
          disabled={isConnecting}
        >
          {isDemoMode ? '🎮 Demo' : '🔐 Production'}
        </button>
        <span className='mode-description'>
          {isDemoMode ? 'Mock wallet for testing' : 'Real Starknet wallet'}
        </span>
      </div>

      {/* Wallet Connection */}
      <div id='wallet-status'>
        {!walletConnected ? (
          <button
            className={`btn btn-primary ${isConnecting ? 'loading' : ''}`}
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className='spinner'></span>
                Connecting...
              </>
            ) : (
              `Connect ${isDemoMode ? 'Demo' : 'Starknet'} Wallet`
            )}
          </button>
        ) : (
          <>
            <div className='wallet-info'>
              <div className='privacy-indicator'>
                {isDemoMode
                  ? '🎮 Demo Wallet Connected'
                  : '🔐 Starknet Wallet Connected'}
              </div>
              <div className='wallet-address'>
                {userAddress?.substring(0, 10)}...
                {userAddress?.substring(userAddress.length - 8)}
              </div>
            </div>
            <button className='btn btn-secondary' onClick={onDisconnect}>
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default WalletSection
