import React, { useState } from 'react'
import './UserPosition.css'

const UserPosition = ({ position, onRepay }) => {
  const [repaying, setRepaying] = useState(false)
  const [repayAmount, setRepayAmount] = useState('')
  const [repayMsg, setRepayMsg] = useState('')

  // Correct formula: collateralValue / mintedAmount * 100
  const collateralRatio =
    position.mintedAmount > 0
      ? (position.collateralValue / position.mintedAmount) * 100
      : 999

  const healthFactor = collateralRatio / 150

  const health =
    healthFactor >= 1.5
      ? { label: 'Healthy', cls: 'safe', color: '#10B981', pct: 100 }
      : healthFactor >= 1.2
        ? { label: 'Warning', cls: 'warn', color: '#F59E0B', pct: 65 }
        : { label: 'At Risk', cls: 'danger', color: '#EF4444', pct: 30 }

  const liqPrice =
    position.mintedAmount > 0
      ? (position.mintedAmount * 1.5) / (position.collateralBTC || 1)
      : 0

  const handleAddCollateral = () => {
    document
      .getElementById('deposit-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleRepayConfirm = () => {
    const amt = parseFloat(repayAmount)
    if (!amt || amt <= 0) return
    onRepay && onRepay(Math.min(amt, position.mintedAmount))
    setRepayMsg(
      `Repaid ${Math.min(amt, position.mintedAmount).toFixed(2)} PUSD successfully.`,
    )
    setRepaying(false)
    setRepayAmount('')
    setTimeout(() => setRepayMsg(''), 4000)
  }

  return (
    <div className='card position-card'>
      <div className='card-header'>
        <div className='card-title-group'>
          <span className='card-icon'>📊</span>
          <div>
            <h3 className='card-title'>Your Position</h3>
            <p className='card-sub'>Open lending position</p>
          </div>
        </div>
        <span className={`health-badge health-${health.cls}`}>
          {health.label}
        </span>
      </div>

      <div className='divider' />

      {/* Health bar */}
      <div className='health-bar-section'>
        <div className='health-bar-labels'>
          <span>Health Factor</span>
          <span style={{ color: health.color }} className='health-factor-val'>
            {healthFactor.toFixed(2)}
          </span>
        </div>
        <div className='health-bar-track'>
          <div
            className={`health-bar-fill fill-${health.cls}`}
            style={{ width: `${Math.min(health.pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className='position-stats'>
        <div className='pos-stat'>
          <span className='pos-label'>Collateral Value</span>
          <span className='pos-value'>
            $
            {position.collateralValue?.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className='pos-stat'>
          <span className='pos-label'>PUSD Minted</span>
          <span className='pos-value'>
            {position.mintedAmount?.toFixed(2)} PUSD
          </span>
        </div>
        <div className='pos-stat'>
          <span className='pos-label'>Collateral Ratio</span>
          <span className='pos-value' style={{ color: health.color }}>
            {collateralRatio > 900 ? '∞' : `${collateralRatio.toFixed(0)}%`}
          </span>
        </div>
        <div className='pos-stat'>
          <span className='pos-label'>Liquidation Price</span>
          <span className='pos-value'>
            {liqPrice > 0
              ? `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(liqPrice)}`
              : '—'}
          </span>
        </div>
      </div>

      {health.cls !== 'safe' && (
        <div className={`pos-alert alert-${health.cls}`}>
          {health.cls === 'danger'
            ? '⚠️ Your position is close to liquidation. Add collateral now.'
            : '⚠️ Health is low. Consider adding more strkBTC collateral.'}
        </div>
      )}

      {repayMsg && (
        <div className='pos-alert alert-safe' style={{ marginTop: 0 }}>
          ✅ {repayMsg}
        </div>
      )}

      {repaying && (
        <div className='repay-panel'>
          <div className='form-group' style={{ marginBottom: '0.75rem' }}>
            <label className='form-label'>Amount to repay (PUSD)</label>
            <input
              type='number'
              className='form-input'
              placeholder={`Max ${position.mintedAmount?.toFixed(2)}`}
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              min='0'
              max={position.mintedAmount}
            />
          </div>
          <div className='repay-actions'>
            <button className='btn btn-primary' onClick={handleRepayConfirm}>
              Confirm Repay
            </button>
            <button
              className='btn btn-secondary'
              onClick={() => {
                setRepaying(false)
                setRepayAmount('')
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className='position-actions'>
        <button className='btn btn-secondary' onClick={handleAddCollateral}>
          Add Collateral
        </button>
        <button
          className='btn btn-outline'
          onClick={() => setRepaying((v) => !v)}
        >
          Repay PUSD
        </button>
      </div>
    </div>
  )
}

export default UserPosition
