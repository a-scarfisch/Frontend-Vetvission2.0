import { useState } from 'react'
import { login, register } from '../services/authService'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await register(userData)
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return { handleLogin, handleRegister, handleLogout, loading, error }
}