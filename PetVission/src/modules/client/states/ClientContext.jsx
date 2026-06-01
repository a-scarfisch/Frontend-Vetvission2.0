import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getMascotasByUsuario } from '@/modules/mascotas/services/mascotasService'
import apiClient from '@/modules/core/lib/apiClient'

const ClientContext = createContext(null)

export const ClientProvider = ({ children }) => {
  const { user } = useAuthContext()
  const [mascotas, setMascotas] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.idUsuario) return

    const fetchAll = async () => {
      try {
        const [mascotasData, citasRes] = await Promise.all([
          getMascotasByUsuario(user.idUsuario),
          apiClient.get(`/citas/usuario/${user.idUsuario}`),
        ])
        setMascotas(mascotasData)
        setCitas(citasRes.data.data ?? [])
      } catch (err) {
        console.error('Error cargando datos del cliente:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [user])

  // helpers para actualizar caché localmente sin llamar al backend
  const addMascota = (mascota) => setMascotas((prev) => [...prev, mascota])
  const updateMascota = (updated) => setMascotas((prev) =>
    prev.map((m) => m.idMascota === updated.idMascota ? updated : m)
  )
  const removeMascota = (id) => setMascotas((prev) =>
    prev.filter((m) => m.idMascota !== id)
  )
  const addCita = (cita) => setCitas((prev) => [...prev, cita])
  const updateCita = (updated) => setCitas((prev) =>
    prev.map((c) => c.idCita === updated.idCita ? updated : c)
  )

  return (
    <ClientContext.Provider value={{
      mascotas, citas, loading,
      addMascota, updateMascota, removeMascota,
      addCita, updateCita,
    }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useClientContext = () => useContext(ClientContext)