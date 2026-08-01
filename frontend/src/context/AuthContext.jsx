import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const saved = localStorage.getItem('user')
      if (saved) {
        setUser(JSON.parse(saved))
      }
    }

    setLoading(false)
  }, [token])

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)

    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))

    API.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    delete API.defaults.headers.common['Authorization']
  }

  const updateWallet = (balance) => {
    const updated = { ...user, walletBalance: balance }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateWallet }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)