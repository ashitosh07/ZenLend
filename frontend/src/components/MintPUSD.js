import React, { useState } from 'react'
import './MintPUSD.css'

const MintPUSD = ({ userPUSDBalance, onMintSuccess }) => {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMint = async (e) => {
    e.preventDefault()

    if (!amount) {
      alert('Please enter an amount to mint')
      return
    }

    const mintAmount = parseFloat(amount)
    if (mintAmount <= 0) {
      alert('Amount must be greater than 0')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Call Starknet contract to mint PUSD
      console.log('Minting PUSD amount:', mintAmount)

      // Simulate minting process
      setTimeout(() => {
        alert(`Successfully minted ${mintAmount} PUSD!`)
        setAmount('')
        setIsLoading(false)
        if (onMintSuccess) {
          onMintSuccess(mintAmount)
        }
      }, 2000)
    } catch (error) {
      console.error('Error minting PUSD:', error)
      alert('Error minting PUSD. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='mint-form'>
      <div className='mint-header'>
        <h3>Mint PrivateUSD</h3>
        <div className='balance-info'>
          Current Balance:{' '}
          <span className='balance-amount'>{userPUSDBalance} PUSD</span>
        </div>
      </div>

      <form onSubmit={handleMint}>
        <div className='form-group'>
          <label>PUSD Amount to Mint</label>
          <input
            type='number'
            step='0.01'
            min='0'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='Enter PUSD amount'
            required
          />
          <div className='mint-info'>
            <small>Collateralization ratio: 150% minimum</small>
          </div>
        </div>

        <div className='mint-preview'>
          <div className='preview-row'>
            <span>Amount to mint:</span>
            <span>{amount || '0'} PUSD</span>
          </div>
          <div className='preview-row'>
            <span>Required collateral:</span>
            <span>
              {amount ? (parseFloat(amount) * 1.5 * 0.00001).toFixed(8) : '0'}{' '}
              strkBTC
            </span>
          </div>
        </div>

        <button type='submit' className='btn btn-primary' disabled={isLoading}>
          {isLoading ? 'Minting...' : 'Mint PUSD'}
        </button>
      </form>
    </div>
  )
}

export default MintPUSD
