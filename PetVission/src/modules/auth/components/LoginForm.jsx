import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAuthContext } from '../states/AuthContext'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleLogin, loading, error } = useAuth()
  const { saveUser } = useAuthContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await handleLogin(email, password)
    if (data) {
      saveUser(data)
      // redirigir según rol
      if (data.rol === 'CLIENTE') window.location.href = '/client/dashboard'
      if (data.rol === 'VETERINARIO') window.location.href = '/vet/dashboard'
      if (data.rol === 'ADMINISTRADOR') window.location.href = '/admin/dashboard'
    }
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

export default LoginForm