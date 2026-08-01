import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import API from '../api'

export default function PortfolioTable({ stocks, onUpdate }) {
  const [selling, setSelling] = useState(null)
  const { updateWallet } = useAuth()

  const handleSell = async (symbol, maxQty) => {
    const qty = prompt(`Sell how many shares of ${symbol}? (max ${maxQty})`)
    if (!qty) return
    const q = parseInt(qty)
    if (isNaN(q) || q <= 0 || q > maxQty) return toast.error(`Enter a number between 1 and ${maxQty}`)
    setSelling(symbol)
    try {
      const { data } = await API.post('/api/trade/sell', { symbol, quantity: q })
      toast.success(data.message)
      updateWallet(data.walletBalance)
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sell failed')
    } finally {
      setSelling(null)
    }
  }

  if (!stocks?.length) return (
    <div className="card text-center py-12">
      <p className="text-4xl mb-3">📭</p>
      <p className="text-white font-semibold">No stocks yet</p>
      <p className="text-dark-500 text-sm mt-1">Use Quick Trade to buy your first stock!</p>
    </div>
  )

  return (
    <div className="card overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-dark-700">
        <h3 className="text-white font-bold text-lg">📋 My Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-dark-500 text-xs uppercase tracking-wider border-b border-dark-700">
              <th className="px-5 py-3 text-left">Stock</th>
              <th className="px-5 py-3 text-right">Qty</th>
              <th className="px-5 py-3 text-right">Buy Price</th>
              <th className="px-5 py-3 text-right">Current</th>
              <th className="px-5 py-3 text-right">Total Value</th>
              <th className="px-5 py-3 text-right">P&L</th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => (
              <tr key={s._id || i} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                      <span className="text-brand-400 font-bold text-xs">{s.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{s.symbol}</p>
                      <p className="text-dark-500 text-xs truncate max-w-28">{s.companyName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-white text-sm">{s.quantity}</td>
                <td className="px-5 py-4 text-right text-dark-500 text-sm">${s.buyPrice?.toFixed(2)}</td>
                <td className="px-5 py-4 text-right text-white text-sm font-medium">${s.currentPrice?.toFixed(2)}</td>
                <td className="px-5 py-4 text-right text-white text-sm font-semibold">${s.totalValue?.toFixed(2)}</td>
                <td className="px-5 py-4 text-right">
                  <div className={`text-sm font-semibold ${s.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.profit >= 0 ? '+' : ''}${s.profit?.toFixed(2)}
                    <p className="text-xs opacity-70">{s.profitPct >= 0 ? '+' : ''}{s.profitPct?.toFixed(2)}%</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleSell(s.symbol, s.quantity)}
                    disabled={selling === s.symbol}
                    className="px-4 py-1.5 text-xs font-semibold text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {selling === s.symbol ? '...' : 'Sell'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
