import { useState } from 'react'
import API from "../api";
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const STOCKS = ['AAPL','TSLA','MSFT','GOOGL','AMZN','NVDA','META','NFLX','AMD','RELIANCE','TCS','INFY']

export default function BuySellPanel({ onTradeComplete }) {
  const [mode, setMode] = useState('buy')
  const [symbol, setSymbol] = useState('AAPL')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const { updateWallet } = useAuth()

  const handleTrade = async () => {
    if (!quantity || quantity <= 0) return toast.error('Enter a valid quantity')
    setLoading(true)
    try {
      const endpoint = mode === 'buy' ? '/api/trade/buy' : '/api/trade/sell'
      const { data } = await API.post(endpoint, { symbol, quantity: parseInt(quantity) })
      toast.success(data.message)
      updateWallet(data.walletBalance)
      setQuantity('')
      onTradeComplete?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card h-full">
      <h3 className="text-white font-bold text-lg mb-4">⚡ Quick Trade</h3>

      {/* Mode toggle */}
      <div className="flex bg-dark-700 rounded-xl p-1 mb-5">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode==='buy' ? 'bg-brand-500 text-white shadow' : 'text-dark-500 hover:text-white'}`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode==='sell' ? 'bg-red-500 text-white shadow' : 'text-dark-500 hover:text-white'}`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-dark-500 mb-1.5 block">Stock Symbol</label>
          <select
            className="input"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          >
            {STOCKS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-dark-500 mb-1.5 block">Quantity</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 10"
            className="input"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </div>

        <button
          onClick={handleTrade}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 ${
            mode === 'buy' ? 'bg-brand-500 hover:bg-brand-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Processing...
            </span>
          ) : mode === 'buy' ? `Buy ${symbol}` : `Sell ${symbol}`}
        </button>
      </div>

      <div className={`mt-4 p-3 rounded-xl text-xs text-center ${mode==='buy' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
        {mode === 'buy'
          ? '💡 Price deducted from wallet at market rate'
          : '💡 Proceeds added to wallet at market rate'}
      </div>
    </div>
  )
}
