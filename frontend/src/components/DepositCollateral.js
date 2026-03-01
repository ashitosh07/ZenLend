import React, { useState } from 'react'
import './DepositCollateral.css'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const DepositCollateral = ({ onDepositSuccess }) => {
  const [amount, setAmount] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [proof, setProof] = useState(null)
  const [error, setError] = useState('')

  const handleDeposit = async (e) => {
    e.preventDefault()
    setError('')
    setProof(null)

    if (!amount || !privateKey) {
      setError('Please fill in all fields')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/generate-commitment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          private_key: privateKey,
        }),
      })

      if (!response.ok) throw new Error('Commitment generation failed')

      const data = await response.json()
      setProof(data)

      setTimeout(() => {
        setIsLoading(false)
        setAmount('')
        setPrivateKey('')
        if (onDepositSuccess) onDepositSuccess()
      }, 1500)
    } catch (err) {
      setError('Failed to generate ZK proof. Is the backend running?')
      setIsLoading(false)
    }
  }

  return (
    <div className='card deposit-card'>
      <div className='card-header'>
        <div className='card-title-group'>
          <span className='card-icon'>₿</span>
          <div>
            <h3 className='card-title'>Deposit Collateral</h3>
            <p className='card-sub'>Lock strkBTC to open a position</p>
          </div>
        </div>
        <span className='badge badge-orange'>strkBTC</span>
      </div>

      <div className='divider' />

      <form onSubmit={handleDeposit}>
        <div className='form-group'>
          <label>Amount</label>
          <div className='input-with-tag'>
            <input
              type='text'
              inputMode='decimal'
              value={amount}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val)
              }}
              placeholder='0.00'
              required
            />
            <span className='input-tag'>strkBTC</span>
          </div>
        </div>

        <div className='form-group'>
          <label>Private Key</label>
          <input
            type='password'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder='••••••••••••'
            required
          />
          <span className='form-note'>
            Sent to your local ZK backend to generate a Pedersen commitment —
            never leaves your machine
          </span>
        </div>

        {error && <div className='form-error'>{error}</div>}

        {proof && (
          <div className='proof-badge'>
            <span className='proof-check'>✓</span>
            <div>
              <div className='proof-title'>ZK Commitment Generated</div>
              <div className='proof-hash'>
                {proof.commitment?.slice(0, 20)}…
              </div>
            </div>
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
              Generating Proof…
            </>
          ) : (
            'Deposit strkBTC'
          )}
        </button>
      </form>
    </div>
  )
}

export default DepositCollateral
