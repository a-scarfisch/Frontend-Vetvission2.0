import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const MOCK_USER = {
  idUsuario: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  correo: 'juan@test.com',
  contraseña: 'password',
  rol: 'CLIENTE'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : MOCK_USER
  })

  const saveUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearUser = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, saveUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)