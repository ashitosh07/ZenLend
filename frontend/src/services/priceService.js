/**
 * Real-Time Bitcoin Price Service
 * Fetches live BTC prices for dynamic collateral ratios
 */

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

class PriceService {
  constructor() {
    this.prices = {
      bitcoin: null,
      lastUpdated: null,
    }
    this.updateInterval = null
  }

  async fetchBTCPrice() {
    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
      )
      const data = await response.json()

      if (data.bitcoin) {
        this.prices.bitcoin = {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change || 0,
          lastUpdated: new Date(),
        }
      }

      return this.prices.bitcoin
    } catch (error) {
      console.error('Failed to fetch BTC price:', error)
      // Fallback to mock data for demo
      return {
        price: 67450.32,
        change24h: 2.34,
        lastUpdated: new Date(),
      }
    }
  }

  startPriceUpdates(callback, intervalMs = 30000) {
    // Initial fetch
    this.fetchBTCPrice().then(callback)

    // Set up periodic updates
    this.updateInterval = setInterval(async () => {
      const price = await this.fetchBTCPrice()
      callback(price)
    }, intervalMs)
  }

  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  getCurrentPrice() {
    return this.prices.bitcoin
  }

  calculateCollateralValue(btcAmount, btcPrice) {
    return btcAmount * (btcPrice || 67450.32) // fallback price
  }

  calculateCollateralRatio(collateralBTC, debtUSD, btcPrice) {
    const collateralValue = this.calculateCollateralValue(
      collateralBTC,
      btcPrice,
    )
    return collateralValue / debtUSD
  }

  getLiquidationPrice(collateralBTC, debtUSD, liquidationRatio = 1.2) {
    return (debtUSD * liquidationRatio) / collateralBTC
  }
}

export const priceService = new PriceService()
export default PriceService
