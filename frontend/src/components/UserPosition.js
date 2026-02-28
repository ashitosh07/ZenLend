import React from 'react'
import './UserPosition.css'

const UserPosition = ({ position }) => {
  const collateralRatio =
    (position.collateralValue / (position.mintedAmount * 1.5)) * 100
  const healthFactor = collateralRatio / 150 // 150% is minimum ratio

  const getHealthStatus = () => {
    if (healthFactor >= 1.5) return { status: 'safe', color: '#2ecc71' }
    if (healthFactor >= 1.2) return { status: 'warning', color: '#f39c12' }
    if (healthFactor >= 1.0) return { status: 'danger', color: '#e74c3c' }
    return { status: 'liquidation', color: '#c0392b' }
  }

  const health = getHealthStatus()

  return (
    <div className='position-card'>
      <div className='position-header'>
        <h3>Your Position</h3>
        <div className={`health-indicator ${health.status}`}>
          <span
            className='health-dot'
            style={{ backgroundColor: health.color }}
          ></span>
          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </div>
      </div>

      <div className='position-stats'>
        <div className='position-row'>
          <span>Collateral Value:</span>
          <span className='value'>${position.collateralValue.toFixed(2)}</span>
        </div>
        <div className='position-row'>
          <span>PUSD Minted:</span>
          <span className='value'>{position.mintedAmount.toFixed(2)} PUSD</span>
        </div>
        <div className='position-row'>
          <span>Collateral Ratio:</span>
          <span className='value' style={{ color: health.color }}>
            {collateralRatio.toFixed(1)}%
          </span>
        </div>
        <div className='position-row'>
          <span>Health Factor:</span>
          <span className='value' style={{ color: health.color }}>
            {healthFactor.toFixed(2)}
          </span>
        </div>
      </div>

      {healthFactor < 1.5 && (
        <div className='position-warning'>
          <p>
            {healthFactor < 1.0
              ? '⚠️ Your position is at risk of liquidation!'
              : '⚠️ Your position health is low. Consider adding more collateral.'}
          </p>
        </div>
      )}

      <div className='position-actions'>
        <button className='btn btn-secondary'>Add Collateral</button>
        <button className='btn btn-outline'>Repay PUSD</button>
      </div>
    </div>
  )
}

export default UserPosition
