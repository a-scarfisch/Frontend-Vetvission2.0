import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getCitasByUsuario } from '@/modules/client/services/citasService'
import { useNavigate } from 'react-router-dom'

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const statusStyle = {
  CONFIRMADA: { background: '#dcfce7', color: '#16a34a' },
  PENDIENTE:  { background: '#fef9c3', color: '#a16207' },
  CANCELADA:  { background: '#fdeaea', color: '#e05252' },
}

const VetDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [modalIniciar, setModalIniciar] = useState(null)
  const [modalCancelar, setModalCancelar] = useState(null)
  const [modalReprog, setModalReprog] = useState(null)
  const [toast, setToast] = useState(null)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const hoy = new Date()

  useEffect(() => {
    if (!user?.idUsuario) return
    getCitasByUsuario(user.idUsuario)
      .then(setReservas)
      .catch(() => setReservas([]))
      .finally(() => setLoading(false))
  }, [user])

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3400)
  }

  const handleCancelar = (r) => {
    setReservas(prev => prev.map(x => x.idCita === r.idCita ? { ...x, estado: 'CANCELADA' } : x))
    setModalCancelar(null)
    showToast('🗑️ Cita cancelada correctamente', 'danger')
  }

  const handleReprog = () => {
    if (!selectedDay || !selectedSlot) return
    setReservas(prev => prev.map(x => x.idCita === modalReprog.idCita ? { ...x, estado: 'CONFIRMADA' } : x))
    setModalReprog(null)
    showToast(`✅ Cita reprogramada para el ${selectedDay} ${MESES[calMonth].slice(0,3)} a las ${selectedSlot}`, 'success')
    setSelectedDay(null); setSelectedSlot(null)
  }

  const getFecha = (fechaHora) => {
    if (!fechaHora) return { hora: '—', dia: '—', mes: '—' }
    const d = new Date(fechaHora)
    return { hora: d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }), dia: d.getDate(), mes: MESES[d.getMonth()].slice(0,3) }
  }

  const filtradas = reservas.filter(r => {
    const matchNombre = !filtroNombre || r.mascota?.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()) || r.veterinario?.nombres?.toLowerCase().includes(filtroNombre.toLowerCase())
    const matchEstado = !filtroEstado || r.estado === filtroEstado
    return matchNombre && matchEstado
  })

  const SLOTS = ['08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00']

  const buildCal = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const offset = firstDay === 0 ? 6 : firstDay - 1
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const days = []
    for (let i = 0; i < offset; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }

  const s = { teal: '#037389', tealDark: '#0e8f80', tealLight: '#e6f9f7', tealMid: '#a8ede7', border: '#e2e8f0', gray: '#f4f6f8', textDark: '#1a2535', textMid: '#4a5568', textLight: '#94a3b8', red: '#e05252' }

  return (
    <>
      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: `1.5px solid ${s.border}`, padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <h5 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>Dashboard del Veterinario</h5>
          <small style={{ fontSize: '.78rem', color: s.textLight }}>{['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][hoy.getDay()]}, {hoy.getDate()} de {MESES[hoy.getMonth()]} de {hoy.getFullYear()}</small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: s.gray, border: `1.5px solid ${s.border}`, borderRadius: '50px', padding: '8px 18px', width: '280px' }}>
            <span style={{ color: s.textLight }}>🔍</span>
            <input type="text" placeholder="Buscar paciente..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: '.87rem', width: '100%' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1.5px solid ${s.border}`, background: 'none', display: 'grid', placeItems: 'center', fontSize: '1rem', cursor: 'pointer' }}>🔔</button>
            <span style={{ position: 'absolute', top: '1px', right: '1px', width: '18px', height: '18px', background: s.red, borderRadius: '50%', fontSize: '.6rem', fontWeight: 800, color: 'white', display: 'grid', placeItems: 'center', border: '2px solid white' }}>3</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', flex: 1 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '18px', marginBottom: '28px' }}>
          {[
            { icon: '📅', bg: '#e0f2fe', val: reservas.filter(r => r.estado === 'CONFIRMADA').length || 0, lbl: 'Reservas Hoy' },
            { icon: '👥', bg: '#dcfce7', val: reservas.length, lbl: 'Pacientes Activos' },
            { icon: '💉', bg: '#f3e8ff', val: reservas.filter(r => r.estado === 'CANCELADA').length, lbl: 'Canceladas' },
            { icon: '⏳', bg: '#fff7ed', val: reservas.filter(r => r.estado === 'PENDIENTE').length, lbl: 'Pendientes' },
          ].map((k) => (
            <div key={k.lbl} style={{ background: '#fff', border: `1.5px solid ${s.border}`, borderRadius: '16px', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: k.bg, display: 'grid', placeItems: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{k.icon}</div>
              <div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.7rem', lineHeight: 1 }}>{loading ? '—' : k.val}</div>
                <div style={{ fontSize: '.78rem', color: s.textLight, marginTop: '3px' }}>{k.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px' }}>

          {/* Appointments */}
          <div style={{ background: '#fff', border: `1.5px solid ${s.border}`, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1.5px solid ${s.border}` }}>
              <h6 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>Reservas del Día</h6>
            </div>

            {/* Filters */}
            <div style={{ padding: '16px 24px', background: '#fafbfc', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '.78rem', fontWeight: 700, color: s.textMid }}>Buscar paciente</label>
                <input value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} placeholder="Nombre..." style={{ padding: '8px 14px', border: `1.5px solid ${s.border}`, borderRadius: '9px', fontSize: '.84rem', outline: 'none', background: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '.78rem', fontWeight: 700, color: s.textMid }}>Estado</label>
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: '8px 14px', border: `1.5px solid ${s.border}`, borderRadius: '9px', fontSize: '.84rem', outline: 'none', background: '#fff' }}>
                  <option value="">Todos</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border spinner-border-sm" style={{ color: s.teal }}></div></div>
            ) : filtradas.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: s.textLight }}>Sin reservas para los filtros seleccionados.</div>
            ) : (
              filtradas.map((r) => {
                const { hora, dia, mes } = getFecha(r.fechaHora)
                const st = statusStyle[r.estado] ?? statusStyle.PENDIENTE
                return (
                  <div key={r.idCita} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: `1px solid ${s.border}`, flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.05rem', minWidth: '60px' }}>{hora}</div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: s.tealLight, display: 'grid', placeItems: 'center', fontSize: '1.3rem', flexShrink: 0, border: `2px solid ${s.tealMid}` }}>🐾</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{r.mascota?.nombre ?? '—'}</div>
                      <div style={{ fontSize: '.78rem', color: s.textLight }}>{r.mascota?.dueno ?? ''} · {r.motivo ?? 'Consulta'}</div>
                    </div>
                    <span style={{ fontSize: '.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: '50px', ...st }}>{r.estado?.charAt(0) + r.estado?.slice(1).toLowerCase()}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setModalReprog(r)} style={{ padding: '8px 16px', borderRadius: '9px', border: 'none', background: s.teal, color: 'white', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer' }}>Reprogramar</button>
                      {r.estado !== 'CANCELADA' && (
                        <button onClick={() => setModalCancelar(r)} style={{ padding: '8px 16px', borderRadius: '9px', border: 'none', background: s.red, color: 'white', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer' }}>Cancelar</button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Notes */}
          <div style={{ background: '#fff', border: `1.5px solid ${s.border}`, borderRadius: '16px', padding: '22px 20px' }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', marginBottom: '18px' }}>💡 Notas Internas</div>
            {[
              { color: 'red', bg: '#fdeaea', border: s.red, pet: '', text: '' },
              { color: 'yellow', bg: '#fef9c3', border: '#f5a623', pet: '', text: '' },
              { color: 'blue', bg: '#eff6ff', border: '#3b82f6', pet: '', text: '' },
            ].map((n) => (
              <div key={n.pet} style={{ borderRadius: '10px', padding: '14px 16px', marginBottom: '12px', background: n.bg, borderLeft: `4px solid ${n.border}` }}>
                <div style={{ fontWeight: 800, fontSize: '.9rem', marginBottom: '4px' }}>{n.pet}</div>
                <div style={{ fontSize: '.8rem', color: s.textMid }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal para iniciar consulta */}
      {modalIniciar && (
        <div onClick={(e) => e.target === e.currentTarget && setModalIniciar(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,28,.52)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '36px 32px', width: '100%', maxWidth: '460px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setModalIniciar(null)} style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${s.border}`, background: 'none', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '3.2rem', marginBottom: '16px' }}>👩‍⚕️</div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '6px' }}>Iniciar consulta para {modalIniciar.mascota?.nombre}?</div>
            <div style={{ fontSize: '.88rem', color: s.textLight, marginBottom: '22px' }}>Serás redirigido al historial clínico del paciente.</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setModalIniciar(null)} style={{ padding: '14px 28px', borderRadius: '14px', border: `1.5px solid ${s.border}`, background: 'none', fontWeight: 800, cursor: 'pointer' }}>No, cancelar</button>
              <button onClick={() => navigate(`/vet/historial?mascota=${modalIniciar.mascota?.idMascota}`)} style={{ padding: '14px 28px', borderRadius: '14px', border: 'none', background: s.teal, color: 'white', fontWeight: 800, cursor: 'pointer' }}>✅ Sí, iniciar</button>
            </div>
          </div>
        </div>
      )}



      {/* Modal Cancelar */}
      {modalCancelar && (
        <div onClick={(e) => e.target === e.currentTarget && setModalCancelar(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,28,.52)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '36px 32px', width: '100%', maxWidth: '460px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setModalCancelar(null)} style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${s.border}`, background: 'none', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '3.2rem', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '6px' }}>¿Cancelar esta cita?</div>
            <div style={{ fontSize: '.88rem', color: s.textLight, marginBottom: '22px' }}>Esta acción no se puede deshacer.</div>
            <div style={{ background: s.gray, borderRadius: '14px', padding: '18px 20px', textAlign: 'left', marginBottom: '26px', border: `1.5px solid ${s.border}` }}>
              {[['Mascota', modalCancelar.mascota?.nombre ?? '—'], ['Motivo', modalCancelar.motivo ?? 'Consulta'], ['Hora', getFecha(modalCancelar.fechaHora).hora]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '.88rem', borderBottom: `1px solid ${s.border}` }}>
                  <span style={{ color: s.textLight, fontWeight: 600 }}>{l}</span>
                  <span style={{ fontWeight: 800 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setModalCancelar(null)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: `1.5px solid ${s.border}`, background: 'none', fontWeight: 800, cursor: 'pointer' }}>No, mantener</button>
              <button onClick={() => handleCancelar(modalCancelar)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: s.red, color: 'white', fontWeight: 800, cursor: 'pointer' }}>🗑️ Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reprogramar */}
      {modalReprog && (
        <div onClick={(e) => e.target === e.currentTarget && setModalReprog(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,28,.52)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '540px', position: 'relative' }}>
            <button onClick={() => setModalReprog(null)} style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${s.border}`, background: 'none', cursor: 'pointer' }}>✕</button>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '4px' }}>📅 Reprogramar Cita</div>
            <div style={{ fontSize: '.84rem', color: s.textLight, marginBottom: '24px' }}>{modalReprog.mascota?.nombre} · actual: {getFecha(modalReprog.fechaHora).hora}</div>

            {/* Mini calendar */}
            <div style={{ border: `1.5px solid ${s.border}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '22px' }}>
              <div style={{ background: s.teal, color: 'white', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => { const m = calMonth - 1 < 0 ? 11 : calMonth - 1; setCalMonth(m); if (calMonth - 1 < 0) setCalYear(y => y - 1) }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer', padding: '4px 10px' }}>‹</button>
                <span style={{ fontWeight: 800 }}>{MESES[calMonth].charAt(0).toUpperCase() + MESES[calMonth].slice(1)} {calYear}</span>
                <button onClick={() => { const m = calMonth + 1 > 11 ? 0 : calMonth + 1; setCalMonth(m); if (calMonth + 1 > 11) setCalYear(y => y + 1) }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer', padding: '4px 10px' }}>›</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '8px', gap: '2px' }}>
                {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: '.7rem', fontWeight: 800, color: s.textLight, padding: '6px 0' }}>{d}</div>)}
                {buildCal().map((d, i) => {
                  const isPast = d && new Date(calYear, calMonth, d) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
                  return (
                    <div key={i} onClick={() => !isPast && d && setSelectedDay(d)} style={{ textAlign: 'center', padding: '8px 4px', fontSize: '.84rem', fontWeight: 600, borderRadius: '8px', cursor: d && !isPast ? 'pointer' : 'default', color: !d || isPast ? s.border : selectedDay === d ? 'white' : s.textDark, background: selectedDay === d ? s.teal : 'transparent' }}>{d}</div>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <div style={{ fontSize: '.69rem', fontWeight: 800, color: s.textLight, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Hora Disponible</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', minHeight: '42px' }}>
              {!selectedDay ? <span style={{ fontSize: '.84rem', color: s.textLight }}>Primero selecciona una fecha</span> :
                SLOTS.map(sl => (
                  <div key={sl} onClick={() => setSelectedSlot(sl)} style={{ padding: '8px 16px', border: `1.5px solid ${s.teal}`, borderRadius: '9px', fontWeight: 700, fontSize: '.82rem', color: selectedSlot === sl ? 'white' : s.teal, background: selectedSlot === sl ? s.teal : '#fff', cursor: 'pointer' }}>{sl}</div>
                ))
              }
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '26px' }}>
              <button onClick={() => setModalReprog(null)} style={{ flex: 1, padding: '13px', borderRadius: '14px', border: `1.5px solid ${s.border}`, background: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleReprog} disabled={!selectedDay || !selectedSlot} style={{ flex: 2, padding: '13px', borderRadius: '14px', border: 'none', background: !selectedDay || !selectedSlot ? s.tealMid : s.teal, color: 'white', fontWeight: 800, cursor: !selectedDay || !selectedSlot ? 'not-allowed' : 'pointer' }}>✔ Confirmar cambio</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', background: toast.tipo === 'danger' ? s.red : s.teal, color: '#fff', padding: '12px 24px', borderRadius: '50px', fontWeight: 700, fontSize: '.88rem', zIndex: 600, boxShadow: '0 8px 24px rgba(0,0,0,.18)', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}

export default VetDashboard