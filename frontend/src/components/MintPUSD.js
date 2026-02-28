import React, { useState } from 'react'
import './MintPUSD.css'

const BTC_PRICE_FALLBACK = 67450
const MIN_RATIO = 150

const MintPUSD = ({ userPUSDBalance, onMintSuccess, btcPrice }) => {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastMinted, setLastMinted] = useState(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const price = btcPrice || BTC_PRICE_FALLBACK
  const mintAmt = parseFloat(amount) || 0
  const requiredBTC = mintAmt > 0 ? (mintAmt * (MIN_RATIO / 100)) / price : 0

  const handleMint = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!mintAmt || mintAmt <= 0) {
      setError('Enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1800))
      setLastMinted(mintAmt)
      setSuccess(true)
      setAmount('')
      if (onMintSuccess) onMintSuccess(mintAmt)
    } catch {
      setError('Minting failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='card mint-card'>
      <div className='card-header'>
        <div className='card-title-group'>
          <span className='card-icon'>🏦</span>
          <div>
            <h3 className='card-title'>Mint PrivateUSD</h3>
            <p className='card-sub'>Borrow against your strkBTC</p>
          </div>
        </div>
        <div className='balance-pill'>
          <span className='balance-label'>Balance</span>
          <span className='balance-val'>{userPUSDBalance ?? 0} PUSD</span>
        </div>
      </div>

      <div className='divider' />

      <form onSubmit={handleMint}>
        <div className='form-group'>
          <label>PUSD Amount</label>
          <div className='input-with-tag'>
            <input
              type='number'
              step='0.01'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='0.00'
              required
            />
            <span className='input-tag'>PUSD</span>
          </div>
        </div>

        {mintAmt > 0 && (
          <div className='mint-preview'>
            <div className='preview-row'>
              <span>Required collateral</span>
              <span className='preview-val'>
                {requiredBTC.toFixed(8)} strkBTC
              </span>
            </div>
            <div className='preview-row'>
              <span>Collateral ratio</span>
              <span className='preview-val preview-safe'>{MIN_RATIO}% min</span>
            </div>
          </div>
        )}

        {error && <div className='form-error'>{error}</div>}
        {success && (
          <div className='form-success'>
            ✓ Successfully minted {(lastMinted ?? 0).toFixed(2)} PUSD
          </div>
        )}

        <button
          type='submit'
          className='btn btn-primary btn-full'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className='spinner spinner-dark' />
              Minting…
            </>
          ) : (
            'Mint PUSD'
          )}
        </button>
      </form>
    </div>
  )
}

export default MintPUSD
