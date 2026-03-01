import { useState, useEffect, useCallback } from 'react'
import { priceService } from '../services/priceService'
import { CONTRACTS } from '../constants'

// Live Sepolia contract addresses
export const LENDING_ADDRESS = CONTRACTS.LENDING.address
export const PUSD_ADDRESS = CONTRACTS.PUSD.address

export const useProtocol = () => {
  const [stats, setStats] = useState({
    totalCollateral: 0,
    totalPUSDMinted: 0,
    activePositions: 0,
    avgCollateralRatio: 0,
    btcPrice: 67450.32,
    priceChange24h: 2.34,
  })

  const [userPosition, setUserPosition] = useState({
    collateralBTC: 0,
    collateralValue: 0,
    mintedAmount: 0,
    hasPosition: false,
    collateralRatio: 0,
    liquidationPrice: 0,
  })

  const [userPUSDBalance, setUserPUSDBalance] = useState(0)

  const fetchProtocolStats = useCallback(async () => {
    try {
      // Get real-time BTC price
      const btcPrice = await priceService.fetchBTCPrice()

      // TODO: Replace with actual Starknet contract calls
      // Simulated data with real BTC price integration
      setStats({
        totalCollateral: 245.67,
        totalPUSDMinted: 8234567.89,
        activePositions: 1247,
        avgCollateralRatio: 187.5,
        btcPrice: btcPrice?.price || 67450.32,
        priceChange24h: btcPrice?.change24h || 2.34,
      })
    } catch (error) {
      console.error('Error fetching protocol stats:', error)
    }
  }, [])

  const fetchUserPosition = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      setUserPosition({
        collateralBTC: 0,
        collateralValue: 0,
        mintedAmount: 0,
        hasPosition: false,
        collateralRatio: 0,
        liquidationPrice: 0,
      })
      return
    }

    try {
      // Get current BTC price
      const currentPrice = priceService.getCurrentPrice()?.price || 67450.32

      // TODO: Replace with actual Starknet contract calls
      // Simulated user position data with dynamic strkBTC pricing
      const mockCollateralBTC = 1.5 // 1.5 strkBTC deposited
      const mockDebtUSD = 28000 // $28k PUSD debt → ~360% collateral ratio

      const collateralValue = priceService.calculateCollateralValue(
        mockCollateralBTC,
        currentPrice,
      )
      const collateralRatio = priceService.calculateCollateralRatio(
        mockCollateralBTC,
        mockDebtUSD,
        currentPrice,
      )
      const liquidationPrice = priceService.getLiquidationPrice(
        mockCollateralBTC,
        mockDebtUSD,
      )

      const mockPosition = {
        collateralBTC: mockCollateralBTC,
        collateralValue: collateralValue,
        mintedAmount: mockDebtUSD,
        hasPosition: true,
        collateralRatio: collateralRatio,
        liquidationPrice: liquidationPrice,
      }

      setUserPosition(mockPosition)
    } catch (error) {
      console.error('Error fetching user position:', error)
    }
  }, [])

  const fetchUserBalance = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      setUserPUSDBalance(0)
      return
    }

    try {
      // TODO: Replace with actual PUSD token balance call
      // Simulated balance
      setUserPUSDBalance(2500.75)
    } catch (error) {
      console.error('Error fetching user balance:', error)
    }
  }, [])

  const updateAfterDeposit = useCallback(() => {
    // Refresh data after successful deposit
    fetchProtocolStats()
  }, [fetchProtocolStats])

  const updateAfterMint = useCallback(
    (mintedAmount) => {
      // Update balances after minting
      setUserPUSDBalance((prev) => prev + mintedAmount)
      setUserPosition((prev) => ({
        ...prev,
        mintedAmount: prev.mintedAmount + mintedAmount,
      }))
      fetchProtocolStats()
    },
    [fetchProtocolStats],
  )

  const repayDebt = useCallback((amount) => {
    const repaid = parseFloat(amount) || 0
    setUserPosition((prev) => {
      const newMinted = Math.max(0, prev.mintedAmount - repaid)
      return {
        ...prev,
        mintedAmount: newMinted,
        hasPosition: newMinted > 0,
        collateralRatio:
          newMinted > 0 ? (prev.collateralValue / newMinted) * 100 : 0,
      }
    })
    setUserPUSDBalance((prev) => Math.max(0, prev - repaid))
  }, [])

  // Fetch initial data and start price monitoring
  useEffect(() => {
    fetchProtocolStats()

    // Start real-time price updates
    priceService.startPriceUpdates((priceData) => {
      if (priceData) {
        setStats((prev) => ({
          ...prev,
          btcPrice: priceData.price,
          priceChange24h: priceData.change24h,
        }))
      }
    }, 30000) // Update every 30 seconds

    // Cleanup price updates on unmount
    return () => {
      priceService.stopPriceUpdates()
    }
  }, [fetchProtocolStats])

  return {
    stats,
    userPosition,
    userPUSDBalance,
    fetchUserPosition,
    fetchUserBalance,
    updateAfterDeposit,
    updateAfterMint,
    repayDebt,
    refreshData: fetchProtocolStats,
    btcPrice: stats.btcPrice,
    priceChange24h: stats.priceChange24h,
  }
}
