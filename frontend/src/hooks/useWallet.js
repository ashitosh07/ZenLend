import { useState, useEffect } from 'react'
import { connect } from '@starknet-io/get-starknet'

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true) // Default to demo for hackathon
  const [starknetWallet, setStarknetWallet] = useState(null)

  const connectDemoWallet = async () => {
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a mock wallet address for demo
      const mockAddress = '0x0' + Math.random().toString(16).substr(2, 40)

      setWalletAddress(mockAddress)
      setIsConnected(true)

      // Store in localStorage for persistence
      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAddress', mockAddress)
      localStorage.setItem('walletMode', 'demo')

      console.log('Demo wallet connected:', mockAddress)
    } catch (error) {
      console.error('Error connecting demo wallet:', error)
      throw error
    }
  }

  const connectProductionWallet = async () => {
    try {
      // Connect to Starknet wallet using new API
      const starknet = await connect({
        modalMode: 'canAsk',
        modalTheme: 'system',
      })

      // Check if wallet connection was successful
      if (!starknet) {
        throw new Error(
          'No Starknet wallet detected. Please install Argent X or Braavos.',
        )
      }

      // Enable the wallet connection
      await starknet.enable()

      if (starknet.isConnected && starknet.account) {
        const address = starknet.account.address

        setWalletAddress(address)
        setIsConnected(true)
        setStarknetWallet(starknet)

        // Store in localStorage
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletAddress', address)
        localStorage.setItem('walletMode', 'production')

        console.log('Production wallet connected:', address)
      } else {
        throw new Error('Failed to connect to wallet')
      }
    } catch (error) {
      console.error('Error connecting production wallet:', error)
      throw error
    }
  }

  const connectWallet = async () => {
    // Prevent multiple connections if already connected
    if (isConnected) {
      console.log('Wallet already connected:', walletAddress)
      return
    }

    setIsConnecting(true)

    try {
      if (isDemoMode) {
        await connectDemoWallet()
      } else {
        await connectProductionWallet()
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert(
        `Failed to connect ${isDemoMode ? 'demo' : 'production'} wallet: ${error.message}`,
      )
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress('')
    setStarknetWallet(null)
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletMode')
    console.log('Wallet disconnected')
  }

  const toggleMode = () => {
    // Disconnect current wallet when switching modes
    if (isConnected) {
      disconnectWallet()
    }
    setIsDemoMode(!isDemoMode)
    console.log(`Switched to ${!isDemoMode ? 'demo' : 'production'} mode`)
  }

  // Check for existing connection on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected')
    const savedAddress = localStorage.getItem('walletAddress')
    const savedMode = localStorage.getItem('walletMode')

    if (savedMode) {
      setIsDemoMode(savedMode === 'demo')
    }

    if (wasConnected && savedAddress) {
      setIsConnected(true)
      setWalletAddress(savedAddress)
      console.log(
        `Restored ${savedMode || 'demo'} wallet connection:`,
        savedAddress,
      )
    }
  }, [])

  return {
    isConnected,
    walletAddress,
    isConnecting,
    isDemoMode,
    starknetWallet,
    connectWallet,
    disconnectWallet,
    toggleMode,
  }
}
