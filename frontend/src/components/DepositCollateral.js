import React, { useState } from 'react'
import './DepositCollateral.css'

const DepositCollateral = ({ onDepositSuccess }) => {
  const [amount, setAmount] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeposit = async (e) => {
    e.preventDefault()

    if (!amount || !privateKey) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      // Call Python backend to generate commitment
      const response = await fetch(
        'http://localhost:5000/generate-commitment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            private_key: privateKey,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to generate commitment')
      }

      const { commitment, proof } = await response.json()

      // TODO: Submit to Starknet contract
      console.log('Generated commitment:', commitment)
      console.log('Proof:', proof)

      // Simulate success
      setTimeout(() => {
        alert('Collateral deposited successfully!')
        setAmount('')
        setPrivateKey('')
        setIsLoading(false)
        if (onDepositSuccess) {
          onDepositSuccess()
        }
      }, 2000)
    } catch (error) {
      console.error('Error depositing collateral:', error)
      alert('Error depositing collateral. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='deposit-form'>
      <h3>Deposit strkBTC Collateral</h3>
      <form onSubmit={handleDeposit}>
        <div className='form-group'>
          <label>strkBTC Amount</label>
          <input
            type='number'
            step='0.00000001'
            min='0'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='Enter strkBTC amount'
            required
          />
        </div>
        <div className='form-group'>
          <label>Private Key (for commitment)</label>
          <input
            type='password'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder='Enter private key for commitment'
            required
          />
          <small className='form-note'>
            Used only for generating zero-knowledge proofs of your strkBTC
            collateral
          </small>
        </div>
        <button type='submit' className='btn btn-primary' disabled={isLoading}>
          {isLoading ? 'Generating Proof...' : 'Deposit Collateral'}
        </button>
      </form>
    </div>
  )
}

export default DepositCollateral
