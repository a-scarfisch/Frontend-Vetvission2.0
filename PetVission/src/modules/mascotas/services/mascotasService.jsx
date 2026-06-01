import apiClient from '@/modules/core/lib/apiClient'

export const getMascotasByUsuario = async (idUsuario) => {
  const { data } = await apiClient.get(`/mascotas/usuario/${idUsuario}`)
  return data.data ?? []
}

export const crearMascota = async (mascotaData) => {
  const { data } = await apiClient.post('/mascotas', mascotaData)
  return data.data
}

export const actualizarMascota = async (idMascota, mascotaData) => {
  const { data } = await apiClient.put(`/mascotas/${idMascota}`, mascotaData)
  return data.data
}

export const eliminarMascota = async (idMascota) => {
  const { data } = await apiClient.delete(`/mascotas/${idMascota}`)
  return data.data
}