import React from 'react'
import './ProtocolStats.css'

const ProtocolStats = ({ stats }) => {
  const s = {
    totalCollateral: 0,
    totalPUSDMinted: 0,
    activePositions: 0,
    btcPrice: 67450,
    priceChange24h: 2.34,
    ...stats,
  }

  const globalRatio =
    s.totalPUSDMinted > 0
      ? ((s.totalCollateral * s.btcPrice) / s.totalPUSDMinted) * 100
      : 0

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)

  const STATS = [
    {
      label: 'Total Collateral',
      value: `${fmt(s.totalCollateral)} strkBTC`,
      sub: `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(s.totalCollateral * s.btcPrice)}`,
      icon: '₿',
      color: 'orange',
    },
    {
      label: 'PUSD Minted',
      value: `${fmt(s.totalPUSDMinted)}`,
      sub: 'PrivateUSD',
      icon: '🏦',
      color: 'purple',
    },
    {
      label: 'Collateral Ratio',
      value: globalRatio > 0 ? `${globalRatio.toFixed(0)}%` : '—',
      sub: 'Min 150%',
      icon: '🛡️',
      color: globalRatio > 200 ? 'green' : globalRatio > 150 ? 'yellow' : 'red',
    },
    {
      label: 'Active Positions',
      value: s.activePositions,
      sub: 'Open loans',
      icon: '⚡',
      color: 'green',
    },
  ]

  return (
    <div className='stats-section'>
      <div className='stats-grid'>
        {STATS.map((stat) => (
          <div className={`stat-card stat-${stat.color}`} key={stat.label}>
            <div className='stat-icon'>{stat.icon}</div>
            <div className='stat-body'>
              <div className='stat-value'>{stat.value}</div>
              <div className='stat-label'>{stat.label}</div>
              <div className='stat-sub'>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProtocolStats
