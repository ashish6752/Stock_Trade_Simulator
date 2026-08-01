import { useState, useEffect } from 'react'
import API from "../api";
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Market() {
  const [market, setMarket] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [buySymbol, setBuySymbol] = useState(null)
  const [qty, setQty] = useState('')
  const [buying, setBuying] = useState(false)

  const { updateWallet } = useAuth()

  const fetchMarket = async () => {
    setLoading(true)

    try {
      const { data } = await API.get('/api/trade/market')
      setMarket(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load market data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarket()

    const interval = setInterval(() => {
      fetchMarket()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const handleBuy = async (symbol) => {
    if (!qty || qty <= 0) {
      return toast.error('Enter valid quantity')
    }

    setBuying(true)

    try {
      const { data } = await API.post('/api/trade/buy', {
        symbol,
        quantity: parseInt(qty),
      })

      toast.success(data.message)
      updateWallet(data.walletBalance)

      setBuySymbol(null)
      setQty('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Buy failed')
    } finally {
      setBuying(false)
    }
  }

  const filtered = market.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Live Market</h1>
          <p className="text-dark-500 text-sm mt-0.5">
            Prices update every 15 seconds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 pulse-dot"></span>
          <span className="text-dark-500 text-xs">Live</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 Search symbol or company..."
        className="input max-w-md mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((stock) => (
            <div
              key={stock.symbol}
              className="card hover:border-brand-500/40 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                    <span className="text-brand-400 font-bold text-sm">
                      {stock.symbol[0]}
                    </span>
                  </div>

                  <div>
                    <p className="text-white font-bold">{stock.symbol}</p>
                    <p className="text-dark-500 text-xs">{stock.name}</p>
                  </div>
                </div>

                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    stock.change >= 0
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}
                >
                  {stock.change >= 0 ? '▲' : '▼'}{' '}
                  {Math.abs(stock.change).toFixed(2)}%
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${stock.price.toFixed(2)}
                  </p>

                  <p
                    className={`text-sm ${
                      stock.change >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {stock.change >= 0 ? '+' : ''}
                    ${(stock.price - stock.basePrice).toFixed(2)} today
                  </p>
                </div>

                {buySymbol === stock.symbol ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="input w-20 py-1.5 text-sm"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      autoFocus
                    />

                    <button
                      onClick={() => handleBuy(stock.symbol)}
                      disabled={buying}
                      className="btn-primary py-1.5 px-3 text-sm"
                    >
                      {buying ? '...' : 'Go'}
                    </button>

                    <button
                      onClick={() => {
                        setBuySymbol(null)
                        setQty('')
                      }}
                      className="text-dark-500 hover:text-white text-lg px-1"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setBuySymbol(stock.symbol)}
                    className="btn-primary py-1.5 px-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}