import React, { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import './Analytics.css'

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')

  // Chart refs
  const tvlChartRef = useRef(null)
  const volumeChartRef = useRef(null)
  const utilityChartRef = useRef(null)
  const privacyChartRef = useRef(null)

  // Chart instances
  const tvlChart = useRef(null)
  const volumeChart = useRef(null)
  const utilityChart = useRef(null)
  const privacyChart = useRef(null)

  useEffect(() => {
    loadAnalyticsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe])

  const loadAnalyticsData = () => {
    setLoading(true)

    // Simulate analytics data (in production, fetch from backend)
    setTimeout(() => {
      const data = generateMockAnalytics(timeframe)
      setAnalyticsData(data)
      setLoading(false)
    }, 1000)
  }

  const generateMockAnalytics = (timeframe) => {
    const days =
      timeframe === '24h'
        ? 1
        : timeframe === '7d'
          ? 7
          : timeframe === '30d'
            ? 30
            : 90
    const points = timeframe === '24h' ? 24 : days

    const labels = []
    const tvlData = []
    const volumeData = []
    const utilityData = []
    const privacyData = []

    for (let i = 0; i < points; i++) {
      let label
      if (timeframe === '24h') {
        label = `${i}:00`
      } else {
        const date = new Date()
        date.setDate(date.getDate() - (points - 1 - i))
        label = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }
      labels.push(label)

      // Generate realistic trending data
      const baseTVL = 1250000
      const growth = (i / points) * 0.3 // 30% growth over period
      tvlData.push(Math.floor(baseTVL * (1 + growth + Math.random() * 0.1)))

      const baseVolume = 45000
      volumeData.push(Math.floor(baseVolume * (0.8 + Math.random() * 0.4)))

      utilityData.push(Math.floor(75 + Math.random() * 20)) // 75-95% utilization

      privacyData.push(Math.floor(95 + Math.random() * 5)) // 95-100% privacy score
    }

    return {
      overview: {
        totalValueLocked: tvlData[tvlData.length - 1],
        totalVolume24h: volumeData[volumeData.length - 1],
        activeLoans: 127,
        privacyScore: 98.5,
        protocolUtilization: 87.3,
        totalUsers: 1847,
        averageAPY: 12.4,
        liquidationRatio: 150,
      },
      charts: {
        tvl: { labels, data: tvlData },
        volume: { labels, data: volumeData },
        utility: { labels, data: utilityData },
        privacy: { labels, data: privacyData },
      },
    }
  }

  useEffect(() => {
    if (analyticsData && !loading) {
      createCharts()
    }

    return () => {
      // Cleanup charts
      if (tvlChart.current) tvlChart.current.destroy()
      if (volumeChart.current) volumeChart.current.destroy()
      if (utilityChart.current) utilityChart.current.destroy()
      if (privacyChart.current) privacyChart.current.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsData, loading])

  const createCharts = () => {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#333',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#888',
          },
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#888',
          },
        },
      },
    }

    // TVL Chart
    if (tvlChartRef.current) {
      const ctx = tvlChartRef.current.getContext('2d')
      tvlChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analyticsData.charts.tvl.labels,
          datasets: [
            {
              data: analyticsData.charts.tvl.data,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y: {
              ...chartOptions.scales.y,
              ticks: {
                ...chartOptions.scales.y.ticks,
                callback: function (value) {
                  return '$' + (value / 1000000).toFixed(1) + 'M'
                },
              },
            },
          },
        },
      })
    }

    // Volume Chart
    if (volumeChartRef.current) {
      const ctx = volumeChartRef.current.getContext('2d')
      volumeChart.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: analyticsData.charts.volume.labels,
          datasets: [
            {
              data: analyticsData.charts.volume.data,
              backgroundColor: 'rgba(76, 175, 80, 0.8)',
              borderColor: '#4CAF50',
              borderWidth: 1,
            },
          ],
        },
        options: {
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y: {
              ...chartOptions.scales.y,
              ticks: {
                ...chartOptions.scales.y.ticks,
                callback: function (value) {
                  return '$' + (value / 1000).toFixed(0) + 'K'
                },
              },
            },
          },
        },
      })
    }

    // Utility Chart
    if (utilityChartRef.current) {
      const ctx = utilityChartRef.current.getContext('2d')
      utilityChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analyticsData.charts.utility.labels,
          datasets: [
            {
              data: analyticsData.charts.utility.data,
              borderColor: '#FF9800',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y: {
              ...chartOptions.scales.y,
              min: 0,
              max: 100,
              ticks: {
                ...chartOptions.scales.y.ticks,
                callback: function (value) {
                  return value + '%'
                },
              },
            },
          },
        },
      })
    }

    // Privacy Chart
    if (privacyChartRef.current) {
      const ctx = privacyChartRef.current.getContext('2d')
      privacyChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analyticsData.charts.privacy.labels,
          datasets: [
            {
              data: analyticsData.charts.privacy.data,
              borderColor: '#9C27B0',
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y: {
              ...chartOptions.scales.y,
              min: 90,
              max: 100,
              ticks: {
                ...chartOptions.scales.y.ticks,
                callback: function (value) {
                  return value + '%'
                },
              },
            },
          },
        },
      })
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toFixed(2)}`
    }
  }

  if (loading) {
    return (
      <div className='analytics-section'>
        <div className='analytics-header'>
          <h2>Protocol Analytics</h2>
          <div className='loading-spinner'>
            <div className='spinner'></div>
            <span>Loading analytics data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='analytics-section'>
      <div className='analytics-header'>
        <h2>Protocol Analytics</h2>
        <div className='timeframe-selector'>
          {['24h', '7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              className={`timeframe-btn ${timeframe === period ? 'active' : ''}`}
              onClick={() => setTimeframe(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className='metrics-grid'>
        <div className='metric-card'>
          <div className='metric-icon'>📊</div>
          <div className='metric-content'>
            <div className='metric-label'>Total Value Locked</div>
            <div className='metric-value'>
              {formatCurrency(analyticsData.overview.totalValueLocked)}
            </div>
            <div className='metric-change positive'>
              +15.3% from last {timeframe}
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>💰</div>
          <div className='metric-content'>
            <div className='metric-label'>24h Volume</div>
            <div className='metric-value'>
              {formatCurrency(analyticsData.overview.totalVolume24h)}
            </div>
            <div className='metric-change positive'>+8.7% from yesterday</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>🏦</div>
          <div className='metric-content'>
            <div className='metric-label'>Active Loans</div>
            <div className='metric-value'>
              {analyticsData.overview.activeLoans}
            </div>
            <div className='metric-change positive'>+12 new loans</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>🔒</div>
          <div className='metric-content'>
            <div className='metric-label'>Privacy Score</div>
            <div className='metric-value'>
              {analyticsData.overview.privacyScore}%
            </div>
            <div className='metric-change neutral'>
              Zero-knowledge proofs active
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>⚡</div>
          <div className='metric-content'>
            <div className='metric-label'>Protocol Utilization</div>
            <div className='metric-value'>
              {analyticsData.overview.protocolUtilization}%
            </div>
            <div className='metric-change positive'>Optimal range</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>👥</div>
          <div className='metric-content'>
            <div className='metric-label'>Total Users</div>
            <div className='metric-value'>
              {analyticsData.overview.totalUsers}
            </div>
            <div className='metric-change positive'>+47 this week</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>📈</div>
          <div className='metric-content'>
            <div className='metric-label'>Average APY</div>
            <div className='metric-value'>
              {analyticsData.overview.averageAPY}%
            </div>
            <div className='metric-change positive'>Competitive rates</div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-icon'>🛡️</div>
          <div className='metric-content'>
            <div className='metric-label'>Liquidation Ratio</div>
            <div className='metric-value'>
              {analyticsData.overview.liquidationRatio}%
            </div>
            <div className='metric-change neutral'>Conservative safety</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='charts-grid'>
        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Total Value Locked</h3>
            <div className='chart-info'>
              <span className='chart-metric'>
                {formatCurrency(analyticsData.overview.totalValueLocked)}
              </span>
              <span className='chart-trend positive'>↗ +15.3%</span>
            </div>
          </div>
          <div className='chart-wrapper'>
            <canvas ref={tvlChartRef}></canvas>
          </div>
        </div>

        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Trading Volume</h3>
            <div className='chart-info'>
              <span className='chart-metric'>
                {formatCurrency(analyticsData.overview.totalVolume24h)}
              </span>
              <span className='chart-trend positive'>↗ +8.7%</span>
            </div>
          </div>
          <div className='chart-wrapper'>
            <canvas ref={volumeChartRef}></canvas>
          </div>
        </div>

        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Protocol Utilization</h3>
            <div className='chart-info'>
              <span className='chart-metric'>
                {analyticsData.overview.protocolUtilization}%
              </span>
              <span className='chart-trend neutral'>→ Stable</span>
            </div>
          </div>
          <div className='chart-wrapper'>
            <canvas ref={utilityChartRef}></canvas>
          </div>
        </div>

        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Privacy Score</h3>
            <div className='chart-info'>
              <span className='chart-metric'>
                {analyticsData.overview.privacyScore}%
              </span>
              <span className='chart-trend positive'>🔒 Maximum Privacy</span>
            </div>
          </div>
          <div className='chart-wrapper'>
            <canvas ref={privacyChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className='insights-section'>
        <h3>Protocol Insights</h3>
        <div className='insights-grid'>
          <div className='insight-card'>
            <div className='insight-header'>
              <span className='insight-icon'>🚀</span>
              <h4>Growth Trajectory</h4>
            </div>
            <p>
              ZenLend is experiencing strong growth with{' '}
              {formatCurrency(analyticsData.overview.totalValueLocked)} TVL and
              consistent user adoption.
            </p>
          </div>

          <div className='insight-card'>
            <div className='insight-header'>
              <span className='insight-icon'>🔐</span>
              <h4>Privacy Leadership</h4>
            </div>
            <p>
              Maintaining industry-leading {analyticsData.overview.privacyScore}
              % privacy score through zero-knowledge proof integration.
            </p>
          </div>

          <div className='insight-card'>
            <div className='insight-header'>
              <span className='insight-icon'>⚖️</span>
              <h4>Risk Management</h4>
            </div>
            <p>
              Conservative {analyticsData.overview.liquidationRatio}%
              collateralization ratio ensures protocol safety during market
              volatility.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
