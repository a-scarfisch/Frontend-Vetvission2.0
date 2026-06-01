import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const HOURS = Array.from({length:15}, (_, i) => i + 7)
const H_PX = 60
const START_H = 7

const COLORS = {
  'ev-purple': { bg:'#ede9fe', color:'#5b21b6', border:'#8b5cf6' },
  'ev-teal':   { bg:'#ccfbf1', color:'#0d6e63', border:'#14b8a6' },
  'ev-amber':  { bg:'#fef3c7', color:'#92400e', border:'#f59e0b' },
  'ev-pink':   { bg:'#fce7f3', color:'#9d174d', border:'#f472b6' },
  'ev-sky':    { bg:'#e0f2fe', color:'#075985', border:'#38bdf8' },
  'ev-green':  { bg:'#dcfce7', color:'#14532d', border:'#22c55e' },
}

const TODAY = new Date(); TODAY.setHours(0,0,0,0)
function dateToStr(d) { return d.toISOString().slice(0, 10) }
function fmtH(h) { const hh = Math.floor(h), mm = Math.round((h-hh)*60); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}` }
function weekStart(d) { const day = d.getDay(), diff = day===0?-6:1-day; const ws = new Date(d); ws.setDate(d.getDate()+diff); ws.setHours(0,0,0,0); return ws }

const AdminTurnos = () => {
  const [view, setView] = useState('day')
  const [currentDate, setCurrentDate] = useState(new Date(TODAY))
  const [shifts, setShifts] = useState([])
  const [vets, setVets] = useState([])
  const [modal, setModal] = useState(false)
  const [ntColor, setNtColor] = useState('ev-purple')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ vet:'', fecha: dateToStr(TODAY), inicio:'08:00', fin:'14:00', tipo:'Turno mañana', notas:'' })

  useEffect(() => {
    apiClient.get('/usuarios/veterinarios')
      .then(res => setVets(res.data.data ?? []))
      .catch(() => setVets([]))
    apiClient.get('/turnos')
      .then(res => setShifts(res.data.data ?? []))
      .catch(() => setShifts([]))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

  const handleGuardar = async () => {
    if (!form.vet || !form.fecha || !form.inicio || !form.fin) {
      showToast('⚠️ Completa todos los campos obligatorios'); return
    }
    const [ih, im] = form.inicio.split(':').map(Number)
    const [fh, fm] = form.fin.split(':').map(Number)
    const startH = ih + im/60, endH = fh + fm/60
    if (endH <= startH) { showToast('⚠️ La hora fin debe ser mayor a la hora inicio'); return }
    try {
      const res = await apiClient.post('/turnos', { ...form, startH, endH, color: ntColor })
      setShifts(prev => [...prev, res.data.data ?? { id: Date.now(), vet: form.vet, date: form.fecha, startH, endH, tipo: form.tipo, color: ntColor }])
    } catch {
      setShifts(prev => [...prev, { id: Date.now(), vet: form.vet, date: form.fecha, startH, endH, tipo: form.tipo, color: ntColor }])
    }
    setModal(false)
    setCurrentDate(new Date(form.fecha + 'T12:00:00'))
    setView('day')
    showToast('✅ Turno asignado correctamente')
  }

  const navPrev = () => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate()-1)
    else if (view === 'week') d.setDate(d.getDate()-7)
    else d.setMonth(d.getMonth()-1)
    setCurrentDate(d)
  }

  const navNext = () => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate()+1)
    else if (view === 'week') d.setDate(d.getDate()+7)
    else d.setMonth(d.getMonth()+1)
    setCurrentDate(d)
  }

  const getTitle = () => {
    if (view === 'day') return `${DAYS_ES[currentDate.getDay()]} ${currentDate.getDate()} de ${MONTHS_ES[currentDate.getMonth()]} de ${currentDate.getFullYear()}`
    if (view === 'week') {
      const ws = weekStart(currentDate)
      const we = new Date(ws); we.setDate(ws.getDate()+6)
      return `${MONTHS_ES[ws.getMonth()]} ${ws.getDate()} – ${we.getDate()} ${ws.getMonth()!==we.getMonth()?'de '+MONTHS_ES[we.getMonth()]:''} ${ws.getFullYear()}`
    }
    return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  const getVetName = (vetId) => {
    const v = vets.find(v => String(v.idUsuario) === String(vetId))
    return v ? `Dr. ${v.nombres} ${v.apellidos ?? ''}` : vetId
  }

  const s = { border:'#e2e8f0', white:'#fff', textLight:'#94a3b8' }

  const ShiftEvent = ({ shift }) => {
    const top = (shift.startH - START_H) * H_PX
    const height = (shift.endH - shift.startH) * H_PX - 4
    const c = COLORS[shift.color] ?? COLORS['ev-purple']
    return (
      <div style={{ position:'absolute', left:'4px', right:'4px', top:`${top}px`, height:`${height}px`, borderRadius:'7px', padding:'5px 8px', cursor:'pointer', zIndex:5, overflow:'hidden', background:c.bg, color:c.color, borderLeft:`3px solid ${c.border}` }}>
        <div style={{ fontWeight:700, fontSize:'.74rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{getVetName(shift.vet)}</div>
        <div style={{ fontSize:'.65rem', opacity:.85, marginTop:'1px' }}>{shift.tipo}</div>
        <div style={{ fontSize:'.65rem', opacity:.85 }}>{fmtH(shift.startH)} – {fmtH(shift.endH)}</div>
      </div>
    )
  }

  const TimesCol = () => (
    <div style={{ width:'68px', flexShrink:0, borderRight:'1px solid #e2e8f0' }}>
      {HOURS.map(h => (
        <div key={h} style={{ height:`${H_PX}px`, borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'4px' }}>
          <span style={{ fontSize:'.67rem', color:'#94a3b8', fontWeight:700 }}>{String(h).padStart(2,'0')}:00</span>
        </div>
      ))}
    </div>
  )

  const DayView = () => {
    const ds = dateToStr(currentDate)
    const isToday = ds === dateToStr(TODAY)
    return (
      <>
        <div style={{ display:'flex', position:'sticky', top:0, zIndex:10, background:'white', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ width:'68px', flexShrink:0, borderRight:'1px solid #e2e8f0' }} />
          <div style={{ flex:1, textAlign:'center', padding:'10px 4px' }}>
            <div style={{ fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', color:'#64748b' }}>{DAYS_ES[currentDate.getDay()]}</div>
            <div style={{ fontWeight:800, fontSize:'1.3rem', background: isToday?'#7e22ce':'transparent', color: isToday?'white':'#1e293b', width: isToday?'34px':'auto', height: isToday?'34px':'auto', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', margin:'4px auto 0' }}>{currentDate.getDate()}</div>
          </div>
        </div>
        <div style={{ display:'flex', minHeight:`${HOURS.length*H_PX}px` }}>
          <TimesCol />
          <div style={{ flex:1, position:'relative', minHeight:`${HOURS.length*H_PX}px` }}>
            {HOURS.map(h => <div key={h} style={{ height:`${H_PX}px`, borderBottom:'1px solid #f1f5f9' }} />)}
            {shifts.filter(s => s.date === ds).map(s => <ShiftEvent key={s.id} shift={s} />)}
          </div>
        </div>
      </>
    )
  }

  const WeekView = () => {
    const ws = weekStart(currentDate)
    const days = Array.from({length:7}, (_, i) => { const d = new Date(ws); d.setDate(ws.getDate()+i); return d })
    return (
      <>
        <div style={{ display:'flex', position:'sticky', top:0, zIndex:10, background:'white', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ width:'68px', flexShrink:0, borderRight:'1px solid #e2e8f0' }} />
          {days.map((d, i) => {
            const isT = dateToStr(d) === dateToStr(TODAY)
            return (
              <div key={i} onClick={() => { setCurrentDate(d); setView('day') }} style={{ flex:1, textAlign:'center', padding:'10px 4px', borderRight:'1px solid #e2e8f0', cursor:'pointer' }}>
                <div style={{ fontSize:'.66rem', fontWeight:700, textTransform:'uppercase', color:'#64748b' }}>{DAYS_ES[d.getDay()]}</div>
                <div style={{ fontWeight:800, fontSize:'1.1rem', background: isT?'#7e22ce':'transparent', color: isT?'white':'#1e293b', width: isT?'30px':'auto', height: isT?'30px':'auto', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', margin:'4px auto 0' }}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display:'flex', minHeight:`${HOURS.length*H_PX}px` }}>
          <TimesCol />
          {days.map((d, i) => {
            const ds = dateToStr(d)
            return (
              <div key={i} style={{ flex:1, borderRight:'1px solid #e2e8f0', position:'relative', minHeight:`${HOURS.length*H_PX}px` }}>
                {HOURS.map(h => <div key={h} style={{ height:`${H_PX}px`, borderBottom:'1px solid #f1f5f9' }} />)}
                {shifts.filter(s => s.date === ds).map(s => <ShiftEvent key={s.id} shift={s} />)}
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const MonthView = () => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const daysInMonth = new Date(year, month+1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()
    const cells = []
    for (let i = startOffset-1; i >= 0; i--) cells.push({ day: prevDays-i, cur: false, ds: '' })
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true, ds: `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
    const rem = (7 - cells.length % 7) % 7
    for (let d = 1; d <= rem; d++) cells.push({ day: d, cur: false, ds: '' })
    return (
      <>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid #e2e8f0', background:'white', position:'sticky', top:0, zIndex:5 }}>
          {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(n => (
            <div key={n} style={{ textAlign:'center', padding:'8px', fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', color:'#64748b' }}>{n}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gridAutoRows:'minmax(100px,1fr)' }}>
          {cells.map((c, i) => {
            const isT = c.cur && c.ds === dateToStr(TODAY)
            const dayShifts = c.ds ? shifts.filter(s => s.date === c.ds) : []
            return (
              <div key={i} onDoubleClick={() => c.ds && (setCurrentDate(new Date(c.ds+'T12:00:00')), setView('day'))} style={{ borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:'5px', overflow:'hidden', cursor:'pointer' }}>
                <div style={{ fontWeight:700, fontSize:'.78rem', width:'26px', height:'26px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', marginBottom:'3px', background: isT?'#7e22ce':'transparent', color: isT?'white':c.cur?'#1e293b':'#cbd5e1' }}>{c.day}</div>
                {dayShifts.slice(0,2).map(s => {
                  const c2 = COLORS[s.color] ?? COLORS['ev-purple']
                  return <div key={s.id} style={{ fontSize:'.66rem', fontWeight:700, padding:'2px 6px', borderRadius:'4px', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', background:c2.bg, color:c2.color }}>{getVetName(s.vet)}</div>
                })}
                {dayShifts.length > 2 && <div style={{ fontSize:'.64rem', color:'#94a3b8' }}>+{dayShifts.length-2} más</div>}
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:"'DM Sans', sans-serif" }}>

      {/* Topbar */}
      <div style={{ background:s.white, borderBottom:`1.5px solid ${s.border}`, padding:'0 24px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h5 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>Gestión de Turnos</h5>
          <small style={{ color:s.textLight }}>{new Date().toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ position:'relative' }}>
            <button style={{ width:'38px', height:'38px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', display:'grid', placeItems:'center', cursor:'pointer' }}>🔔</button>
            <span style={{ position:'absolute', top:'1px', right:'1px', width:'18px', height:'18px', background:'#e05252', borderRadius:'50%', fontSize:'.6rem', fontWeight:800, color:'white', display:'grid', placeItems:'center', border:'2px solid white' }}>3</span>
          </div>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#1e3a5f', display:'grid', placeItems:'center', fontWeight:800, fontSize:'.75rem', color:'white' }}>AD</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background:s.white, borderBottom:`1px solid ${s.border}`, padding:'10px 24px', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
        <button onClick={() => setCurrentDate(new Date(TODAY))} style={{ border:`1.5px solid ${s.border}`, background:'white', borderRadius:'8px', padding:'6px 14px', fontSize:'.78rem', fontWeight:700, cursor:'pointer' }}>Hoy</button>
        <div style={{ display:'flex', gap:'2px' }}>
          <button onClick={navPrev} style={{ border:'none', background:'none', cursor:'pointer', color:'#94a3b8', fontSize:'1rem', padding:'5px 10px', borderRadius:'6px' }}>‹</button>
          <button onClick={navNext} style={{ border:'none', background:'none', cursor:'pointer', color:'#94a3b8', fontSize:'1rem', padding:'5px 10px', borderRadius:'6px' }}>›</button>
        </div>
        <span style={{ fontWeight:800, fontSize:'1rem' }}>{getTitle()}</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ display:'flex', border:`1.5px solid ${s.border}`, borderRadius:'8px', overflow:'hidden' }}>
            {['day','week','month'].map((v, i) => (
              <button key={v} onClick={() => setView(v)} style={{ border:'none', background: view===v?'#7e22ce':'white', color: view===v?'white':'#64748b', padding:'5px 14px', fontSize:'.75rem', fontWeight:700, cursor:'pointer' }}>{['Día','Semana','Mes'][i]}</button>
            ))}
          </div>
          <button onClick={() => { setForm(p => ({...p, fecha: dateToStr(currentDate)})); setModal(true) }} style={{ background:'#7e22ce', color:'white', border:'none', borderRadius:'8px', padding:'7px 15px', fontSize:'.78rem', fontWeight:700, cursor:'pointer' }}>+ Nuevo Turno</button>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ flex:1, overflow:'auto' }}>
        {view === 'day' && <DayView />}
        {view === 'week' && <WeekView />}
        {view === 'month' && <MonthView />}
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={(e) => e.target===e.currentTarget && setModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 20px 60px rgba(0,0,0,.2)', width:'480px', maxWidth:'95vw', maxHeight:'92vh', overflowY:'auto' }}>
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>📅</div>
              <h5 style={{ fontWeight:800, fontSize:'1rem', margin:0, flex:1 }}>Asignar Nuevo Turno</h5>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'1.1rem', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 22px' }}>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px' }}>Veterinario</label>
                <select value={form.vet} onChange={e => setForm(p=>({...p,vet:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 11px', fontSize:'.83rem', outline:'none' }}>
                  <option value="">— Seleccionar veterinario —</option>
                  {vets.map(v => <option key={v.idUsuario} value={v.idUsuario}>Dr. {v.nombres} {v.apellidos}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px' }}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(p=>({...p,fecha:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 11px', fontSize:'.83rem', outline:'none' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px' }}>Hora inicio</label>
                  <input type="time" value={form.inicio} onChange={e => setForm(p=>({...p,inicio:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 11px', fontSize:'.83rem', outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px' }}>Hora fin</label>
                  <input type="time" value={form.fin} onChange={e => setForm(p=>({...p,fin:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 11px', fontSize:'.83rem', outline:'none' }} />
                </div>
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px' }}>Tipo de turno</label>
                <select value={form.tipo} onChange={e => setForm(p=>({...p,tipo:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 11px', fontSize:'.83rem', outline:'none' }}>
                  {['Turno mañana','Turno tarde','Turno noche','Turno completo','Guardia'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px' }}>Notas (opcional)</label>
                <textarea value={form.notas} onChange={e => setForm(p=>({...p,notas:e.target.value}))} rows={2} placeholder="Indicaciones especiales…" style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 11px', fontSize:'.83rem', outline:'none', resize:'none', fontFamily:'inherit' }} />
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'8px' }}>Color en calendario</label>
                <div style={{ display:'flex', gap:'8px' }}>
                  {Object.entries(COLORS).map(([key, c]) => (
                    <div key={key} onClick={() => setNtColor(key)} style={{ width:'22px', height:'22px', borderRadius:'50%', background:c.border, cursor:'pointer', border: ntColor===key?'2px solid #1e293b':'2px solid transparent', transform: ntColor===key?'scale(1.2)':'scale(1)', transition:'all .15s' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding:'14px 22px', borderTop:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', gap:'8px', justifyContent:'flex-end', borderRadius:'0 0 16px 16px' }}>
              <button onClick={() => setModal(false)} style={{ background:'white', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 18px', fontSize:'.8rem', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
              <button onClick={handleGuardar} style={{ background:'#7e22ce', color:'white', border:'none', borderRadius:'8px', padding:'8px 20px', fontSize:'.8rem', fontWeight:700, cursor:'pointer' }}>Guardar turno</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', background:'#1e293b', color:'white', padding:'10px 24px', borderRadius:'24px', fontSize:'.82rem', fontWeight:700, zIndex:9999 }}>{toast}</div>
      )}
    </div>
  )
  export default AdminTurnos
}
