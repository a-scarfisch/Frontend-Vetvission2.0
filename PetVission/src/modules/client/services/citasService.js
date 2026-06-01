import apiClient from '@/modules/core/lib/apiClient'




export const getCitasByUsuario = async (idUsuario) => {
  const { data } = await apiClient.get(`/citas/usuario/${idUsuario}`)
  return data.data ?? []
}

export const getVeterinarios = async () => {
  const { data } = await apiClient.get('/usuarios/veterinarios')
  return data.data ?? []
}

export const getDisponibilidadVeterinario = async () => {
  const { data } = await apiClient.get('/citas/disponibilidad')
  return data ?? []
}

export const agendarCita = async (citaData) => {
  const { data } = await apiClient.post('/citas', citaData)
  return data
}

export const cancelarCita = async (idCita) => {
  const { data } = await apiClient.patch(`/citas/${idCita}/cancelar`)
  return data.data
}