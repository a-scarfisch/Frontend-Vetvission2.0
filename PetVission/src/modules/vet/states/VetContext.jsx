import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import apiClient from '@/modules/core/lib/apiClient'

const VetContext = createContext(null)

export const VetProvider = ({ children }) => {
  const { user } = useAuthContext()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.idUsuario) return

    const fetchAll = async () => {
      try {
        const citasRes = await apiClient.get(`/citas/veterinario/${user.idUsuario}`)
        setCitas(citasRes.data.data ?? [])
      } catch (err) {
        console.error('Error cargando datos del veterinario:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [user])

  const updateCita = (updated) => setCitas((prev) =>
    prev.map((c) => c.idCita === updated.idCita ? updated : c)
  )

  return (
    <VetContext.Provider value={{ citas, loading, updateCita }}>
      {children}
    </VetContext.Provider>
  )
}

export const useVetContext = () => useContext(VetContext)