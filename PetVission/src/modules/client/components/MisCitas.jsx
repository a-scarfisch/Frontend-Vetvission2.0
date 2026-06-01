import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getCitasByUsuario, cancelarCita } from '@/modules/client/services/citasService'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const statusStyle = {
  CONFIRMADA: { background: '#e8f8ef', color: '#4caf7d' },
  PENDIENTE:  { background: '#fff8ed', color: '#f5a623' },
  CANCELADA:  { background: '#fdeaea', color: '#e05252' },
}

const MisCitas = () => {
  const { user } = useAuthContext()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('TODAS')
  const [modalCancelar, setModalCancelar] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user?.idUsuario) return
    getCitasByUsuario(user.idUsuario)
      .then(setReservas)
      .catch(() => setReservas([]))
      .finally(() => setLoading(false))
  }, [user])

  const showToast = (msg, tipo = '') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3200)
  }

  const handleCancelar = async () => {
    try {
      await cancelarCita(modalCancelar.idCita)
      setReservas(prev => prev.map(r =>
        r.idCita === modalCancelar.idCita ? { ...r, estado: 'CANCELADA' } : r
      ))
      showToast('🗑 Reserva cancelada', 'danger')
    } catch {
      showToast('⚠️ Error al cancelar', 'danger')
    } finally {
      setModalCancelar(null)
    }
  }

  const filtradas = filtro === 'TODAS' ? reservas : reservas.filter(r => r.estado === filtro)

  const getFecha = (fechaHora) => {
    if (!fechaHora) return { dia: '—', mes: '—', hora: '—' }
    const d = new Date(fechaHora)
    return {
      dia: d.getDate(),
      mes: MESES[d.getMonth()],
      hora: d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem' }}>📅 Mis Reservas</h1>
          <p style={{ fontSize: '.88rem', color: '#4a5568', marginTop: '3px' }}>
            Gestiona y revisa todas las reservas de tus mascotas
          </p>
        </div>
        <Link to="/client/agendamiento" className="btn btn-teal text-white px-4">
          ＋ Nueva cita
        </Link>
      </div>

      {/* Filtros */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['TODAS', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '8px 20px', borderRadius: '50px', fontWeight: 700, fontSize: '.82rem',
              border: '1.5px solid', cursor: 'pointer', transition: 'all .18s',
              borderColor: filtro === f ? '#1a9e8f' : '#dde3ea',
              background: filtro === f ? '#1a9e8f' : '#fff',
              color: filtro === f ? '#fff' : '#4a5568',
            }}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" style={{ color: '#1a9e8f' }}></div>
          Cargando reservas...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem' }}>📭</div>
          <p style={{ color: '#8a97a8', marginTop: '12px' }}>No hay reservas en esta categoría.</p>
        </div>
      ) : (
        filtradas.map((r) => {
          const { dia, mes, hora } = getFecha(r.fechaHora)
          const cancelada = r.estado === 'CANCELADA'
          return (
            <div
              key={r.idCita}
              style={{
                background: '#fff', border: '1.5px solid #dde3ea', borderRadius: '22px',
                padding: '24px 28px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
                opacity: cancelada ? 0.55 : 1,
                transition: 'border-color .2s, box-shadow .2s',
              }}
            >
              {/* Fecha */}
              <div style={{ minWidth: '68px', height: '72px', background: '#e6f7f5', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #b2e8e2' }}>
                <span style={{ fontWeight: 900, fontSize: '1.6rem', color: '#1a9e8f', lineHeight: 1 }}>{dia}</span>
                <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#137a6e', textTransform: 'uppercase', letterSpacing: '.06em' }}>{mes}</span>
              </div>

              {/* Hora */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a2535' }}>{hora}</span>
                <span style={{ fontSize: '.7rem', color: '#8a97a8' }}>hora</span>
              </div>

              <div style={{ width: '1px', height: '56px', background: '#dde3ea', flexShrink: 0 }} className="d-none d-md-block" />

              {/* Mascota */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '140px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#b2e8e2', display: 'grid', placeItems: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🐾</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{r.mascota?.nombre ?? r.nombreMascota ?? '—'}</div>
                  <div style={{ fontSize: '.78rem', color: '#4a5568' }}>{r.motivo ?? 'Consulta general'}</div>
                </div>
              </div>

              <div style={{ width: '1px', height: '56px', background: '#dde3ea', flexShrink: 0 }} className="d-none d-md-block" />

              {/* Doctor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '140px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f4f6f8', border: '2px solid #dde3ea', display: 'grid', placeItems: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👨‍⚕️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{r.veterinario?.nombres ? `Dr. ${r.veterinario.nombres}` : 'Veterinario'}</div>
                  <div style={{ fontSize: '.75rem', color: '#4a5568' }}>{r.especialidad ?? 'Medicina General'}</div>
                </div>
              </div>

              <div style={{ width: '1px', height: '56px', background: '#dde3ea', flexShrink: 0 }} className="d-none d-md-block" />

              {/* Estado */}
              <span style={{ fontSize: '.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: '50px', whiteSpace: 'nowrap', ...statusStyle[r.estado] }}>
                {r.estado?.charAt(0) + r.estado?.slice(1).toLowerCase()}
              </span>

              {/* Acciones */}
              {!cancelada && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                  <button
                    onClick={() => setModalCancelar(r)}
                    style={{ background: 'none', border: '2px solid #e05252', color: '#e05252', borderRadius: '8px', padding: '8px 14px', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', transition: 'all .18s' }}
                  >✕ Cancelar</button>
                </div>
              )}
              {cancelada && (
                <span style={{ fontSize: '.78rem', color: '#e05252', fontWeight: 700, textAlign: 'center' }}>Reserva cancelada</span>
              )}
            </div>
          )
        })
      )}

      {/* Modal Cancelar */}
      {modalCancelar && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', zIndex: 300, display: 'grid', placeItems: 'center', padding: '16px', backdropFilter: 'blur(3px)' }}
          onClick={(e) => e.target === e.currentTarget && setModalCancelar(null)}
        >
          <div style={{ background: '#fff', borderRadius: '22px', padding: '32px', width: '100%', maxWidth: '420px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setModalCancelar(null)} style={{ position: 'absolute', top: '14px', right: '14px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #dde3ea', background: 'none', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', marginBottom: '6px' }}>¿Cancelar esta reserva?</div>
            <div style={{ fontSize: '.85rem', color: '#4a5568', marginBottom: '24px' }}>Esta acción no se puede deshacer.</div>
            <div style={{ background: '#f4f6f8', borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              {[
                ['Mascota', `🐾 ${modalCancelar.mascota?.nombre ?? modalCancelar.nombreMascota ?? '—'}`],
                ['Doctor', modalCancelar.veterinario?.nombres ? `Dr. ${modalCancelar.veterinario.nombres}` : 'Veterinario'],
                ['Fecha', (() => { const { dia, mes, hora } = getFecha(modalCancelar.fechaHora); return `${dia} de ${mes} · ${hora}` })()],
                ['Motivo', modalCancelar.motivo ?? 'Consulta general'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '4px 0' }}>
                  <span style={{ color: '#8a97a8', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setModalCancelar(null)} style={{ background: 'none', color: '#4a5568', border: '2px solid #dde3ea', borderRadius: '14px', padding: '11px 22px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer' }}>No, mantener</button>
              <button onClick={handleCancelar} style={{ background: '#e05252', color: '#fff', border: 'none', borderRadius: '14px', padding: '13px 28px', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer' }}>🗑 Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'danger' ? '#e05252' : '#4caf7d',
          color: '#fff', padding: '13px 24px', borderRadius: '50px',
          fontWeight: 700, fontSize: '.88rem', zIndex: 400, whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,.15)',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}

export default MisCitas