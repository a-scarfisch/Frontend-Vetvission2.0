import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getMascotasByUsuario } from '@/modules/mascotas/services/mascotasService'
import HistorialModal from './HistorialModal'

const MisMascotas = () => {
  const { user } = useAuthContext()
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [historialId, setHistorialId] = useState(null)

  useEffect(() => {
    if (!user?.idUsuario) return
    getMascotasByUsuario(user.idUsuario)
      .then(setMascotas)
      .catch(() => setMascotas([]))
      .finally(() => setLoading(false))
  }, [user])

  const getInicial = (nombre) => nombre?.[0]?.toUpperCase() ?? '?'
  const colores = ['#0ea5e9', '#22c55e', '#f97316', '#8b5cf6', '#e05252', '#1a9e8f']

  return (
    <>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem' }}>🐾 Mis Mascotas</h1>
          <p style={{ fontSize: '.88rem', color: '#4a5568', marginTop: '3px' }}>
            Toda la información de tus mascotas. Haz clic en 📋 para abrir el Historial Clínico
          </p>
        </div>
        <Link to="/client/mascotas/nueva" className="btn btn-teal text-white px-4">
          <i className="bi bi-plus"></i> Agregar mascota
        </Link>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #e2e8f0' }}>
          <h6 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Mis Mascotas</h6>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2" style={{ color: '#1a9e8f' }}></div>
            Cargando mascotas...
          </div>
        ) : mascotas.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem' }}>🐾</div>
            <p style={{ color: '#94a3b8', marginTop: '12px' }}>Aún no tienes mascotas registradas.</p>
            <Link to="/client/mascotas/nueva" className="btn btn-teal text-white mt-2">
              <i className="bi bi-plus me-1"></i> Agregar primera mascota
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Nombre', 'Especie', 'Raza', 'Última Visita', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', fontSize: '.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '.07em', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mascotas.map((m, idx) => (
                  <tr key={m.idMascota ?? idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colores[idx % colores.length], display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '.9rem', color: 'white', flexShrink: 0 }}>
                          {getInicial(m.nombre)}
                        </div>
                        <span style={{ fontWeight: 700, color: '#1a2535' }}>{m.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '.88rem', color: '#4a5568' }}>{m.especie}</td>
                    <td style={{ padding: '16px', fontSize: '.88rem', color: '#4a5568' }}>{m.raza}</td>
                    <td style={{ padding: '16px', fontSize: '.88rem', color: '#4a5568' }}>{m.ultimaVisita ?? '—'}</td>
                    <td style={{ padding: '16px' }}>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => setHistorialId(m.idMascota)}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '.88rem' }}
                          title="Historial Clínico"
                        >📋</button>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '.88rem' }} title="Descargar">📥</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {historialId && <HistorialModal pacienteId={historialId} onClose={() => setHistorialId(null)} />}
    </>
  )
}

export default MisMascotas