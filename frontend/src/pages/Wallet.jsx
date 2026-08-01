import { useState, useEffect } from 'react'
import API from "../api";
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'

const PRESETS = [500, 1000, 2500, 5000]

export default function Wallet() {
  const { user, updateWallet } = useAuth()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [portfolio, setPortfolio] = useState(null)

  useEffect(() => {
    API.get('/api/trade/portfolio')
      .then(r => setPortfolio(r.data))
      .catch(() => {})
  }, [])

  const handleAdd = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')
    if (amt > 100000) return toast.error('Max deposit is $100,000')

    setLoading(true)

    try {
      const { data } = await API.post('/api/wallet/add', { amount: amt })

      toast.success(data.message)
      updateWallet(data.walletBalance)
      setAmount('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add funds')
    } finally {
      setLoading(false)
    }
  }

  const totalAssets = (user?.walletBalance || 0) + (portfolio?.currentValue || 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">💳 Wallet</h1>
        <p className="text-dark-500 text-sm mt-0.5">Manage your virtual trading funds</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Cash"
          value={`$${(user?.walletBalance || 0).toFixed(2)}`}
          sub="Ready to invest"
          icon="💵"
          color="green"
        />

        <StatCard
          title="Invested"
          value={`$${(portfolio?.currentValue || 0).toFixed(2)}`}
          sub="In the market"
          icon="📊"
          color="purple"
        />

        <StatCard
          title="Total Assets"
          value={`$${totalAssets.toFixed(2)}`}
          sub="Cash + portfolio"
          icon="🏦"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card">
          <h3 className="text-white font-bold text-lg mb-1">
            Add Virtual Funds
          </h3>

          <p className="text-dark-500 text-sm mb-5">
            Top up your balance to continue trading
          </p>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                  amount === String(p)
                    ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                    : 'border-dark-600 text-dark-500 hover:border-brand-500 hover:text-brand-400'
                }`}
              >
                ${p}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 font-semibold">
              $
            </span>

            <input
              type="number"
              placeholder="Custom amount"
              className="input pl-8"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding funds...
              </span>
            ) : (
              `Add ${amount ? `$${amount}` : 'Funds'} to Wallet`
            )}
          </button>

          <p className="text-dark-500 text-xs text-center mt-3">
            Max single deposit: $100,000
          </p>
        </div>

        <div className="card">
          <h3 className="text-white font-bold text-lg mb-5">
            Balance Overview
          </h3>

          <div className="space-y-4">

            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-dark-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-xl">
                  💵
                </div>

                <div>
                  <p className="text-white font-semibold text-sm">
                    Cash Balance
                  </p>

                  <p className="text-dark-500 text-xs">
                    Available to trade
                  </p>
                </div>
              </div>

              <p className="text-brand-400 font-bold text-lg">
                ${(user?.walletBalance || 0).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-dark-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl">
                  📈
                </div>

                <div>
                  <p className="text-white font-semibold text-sm">
                    Portfolio Value
                  </p>

                  <p className="text-dark-500 text-xs">
                    Current market value
                  </p>
                </div>
              </div>

              <p className="text-purple-400 font-bold text-lg">
                ${(portfolio?.currentValue || 0).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-xl">
                  🏦
                </div>

                <div>
                  <p className="text-white font-semibold text-sm">
                    Net Worth
                  </p>

                  <p className="text-dark-500 text-xs">
                    Cash + investments
                  </p>
                </div>
              </div>

              <p className="text-yellow-400 font-bold text-lg">
                ${totalAssets.toFixed(2)}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}