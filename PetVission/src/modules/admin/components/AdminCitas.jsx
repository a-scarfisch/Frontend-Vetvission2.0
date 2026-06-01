import { useState } from 'react'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import AdminLayout from './AdminLayout'

const ESTADOS = ['Todas', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'REPROGRAMADA']

const estadoEstilo = {
  CONFIRMADA: { background: '#d1fae5', color: '#065f46' },
  PENDIENTE: { background: '#fef3c7', color: '#92400e' },
  CANCELADA: { background: '#fee2e2', color: '#991b1b' },
  REPROGRAMADA: { background: '#e0e7ff', color: '#3730a3' },
}

const AdminCitas = () => {
  const { citas, loading } = useAdminContext()
  const [filtro, setFiltro] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  const citasFiltradas = citas
    .filter((c) => filtro === 'Todas' || c.estado === filtro)
    .filter((c) =>
      `${c.nombreCliente} ${c.nombreVeterinario} ${c.motivo}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )

  const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

  if (loading) return <AdminLayout><p>Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>📅 Citas</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Todas las citas del sistema
        </p>
      </div>

      {/* Búsqueda y filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por cliente, veterinario o motivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px', borderRadius: '8px',
            border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '200px',
          }}
        />
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            style={{
              padding: '8px 14px', borderRadius: '99px', fontSize: '13px',
              cursor: 'pointer', fontWeight: filtro === e ? 600 : 400,
              background: filtro === e ? '#6366f1' : '#fff',
              color: filtro === e ? '#fff' : '#374151',
              border: filtro === e ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {citasFiltradas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📅</p>
            <p>No se encontraron citas.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Fecha', 'Hora', 'Cliente', 'Veterinario', 'Motivo', 'Estado'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', color: '#6b7280', fontWeight: 600,
                  }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((c) => (
                <tr key={c.idCita} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: '#e8f5f0', borderRadius: '8px',
                      padding: '6px 10px', minWidth: '56px',
                    }}>
                      <span style={{ fontWeight: 700, color: '#2a9d8f', fontSize: '14px' }}>
                        {c.fecha?.split('-')[2]}
                      </span>
                      <span style={{ fontSize: '11px', color: '#2a9d8f', marginLeft: '4px' }}>
                        {new Date(c.fecha).toLocaleDateString('es-CL', { month: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: '#2a9d8f' }}>
                    {formatHora(c.hora)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600 }}>
                    {c.nombreCliente}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                    {c.nombreVeterinario}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>
                    {c.motivo ?? 'Consulta general'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      ...(estadoEstilo[c.estado] ?? { background: '#f3f4f6', color: '#374151' }),
                    }}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCitas