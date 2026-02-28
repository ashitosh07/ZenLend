import React from 'react'
import './Header.css'

const Header = ({
  walletConnected,
  userAddress,
  isConnecting,
  isDemoMode,
  onConnect,
  onDisconnect,
  onToggleMode,
  btcPrice,
  priceChange,
}) => {
  const formatPrice = (p) =>
    p
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(p)
      : '$—'

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''

  const changePositive = (priceChange ?? 0) >= 0

  return (
    <header className='navbar'>
      <div className='navbar-inner container'>
        {/* Logo */}
        <div className='navbar-logo'>
          <span className='logo-icon'>₿</span>
          <span className='logo-text'>ZenLend</span>
          <span className='logo-badge'>strkBTC</span>
        </div>

        {/* Live BTC Price */}
        <div className='navbar-price'>
          <span className='price-dot' />
          <span className='price-label'>BTC</span>
          <span className='price-value'>{formatPrice(btcPrice)}</span>
          {priceChange !== undefined && (
            <span className={`price-delta ${changePositive ? 'up' : 'down'}`}>
              {changePositive ? '▲' : '▼'}{' '}
              {Math.abs(priceChange ?? 0).toFixed(2)}%
            </span>
          )}
        </div>

        {/* Wallet Area */}
        <div className='navbar-wallet'>
          <button
            className={`mode-pill ${isDemoMode ? 'demo' : 'prod'}`}
            onClick={onToggleMode}
            disabled={isConnecting}
            title={isDemoMode ? 'Switch to Production' : 'Switch to Demo'}
          >
            {isDemoMode ? 'Demo' : 'Mainnet'}
          </button>

          {walletConnected ? (
            <div className='wallet-connected'>
              <div className='wallet-chip'>
                <span className='wallet-dot' />
                <span className='wallet-addr'>{shortAddress(userAddress)}</span>
              </div>
              <button
                className='btn btn-secondary btn-sm'
                onClick={onDisconnect}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              className='btn btn-primary btn-sm'
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className='spinner spinner-dark' />
                  Connecting…
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
