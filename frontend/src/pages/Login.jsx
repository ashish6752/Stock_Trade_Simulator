import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from "../api"
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      return toast.error('Fill all fields')
    }

    setLoading(true)

    try {
      // Login API
      const { data } = await API.post('/api/auth/login', form)

      // Save user & token
      login(data.user, data.token)

      toast.success(`Welcome back, ${data.user.name}! 🎉`)

      // Redirect
      navigate('/dashboard')
    } catch (err) {
      console.error(err)

      toast.error(
        err.response?.data?.message || 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg glow-green">
            📈
          </div>

          <h1 className="text-3xl font-bold text-white">
            TradeSim
          </h1>

          <p className="text-dark-500 mt-1">
            Stock Trading Simulator
          </p>
        </div>

        {/* Login Card */}
        <div className="card glow-green">

          <h2 className="text-xl font-bold text-white mb-1">
            Welcome Back
          </h2>

          <p className="text-dark-500 text-sm mb-6">
            Sign in to continue trading
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm text-dark-500 mb-1.5 block">
                Email
              </label>

              <input
                type="email"
                className="input"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm text-dark-500 mb-1.5 block">
                Password
              </label>

              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>

          </form>

          <p className="text-center text-dark-500 text-sm mt-5">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Create one
            </Link>
          </p>

        </div>

        <div className="mt-4 p-3 rounded-xl border border-dark-600 bg-dark-800/50 text-center">
          <p className="text-dark-500 text-xs">
            New here?{" "}
            <Link
              to="/signup"
              className="text-brand-400"
            >
              Sign up
            </Link>{" "}
            and receive{" "}
            <span className="text-brand-400 font-semibold">
              $10,000
            </span>{" "}
            virtual balance.
          </p>
        </div>

      </div>
    </div>
  )
}