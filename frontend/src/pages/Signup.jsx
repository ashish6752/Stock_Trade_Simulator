import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from "../api";
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields')
    if (form.password.length < 6) return toast.error('Password must be 6+ characters')
    setLoading(true)
    try {
      const { data } = await API.post('/api/auth/signup', form);
      login(data.user, data.token)
      toast.success(`Account created! Welcome, ${data.user.name}! 🚀`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg glow-green">
            📈
          </div>
          <h1 className="text-3xl font-bold text-white">TradeSim</h1>
          <p className="text-dark-500 mt-1">Start your trading journey</p>
        </div>

        <div className="card glow-green">
          <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-dark-500 text-sm mb-6">Get $10,000 virtual balance instantly</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-dark-500 mb-1.5 block">Full Name</label>
              <input type="text" placeholder="John Doe" className="input"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-dark-500 mb-1.5 block">Email</label>
              <input type="email" placeholder="trader@example.com" className="input"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-dark-500 mb-1.5 block">Password</label>
              <input type="password" placeholder="Min 6 characters" className="input"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Creating...
                </span>
              ) : 'Create Account 🚀'}
            </button>
          </form>

          <p className="text-center text-dark-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>

        <div className="mt-4 p-3 rounded-xl border border-dark-600 bg-dark-800/50 text-center">
          <p className="text-dark-500 text-xs">✅ No real money needed &nbsp;·&nbsp; ✅ Practice risk-free &nbsp;·&nbsp; ✅ Real market prices</p>
        </div>
      </div>
    </div>
  )
}
