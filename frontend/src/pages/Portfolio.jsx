import { useState, useEffect, useCallback } from 'react'
import API from "../api";
import toast from 'react-hot-toast'

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState({
    stocks: [],
    totalInvestment: 0,
    currentValue: 0,
    profitLoss: 0
  })

  const [loading, setLoading] = useState(true)

  const fetchPortfolio = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await API.get('/api/trade/portfolio')
      setPortfolio(data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load portfolio")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📈 Portfolio</h1>
        <p className="text-dark-500 text-sm">
          Track your investments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-dark-500 text-sm">Total Investment</p>
          <h2 className="text-2xl font-bold text-white">
            ${portfolio.totalInvestment.toFixed(2)}
          </h2>
        </div>

        <div className="card">
          <p className="text-dark-500 text-sm">Current Value</p>
          <h2 className="text-2xl font-bold text-white">
            ${portfolio.currentValue.toFixed(2)}
          </h2>
        </div>

        <div className="card">
          <p className="text-dark-500 text-sm">Profit / Loss</p>
          <h2
            className={`text-2xl font-bold ${
              portfolio.profitLoss >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            ${portfolio.profitLoss.toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700 text-left">
              <th className="py-3 text-dark-500">Symbol</th>
              <th className="py-3 text-dark-500">Company</th>
              <th className="py-3 text-dark-500">Qty</th>
              <th className="py-3 text-dark-500">Buy Price</th>
              <th className="py-3 text-dark-500">Current</th>
              <th className="py-3 text-dark-500">Value</th>
              <th className="py-3 text-dark-500">P/L</th>
            </tr>
          </thead>

          <tbody>
            {portfolio.stocks.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 text-dark-500"
                >
                  No stocks purchased yet.
                </td>
              </tr>
            ) : (
              portfolio.stocks.map((stock) => (
                <tr
                  key={stock._id}
                  className="border-b border-dark-700"
                >
                  <td className="py-4 text-white font-semibold">
                    {stock.symbol}
                  </td>

                  <td className="py-4 text-dark-300">
                    {stock.companyName}
                  </td>

                  <td className="py-4 text-white">
                    {stock.quantity}
                  </td>

                  <td className="py-4 text-white">
                    ${stock.buyPrice.toFixed(2)}
                  </td>

                  <td className="py-4 text-white">
                    ${stock.currentPrice.toFixed(2)}
                  </td>

                  <td className="py-4 text-white">
                    ${stock.totalValue.toFixed(2)}
                  </td>

                  <td
                    className={`py-4 ${
                      stock.profit >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    ${stock.profit.toFixed(2)} ({stock.profitPct}%)
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}