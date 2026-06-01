import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'

const AdminContext = createContext(null)

export const AdminProvider = ({ children }) => {
    const [usuarios, setUsuarios] = useState([])
    const [citas, setCitas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [usuariosRes, citasRes] = await Promise.all([
                    apiClient.get('/usuarios'),
                    apiClient.get('/citas'),
                ])
                setUsuarios(usuariosRes.data.data ?? [])
                setCitas(citasRes.data.data ?? [])
            } catch (err) {
                console.error('Error cargando datos del admin:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const updateUsuario = (updated) => setUsuarios((prev) =>
        prev.map((u) => u.idUsuario === updated.idUsuario ? updated : u)
    )

    return (
        <AdminContext.Provider value={{ usuarios, citas, loading, updateUsuario }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdminContext = () => useContext(AdminContext)