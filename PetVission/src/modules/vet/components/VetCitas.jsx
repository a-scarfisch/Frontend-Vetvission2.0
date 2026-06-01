import { useState } from 'react'
import { useVetContext } from '@/modules/vet/states/VetContext'
import VetLayout from './VetLayout'
import apiClient from '@/modules/core/lib/apiClient'

const ESTADOS = ['Todas', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'REPROGRAMADA']

const estadoEstilo = {
  CONFIRMADA: { background: '#d1fae5', color: '#065f46' },
  PENDIENTE: { background: '#fef3c7', color: '#92400e' },
  CANCELADA: { background: '#fee2e2', color: '#991b1b' },
  REPROGRAMADA: { background: '#e0e7ff', color: '#3730a3' },
}

const VetCitas = () => {
  const { citas, updateCita } = useVetContext()
  const [filtro, setFiltro] = useState('Todas')
  const [loadingId, setLoadingId] = useState(null)
  const [reprogramando, setReprogramando] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  const citasFiltradas = filtro === 'Todas'
    ? citas
    : citas.filter((c) => c.estado === filtro)

  const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

  const handleCancelar = async (idCita) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return
    setLoadingId(idCita)
    try {
      const { data } = await apiClient.patch(`/citas/${idCita}/cancelar`)
      updateCita(data.data)
    } catch {
      alert('Error al cancelar la cita')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReprogramar = async (idCita) => {
    if (!nuevaFecha || !nuevaHora) return
    setLoadingId(idCita)
    try {
      const { data } = await apiClient.patch(`/citas/${idCita}/reprogramar`, {
        nuevaFecha,
        nuevaHora: `${nuevaHora}:00`,
      })
      updateCita(data.data)
      setReprogramando(null)
      setNuevaFecha('')
      setNuevaHora('')
    } catch {
      alert('Error al reprogramar la cita')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <VetLayout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>📅 Mis Citas</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Gestiona todas tus citas
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            style={{
              padding: '8px 16px', borderRadius: '99px', fontSize: '13px',
              cursor: 'pointer', fontWeight: filtro === e ? 600 : 400,
              background: filtro === e ? '#2a9d8f' : '#fff',
              color: filtro === e ? '#fff' : '#374151',
              border: filtro === e ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Listado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {citasFiltradas.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '48px',
            textAlign: 'center', color: '#9ca3af',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📅</p>
            <p>No hay citas {filtro !== 'Todas' ? filtro.toLowerCase() + 's' : ''}.</p>
          </div>
        ) : (
          citasFiltradas.map((c) => (
            <div key={c.idCita}>
              <div style={{
                background: '#fff', borderRadius: '12px', padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: '20px',
              }}>
                {/* Fecha */}
                <div style={{
                  minWidth: '56px', textAlign: 'center',
                  background: '#e8f5f0', borderRadius: '10px', padding: '10px 8px',
                }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#2a9d8f' }}>
                    {c.fecha?.split('-')[2]}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#2a9d8f', textTransform: 'uppercase' }}>
                    {new Date(c.fecha).toLocaleDateString('es-CL', { month: 'short' })}
                  </p>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>
                    {c.motivo ?? 'Consulta general'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    🕐 {formatHora(c.hora)} · 👤 {c.nombreCliente}
                  </p>
                </div>

                {/* Estado */}
                <span style={{
                  padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                  ...(estadoEstilo[c.estado] ?? { background: '#f3f4f6', color: '#374151' }),
                }}>
                  {c.estado}
                </span>

                {/* Acciones */}
                {c.estado !== 'CANCELADA' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setReprogramando(reprogramando === c.idCita ? null : c.idCita)}
                      style={{
                        background: 'none', border: '1px solid #2a9d8f',
                        color: '#2a9d8f', padding: '7px 14px',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                      }}
                    >
                      📅 Reprogramar
                    </button>
                    <button
                      onClick={() => handleCancelar(c.idCita)}
                      disabled={loadingId === c.idCita}
                      style={{
                        background: 'none', border: '1px solid #ef4444',
                        color: '#ef4444', padding: '7px 14px',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                        opacity: loadingId === c.idCita ? 0.6 : 1,
                      }}
                    >
                      {loadingId === c.idCita ? 'Cancelando...' : '✕ Cancelar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Form reprogramar */}
              {reprogramando === c.idCita && (
                <div style={{
                  background: '#f9fafb', borderRadius: '0 0 12px 12px',
                  padding: '16px 24px', border: '1px solid #e5e7eb',
                  borderTop: 'none', display: 'flex', gap: '12px', alignItems: 'flex-end',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Nueva fecha
                    </label>
                    <input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Nueva hora
                    </label>
                    <input
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>
                  <button
                    onClick={() => handleReprogramar(c.idCita)}
                    disabled={loadingId === c.idCita || !nuevaFecha || !nuevaHora}
                    style={{
                      background: '#2a9d8f', color: '#fff', border: 'none',
                      padding: '9px 20px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                      opacity: !nuevaFecha || !nuevaHora ? 0.5 : 1,
                    }}
                  >
                    {loadingId === c.idCita ? 'Guardando...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setReprogramando(null)}
                    style={{
                      background: 'none', border: '1px solid #d1d5db',
                      padding: '9px 16px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '14px',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </VetLayout>
  )
}

export default VetCitas