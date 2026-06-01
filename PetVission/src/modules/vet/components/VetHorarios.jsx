import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import apiClient from '@/modules/core/lib/apiClient'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function dStr(d) { return d.toISOString().slice(0, 10) }
function fmtH(h) { const hh = Math.floor(h), mm = Math.round((h-hh)*60); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}` }
function isToday(d) { return dStr(d) === dStr(new Date()) }
function getMonday(d) { const day=d.getDay(); const diff=day===0?-6:1-day; const m=new Date(d); m.setDate(d.getDate()+diff); m.setHours(0,0,0,0); return m }

const START_H = 7
const HOURS = Array.from({length: 15}, (_, i) => START_H + i)

const s = {
  teal: '#1a9e8f', tealLight: '#e6f7f5', tealMid: '#5bbdb5',
  border: '#e2e8f0', gray: '#f8fafc', textDark: '#334155',
  textMid: '#4a5568', textLight: '#94a3b8', white: '#fff',
}

const eventColor = (tipo) => {
  const map = {
    'Cirugía':           { bg: '#ede9fe', text: '#5b21b6' },
    'Urgencia':          { bg: '#fee2e2', text: '#991b1b' },
    'Vacunación':        { bg: '#dcfce7', text: '#14532d' },
    'Descanso':          { bg: '#f1f5f9', text: '#334155' },
    'Control':           { bg: '#ccf2ec', text: '#0d6e63' },
    'Primera consulta':  { bg: '#ccf2ec', text: '#0d6e63' },
    'Segunda consulta':  { bg: '#fef3c7', text: '#92400e' },
  }
  return map[tipo] ?? { bg: '#ccf2ec', text: '#0d6e63' }
}

const parseEvento = (cita) => {
  const fecha = new Date(cita.fechaHora)
  const startH = fecha.getHours() + fecha.getMinutes() / 60
  const tipo = cita.motivo ?? cita.servicio ?? 'Consulta'
  const { bg, text } = eventColor(tipo)
  return {
    id: cita.idCita,
    title: `${cita.mascota?.nombre ?? '—'} — ${cita.cliente?.apellidos ?? ''}`,
    type: tipo,
    date: dStr(fecha),
    startH,
    endH: startH + 1,
    color: bg,
    textColor: text,
    patient: cita.mascota?.nombre ?? '',
    owner: cita.cliente ? `${cita.cliente.nombres} ${cita.cliente.apellidos}` : '',
    species: cita.mascota ? `${cita.mascota.especie} · ${cita.mascota.raza}` : '',
    notes: cita.observaciones ?? '',
  }
}

const VetHorarios = () => {
  const { user } = useAuthContext()
  const [view, setView] = useState('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    if (!user?.idUsuario) return
    apiClient.get(`/citas/veterinario/${user.idUsuario}`)
      .then(res => setEvents((res.data.data ?? []).map(parseEvento)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [user])

  const navPrev = () => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() - 1)
    else if (view === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }

  const navNext = () => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() + 1)
    else if (view === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  const getPeriodLabel = () => {
    if (view === 'day') {
      const dn = DAYS_SHORT[currentDate.getDay()===0?6:currentDate.getDay()-1]
      return `${dn}, ${currentDate.getDate()} de ${MONTHS_ES[currentDate.getMonth()]} de ${currentDate.getFullYear()}`
    }
    if (view === 'week') {
      const ws = getMonday(currentDate)
      const we = new Date(ws); we.setDate(ws.getDate()+6)
      return `${MONTHS_ES[ws.getMonth()]} ${ws.getDate()} – ${we.getDate()} de ${MONTHS_ES[we.getMonth()]} ${ws.getFullYear()}`
    }
    return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  const todayEvs = events.filter(e => e.date === dStr(new Date()) && e.type !== 'Descanso')

  // DAY VIEW
  const DayView = () => {
    const dayEvs = events.filter(e => e.date === dStr(currentDate))
    const nowH = new Date().getHours() + new Date().getMinutes() / 60
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '14px', flex: 1 }}>
        <div style={{ background: s.white, border: `1px solid ${s.border}`, borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${s.border}`, background: s.gray, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', color: s.teal, lineHeight: 1 }}>{currentDate.getDate()}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{DAYS_SHORT[currentDate.getDay()===0?6:currentDate.getDay()-1]}{isToday(currentDate)?' — Hoy':''}</div>
              <div style={{ fontSize: '.7rem', color: s.textLight }}>{MONTHS_ES[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border spinner-border-sm" style={{ color: s.teal }}></div></div>
            ) : (
              HOURS.map(h => (
                <div key={h} style={{ display: 'flex', minHeight: '64px', borderBottom: `1px solid ${s.gray}` }}>
                  <div style={{ width: '56px', flexShrink: 0, padding: '8px 6px 0', textAlign: 'right', fontSize: '.65rem', fontWeight: 700, color: '#cbd5e1', borderRight: `1px solid ${s.gray}` }}>{h}:00</div>
                  <div style={{ flex: 1, padding: '4px 8px', position: 'relative' }}>
                    {isToday(currentDate) && Math.floor(nowH) === h && (
                      <div style={{ height: '2px', background: '#dc2626', position: 'relative', margin: `${(nowH-h)*60}px 8px 0` }}>
                        <div style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', position: 'absolute', left: '-4px', top: '-3px' }} />
                      </div>
                    )}
                    {dayEvs.filter(e => Math.floor(e.startH) === h).map(ev => (
                      <div key={ev.id} onClick={(e) => { e.stopPropagation(); setPopup({ ev, x: e.clientX, y: e.clientY }) }}
                        style={{ background: ev.color, color: ev.textColor, borderRadius: '7px', padding: '8px 11px', marginBottom: '4px', cursor: 'pointer', marginTop: `${(ev.startH - Math.floor(ev.startH)) * 60}px` }}>
                        <div style={{ fontWeight: 800, fontSize: '.8rem' }}>{ev.title}</div>
                        <div style={{ fontSize: '.68rem', opacity: .75, marginTop: '1px' }}>{ev.type}{ev.species ? ` · ${ev.species}` : ''}</div>
                        <div style={{ fontSize: '.65rem', opacity: .65, marginTop: '2px' }}>🕐 {fmtH(ev.startH)} – {fmtH(ev.endH)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: s.white, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '.82rem', marginBottom: '10px' }}>📋 Citas del día ({dayEvs.filter(e => e.type !== 'Descanso').length})</div>
            {loading ? <div className="spinner-border spinner-border-sm" style={{ color: s.teal }}></div> :
              dayEvs.filter(e => e.type !== 'Descanso').length === 0 ? (
                <p style={{ fontSize: '.78rem', color: s.textLight, textAlign: 'center', padding: '10px 0' }}>Sin citas para hoy</p>
              ) : (
                dayEvs.filter(e => e.type !== 'Descanso').sort((a,b) => a.startH-b.startH).map(ev => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: `1px dashed ${s.border}` }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.textColor, flexShrink: 0, marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '.78rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '.68rem', color: s.textLight }}>{ev.type}</div>
                    </div>
                    <div style={{ fontSize: '.7rem', fontWeight: 800, color: s.teal }}>{fmtH(ev.startH)}</div>
                  </div>
                ))
              )
            }
          </div>
        </div>
      </div>
    )
  }

  // WEEK VIEW
  const WeekView = () => {
    const ws = getMonday(currentDate)
    const days = Array.from({length: 7}, (_, i) => { const d = new Date(ws); d.setDate(ws.getDate()+i); return d })
    return (
      <div style={{ background: s.white, border: `1px solid ${s.border}`, borderRadius: '10px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${s.border}`, background: s.gray }}>
          <div style={{ width: '56px', flexShrink: 0, borderRight: `1px solid ${s.border}` }} />
          {days.map((d, i) => {
            const isT = isToday(d)
            const cnt = events.filter(e => e.date === dStr(d) && e.type !== 'Descanso').length
            return (
              <div key={i} onClick={() => { setCurrentDate(d); setView('day') }} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRight: `1px solid ${s.border}`, cursor: 'pointer' }}>
                <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', color: s.textLight }}>{DAYS_SHORT[d.getDay()===0?6:d.getDay()-1]}</div>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: isT ? '#fff' : s.textDark, background: isT ? s.teal : 'transparent', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '.88rem' }}>{d.getDate()}</div>
                {cnt > 0 && <div style={{ fontSize: '.6rem', color: s.teal, fontWeight: 800 }}>{cnt} cita{cnt>1?'s':''}</div>}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', overflowY: 'auto', flex: 1 }}>
          <div style={{ width: '56px', flexShrink: 0, borderRight: `1px solid ${s.border}` }}>
            {HOURS.map(h => <div key={h} style={{ height: '56px', borderBottom: `1px solid ${s.gray}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px' }}><span style={{ fontSize: '.62rem', fontWeight: 700, color: '#cbd5e1' }}>{h}:00</span></div>)}
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {days.map((d, i) => (
              <div key={i} style={{ flex: 1, borderRight: `1px solid ${s.border}`, position: 'relative', minHeight: `${HOURS.length * 56}px` }}>
                {HOURS.map(h => <div key={h} style={{ height: '56px', borderBottom: `1px solid ${s.gray}` }} />)}
                {events.filter(e => e.date === dStr(d)).map(ev => (
                  <div key={ev.id} onClick={(e) => { e.stopPropagation(); setPopup({ ev, x: e.clientX, y: e.clientY }) }}
                    style={{ position: 'absolute', left: '3px', right: '3px', top: `${(ev.startH - START_H) * 56}px`, height: `${Math.max(22, (ev.endH - ev.startH) * 56 - 3)}px`, background: ev.color, color: ev.textColor, borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', overflow: 'hidden', zIndex: 2 }}>
                    <div style={{ fontWeight: 800, fontSize: '.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                    <div style={{ fontSize: '.62rem', opacity: .7 }}>{fmtH(ev.startH)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // MONTH VIEW
  const MonthView = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const daysInM = new Date(y, m+1, 0).getDate()
    const prevDays = new Date(y, m, 0).getDate()
    const cells = []
    for (let i = startOffset-1; i >= 0; i--) cells.push({ day: prevDays-i, cur: false, date: new Date(y, m-1, prevDays-i) })
    for (let d = 1; d <= daysInM; d++) cells.push({ day: d, cur: true, date: new Date(y, m, d) })
    const rem = (7 - cells.length % 7) % 7
    for (let d = 1; d <= rem; d++) cells.push({ day: d, cur: false, date: new Date(y, m+1, d) })
    return (
      <div style={{ background: s.white, border: `1px solid ${s.border}`, borderRadius: '10px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1px solid ${s.border}`, background: s.gray }}>
          {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: 'center', padding: '8px', fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', color: s.textLight }}>{d}</div>)}
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridAutoRows: 'minmax(80px,1fr)', overflowY: 'auto' }}>
          {cells.map((c, i) => {
            const isT = isToday(c.date)
            const dayEvs = events.filter(e => e.date === dStr(c.date))
            return (
              <div key={i} onClick={() => { if (c.cur) { setCurrentDate(c.date); setView('day') } }} style={{ borderRight: `1px solid ${s.border}`, borderBottom: `1px solid ${s.border}`, padding: '5px 4px', overflow: 'hidden', cursor: c.cur ? 'pointer' : 'default' }}>
                <div style={{ fontWeight: 800, fontSize: '.8rem', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '3px', background: isT ? s.teal : 'transparent', color: isT ? '#fff' : c.cur ? s.textDark : '#cbd5e1' }}>{c.day}</div>
                {dayEvs.slice(0, 2).map(ev => (
                  <div key={ev.id} style={{ fontSize: '.63rem', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: ev.color, color: ev.textColor }}>{ev.title}</div>
                ))}
                {dayEvs.length > 2 && <div style={{ fontSize: '.6rem', color: s.textLight }}>+{dayEvs.length-2} más</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }} onClick={() => setPopup(null)}>
      {/* Topbar */}
      <div style={{ background: s.white, borderBottom: `1px solid ${s.border}`, height: '56px', padding: '0 24px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: s.textDark }}>Mi Horario</div>
          <div style={{ fontSize: '.72rem', color: s.textLight }}>{DAYS_SHORT[new Date().getDay()===0?6:new Date().getDay()-1]}, {new Date().getDate()} de {MONTHS_ES[new Date().getMonth()]} · {todayEvs.length} citas hoy</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {[
            { icon: '📅', bg: '#e6f7f5', label: 'Citas hoy', val: loading ? '—' : todayEvs.length, sub: '08:00 – 18:00' },
            { icon: '📆', bg: '#fffbeb', label: 'Esta semana', val: loading ? '—' : events.filter(e => { const d = new Date(e.date); const ws = getMonday(new Date()); const we = new Date(ws); we.setDate(ws.getDate()+6); return d >= ws && d <= we && e.type !== 'Descanso' }).length, sub: 'consultas' },
            { icon: '✂️', bg: '#ede9fe', label: 'Cirugías', val: loading ? '—' : events.filter(e => e.type === 'Cirugía').length, sub: 'programadas' },
            { icon: '⏳', bg: '#e0f2fe', label: 'Total citas', val: loading ? '—' : events.length, sub: 'en el sistema' },
          ].map(k => (
            <div key={k.label} style={{ background: s.white, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '9px', background: k.bg, display: 'grid', placeItems: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{k.icon}</div>
              <div>
                <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', color: s.textLight, marginBottom: '2px' }}>{k.label}</div>
                <div style={{ fontWeight: 900, fontSize: '1.35rem', lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '.67rem', color: s.textLight, marginTop: '2px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', border: `1px solid ${s.border}`, borderRadius: '8px', overflow: 'hidden', background: s.white }}>
            {['day','week','month'].map((v, i) => (
              <button key={v} onClick={() => setView(v)} style={{ border: 'none', background: view === v ? s.teal : 'none', padding: '7px 18px', fontSize: '.75rem', fontWeight: 700, color: view === v ? '#fff' : s.textLight, cursor: 'pointer' }}>{['Día','Semana','Mes'][i]}</button>
            ))}
          </div>
          <button onClick={() => setCurrentDate(new Date())} style={{ border: `1px solid ${s.border}`, background: s.white, borderRadius: '6px', padding: '5px 12px', fontSize: '.73rem', fontWeight: 700, cursor: 'pointer' }}>Hoy</button>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button onClick={navPrev} style={{ border: `1px solid ${s.border}`, background: s.white, borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>‹</button>
            <button onClick={navNext} style={{ border: `1px solid ${s.border}`, background: s.white, borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>›</button>
          </div>
          <span style={{ fontWeight: 800, fontSize: '.95rem' }}>{getPeriodLabel()}</span>
        </div>

        {/* Calendar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          {view === 'day' && <DayView />}
          {view === 'week' && <WeekView />}
          {view === 'month' && <MonthView />}
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', background: s.white, borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,.14)', width: '290px', zIndex: 300, overflow: 'hidden', left: Math.min(popup.x+12, window.innerWidth-310), top: Math.min(popup.y-10, window.innerHeight-310) }}>
          <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '4px', borderRadius: '2px', alignSelf: 'stretch', flexShrink: 0, background: popup.ev.textColor }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: '.9rem' }}>{popup.ev.title}</div>
              <div style={{ fontSize: '.72rem', color: s.textLight, marginTop: '2px' }}>{popup.ev.type}</div>
            </div>
            <button onClick={() => setPopup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.textLight, fontSize: '1rem' }}>✕</button>
          </div>
          <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${s.border}` }}>
            {[
              ['🕐', `${fmtH(popup.ev.startH)} – ${fmtH(popup.ev.endH)}`],
              popup.ev.species && ['🐾', popup.ev.species],
              popup.ev.owner && ['👤', popup.ev.owner],
              popup.ev.notes && ['💬', popup.ev.notes],
            ].filter(Boolean).map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', padding: '7px 0', borderBottom: `1px solid #f8fafc`, fontSize: '.77rem' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${s.border}`, display: 'flex', gap: '6px' }}>
            <button onClick={() => setPopup(null)} style={{ flex: 1, border: `1px solid ${s.border}`, borderRadius: '6px', padding: '6px', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', background: s.gray }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VetHorarios