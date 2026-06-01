import apiClient from '@/modules/core/lib/apiClient'

export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { correo: email, password })
  return data.data
}

export const register = async (userData) => {
  const { data } = await apiClient.post('/auth/register', {
    nombres: userData.firstName,
    apellidos: userData.lastName,
    correo: userData.email,
    password: userData.password,
    telefono: userData.phone,
    rol: userData.role,
  })
  return data.data
}