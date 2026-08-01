import { useState, useEffect, useCallback } from 'react'
import API from "../api";
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import StatCard from '../components/StatCard'
import BuySellPanel from '../components/BuySellPanel'
import PortfolioTable from '../components/PortfolioTable'
import { useAuth } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler)

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { grid: { color: '#1e293b' }, ticks: { color: '#475569', font: { size: 11 } } },
    y: { grid: { color: '#1e293b' }, ticks: { color: '#475569', font: { size: 11 }, callback: v => `$${v}` } }
  }
}

const DONUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { color: '#94a3b8', padding: 14, font: { size: 11 } } },
    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: $${ctx.raw.toFixed(2)}` } }
  },
  cutout: '65%'
}

const PALETTE = ['#10b981','#6366f1','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6']

// Fake historical data for portfolio growth chart
const generateHistory = (currentValue) => {
  const months = ['Sep','Oct','Nov','Dec','Jan','Feb','Mar']
  let val = currentValue * 0.72
  return months.map(m => {
    val *= (1 + (Math.random() - 0.35) * 0.08)
    return { month: m, value: parseFloat(val.toFixed(2)) }
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ticker, setTicker] = useState([])

  const fetchPortfolio = useCallback(async () => {
    try {
      const { data } = await API.get('/api/trade/portfolio')
      setPortfolio(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTicker = useCallback(async () => {
    try {
      const { data } = await API.get('/api/trade/market')
      setTicker(data)
    } catch (e) {}
  }, [])

  useEffect(() => {
    fetchPortfolio()
    fetchTicker()
    const interval = setInterval(fetchTicker, 15000)
    return () => clearInterval(interval)
  }, [fetchPortfolio, fetchTicker])

  const pnl = portfolio?.profitLoss || 0
  const history = generateHistory(portfolio?.currentValue || 10000)

  const lineData = {
    labels: history.map(h => h.month),
    datasets: [{
      label: 'Portfolio Value',
      data: history.map(h => h.value),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      fill: true,
      tension: 0.4
    }]
  }

  const donutData = {
    labels: portfolio?.stocks?.map(s => s.symbol) || [],
    datasets: [{
      data: portfolio?.stocks?.map(s => s.totalValue) || [],
      backgroundColor: PALETTE,
      borderColor: '#0a0f1e',
      borderWidth: 3
    }]
  }

  return (
    <div className="min-h-screen">
      {/* Live Ticker */}
      {ticker.length > 0 && (
        <div className="bg-dark-800 border-b border-dark-700 overflow-hidden py-2">
          <div className="flex ticker-track w-max gap-8 px-4">
            {[...ticker, ...ticker].map((s, i) => (
              <span key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="text-white font-semibold">{s.symbol}</span>
                <span className="text-dark-500">${s.price?.toFixed(2)}</span>
                <span className={s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good day, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-dark-500 text-sm mt-0.5">Here's your trading overview</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 border border-dark-600">
            <span className="w-2 h-2 rounded-full bg-brand-500 pulse-dot"/>
            <span className="text-dark-500 text-xs font-medium">Market Open</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Wallet Balance" value={`$${(user?.walletBalance || 0).toFixed(2)}`}
            sub="Available cash" icon="💳" color="blue" />
          <StatCard title="Total Invested" value={`$${(portfolio?.totalInvestment || 0).toFixed(2)}`}
            sub="Across all holdings" icon="📥" color="purple" />
          <StatCard title="Portfolio Value" value={`$${(portfolio?.currentValue || 0).toFixed(2)}`}
            sub="Current market value" icon="💼" color="green" />
          <StatCard
            title="Profit / Loss"
            value={`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
            sub={`${pnl >= 0 ? 'Profitable' : 'In loss'} overall`}
            icon={pnl >= 0 ? '🚀' : '📉'}
            color={pnl >= 0 ? 'green' : 'red'}
            trend={pnl >= 0 ? 'up' : 'down'}
          />
        </div>

        {/* Charts + Trade Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Growth Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">Portfolio Growth</h3>
                <p className="text-dark-500 text-xs mt-0.5">7-month performance</p>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${pnl >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
              </span>
            </div>
            <div className="h-52">
              <Line data={lineData} options={CHART_OPTIONS} />
            </div>
          </div>

          {/* Trade Panel */}
          <BuySellPanel onTradeComplete={fetchPortfolio} />
        </div>

        {/* Portfolio Table + Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="card flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <PortfolioTable stocks={portfolio?.stocks || []} onUpdate={fetchPortfolio} />
            )}
          </div>

          {/* Allocation Donut */}
          <div className="card">
            <h3 className="text-white font-bold mb-1">Asset Allocation</h3>
            <p className="text-dark-500 text-xs mb-4">Portfolio distribution</p>
            {portfolio?.stocks?.length > 0 ? (
              <div className="h-52">
                <Doughnut data={donutData} options={DONUT_OPTIONS} />
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-dark-500 text-sm text-center">
                <div>
                  <p className="text-3xl mb-2">🥧</p>
                  <p>No holdings yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
