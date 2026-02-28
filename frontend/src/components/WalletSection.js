import React from 'react'
import './WalletSection.css'

const FEATURES = [
  {
    icon: '🔒',
    title: 'Private Collateral',
    desc: 'Deposit strkBTC without revealing your balance on-chain',
  },
  {
    icon: '⚡',
    title: 'Zero-Knowledge Proofs',
    desc: 'Pedersen commitments verify ownership without exposure',
  },
  {
    icon: '🏦',
    title: 'Mint PrivateUSD',
    desc: 'Borrow PUSD stablecoin against shielded collateral',
  },
]

const WalletSection = ({
  isDemoMode,
  isConnecting,
  onConnect,
  onToggleMode,
}) => {
  return (
    <div className='hero'>
      <div className='hero-content'>
        <div className='hero-badges'>
          <span className='badge badge-orange'>Built on Starknet</span>
          <span className='badge badge-purple'>strkBTC Native</span>
        </div>
        <h1 className='hero-title'>
          Private Bitcoin
          <br />
          <span className='hero-accent'>Lending Protocol</span>
        </h1>
        <p className='hero-sub'>
          Borrow against your strkBTC without revealing collateral amounts.
          Powered by zero-knowledge proofs on Starknet.
        </p>

        <div className='hero-actions'>
          <button
            className='btn btn-primary hero-btn'
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className='spinner spinner-dark' />
                Connecting…
              </>
            ) : (
              `Connect ${isDemoMode ? 'Demo' : 'Starknet'} Wallet`
            )}
          </button>
          <button
            className={`mode-switch ${isDemoMode ? 'is-demo' : ''}`}
            onClick={onToggleMode}
          >
            {isDemoMode
              ? '🎮 Demo mode — click to switch'
              : '🔐 Production mode — click for demo'}
          </button>
        </div>
      </div>

      <div className='feature-cards'>
        {FEATURES.map((f) => (
          <div className='feature-card' key={f.title}>
            <div className='feature-icon'>{f.icon}</div>
            <div>
              <div className='feature-title'>{f.title}</div>
              <div className='feature-desc'>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WalletSection
