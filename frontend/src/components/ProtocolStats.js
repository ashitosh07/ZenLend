import React from 'react'
import './ProtocolStats.css'

const ProtocolStats = ({ stats }) => {
  // Provide default values if stats is undefined or missing properties
  const safeStats = {
    totalCollateral: 0,
    totalPUSDMinted: 0,
    activePositions: 0,
    avgCollateralRatio: 0,
    btcPrice: 67450.32,
    priceChange24h: 2.34,
    ...stats,
  }

  const globalRatio =
    safeStats.totalPUSDMinted > 0
      ? (safeStats.totalCollateral / safeStats.totalPUSDMinted) * 100
      : 0

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatChange = (change) => {
    const formatted = change.toFixed(2)
    return change >= 0 ? `+${formatted}%` : `${formatted}%`
  }

  const getPriceChangeClass = (change) => {
    return change >= 0 ? 'price-positive' : 'price-negative'
  }

  return (
    <>
      {/* BTC Price Header */}
      <div className='btc-price-header'>
        <div className='btc-price-info'>
          <span className='btc-symbol'>₿</span>
          <div className='price-data'>
            <div className='btc-price'>{formatPrice(safeStats.btcPrice)}</div>
            <div className='btc-label'>strkBTC</div>
            <div
              className={`price-change ${getPriceChangeClass(safeStats.priceChange24h)}`}
            >
              {formatChange(safeStats.priceChange24h)} (24h)
            </div>
          </div>
        </div>
        <div className='price-indicator'>
          <div className='live-dot'></div>
          <span>Live</span>
        </div>
      </div>

      {/* Protocol Statistics */}
      <div className='stats-grid' id='protocol-stats'>
        <div className='stat-card'>
          <div className='stat-value'>
            {safeStats.totalCollateral.toFixed(2)}
          </div>
          <div className='stat-label'>Total Collateral (strkBTC)</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>
            {safeStats.totalPUSDMinted.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </div>
          <div className='stat-label'>Total PUSD Minted</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>{globalRatio.toFixed(0)}%</div>
          <div className='stat-label'>Global Collateral Ratio</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>{safeStats.activePositions}</div>
          <div className='stat-label'>Active Positions</div>
        </div>
      </div>
    </>
  )
}

export default ProtocolStats
