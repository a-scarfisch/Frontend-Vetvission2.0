import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import apiClient from '@/modules/core/lib/apiClient'

const COLORS = ['#0ea5e9','#22c55e','#f97316','#8b5cf6','#ec4899','#f59e0b','#10b981','#6366f1','#ef4444','#14b8a6']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

const s = {
  teal:'#037389', tealDark:'#0e8f80', tealLight:'#e6f9f7', tealMid:'#a8ede7',
  tealBtn:'#1ab5a3', border:'#e2e8f0', gray:'#f4f6f8',
  textDark:'#1a2535', textMid:'#4a5568', textLight:'#94a3b8',
  white:'#fff', red:'#e05252', redLight:'#fdeaea',
  green:'#16a34a', greenLight:'#dcfce7',
  amber:'#f5a623', amberLight:'#fef9c3',
}

const statusStyle = {
  activo:   { bg: s.greenLight, color: s.green },
  inactivo: { bg: s.gray, color: s.textLight },
  alerta:   { bg: s.amberLight, color: s.amber },
}

const VetHistorial = () => {
  const { user } = useAuthContext()
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const [historial, setHistorial] = useState(null)
  const [toast, setToast] = useState(null)

  const hoy = new Date()
  const POR_PAGINA = 10

  useEffect(() => {
    apiClient.get('/mascotas')
      .then(res => setPacientes(res.data.data ?? []))
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg, tipo='success') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3200)
  }

  const filtrados = pacientes.filter(p => {
    const matchNombre = !buscar || p.nombre?.toLowerCase().includes(buscar.toLowerCase()) || p.usuario?.nombres?.toLowerCase().includes(buscar.toLowerCase())
    const matchEspecie = !filtroEspecie || p.especie === filtroEspecie
    const matchEstado = !filtroEstado || (p.estado ?? 'activo') === filtroEstado
    return matchNombre && matchEspecie && matchEstado
  })

  const totalPags = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginados = filtrados.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA)

  const inputStyle = { padding:'9px 14px', border:`1.5px solid ${s.border}`, borderRadius:'9px', fontSize:'.84rem', outline:'none', background:s.white, color:s.textDark, fontFamily:"'DM Sans', sans-serif" }

  return (
    <>
      {/* Topbar */}
      <div style={{ background:s.white, borderBottom:`1.5px solid ${s.border}`, padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <h5 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>Historial Clínico de Pacientes</h5>
          <small style={{ color:s.textLight }}>{DIAS[hoy.getDay()]}, {hoy.getDate()} de {MESES[hoy.getMonth()]} de {hoy.getFullYear()}</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'9px', background:s.gray, border:`1.5px solid ${s.border}`, borderRadius:'50px', padding:'8px 18px', width:'280px' }}>
            <span style={{ color:s.textLight }}>🔍</span>
            <input value={buscar} onChange={e => { setBuscar(e.target.value); setPagina(1) }} placeholder="Buscar paciente..." style={{ border:'none', background:'none', outline:'none', fontSize:'.87rem', width:'100%' }} />
          </div>
          <div style={{ position:'relative' }}>
            <button style={{ width:'38px', height:'38px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', display:'grid', placeItems:'center', cursor:'pointer' }}>🔔</button>
            <span style={{ position:'absolute', top:'1px', right:'1px', width:'18px', height:'18px', background:s.red, borderRadius:'50%', fontSize:'.6rem', fontWeight:800, color:'white', display:'grid', placeItems:'center', border:'2px solid white' }}>3</span>
          </div>
        </div>
      </div>

      <div style={{ padding:'28px 32px', flex:1, minHeight:'100vh', background:s.gray }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' }}>
          {[
            { icon:'👥', bg:'#e0f2fe', label:'Pacientes Activos', val: loading ? '—' : pacientes.filter(p => (p.estado ?? 'activo') === 'activo').length },
            { icon:'📅', bg:'#dcfce7', label:'Citas Hoy', val:'—' },
            { icon:'⚠️', bg:'#fef9c3', label:'Vacunas Pendientes', val: loading ? '—' : pacientes.filter(p => p.estado === 'alerta').length },
            { icon:'🆕', bg:'#f3e8ff', label:'Total Registrados', val: loading ? '—' : pacientes.length },
          ].map(k => (
            <div key={k.label} style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'14px', padding:'18px 20px', display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:k.bg, display:'grid', placeItems:'center', fontSize:'1.3rem', flexShrink:0 }}>{k.icon}</div>
              <div>
                <div style={{ fontWeight:900, fontSize:'1.6rem', lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:'.75rem', color:s.textLight, marginTop:'3px' }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, minWidth:'200px' }}>
            <span style={{ color:s.textLight }}>🔍</span>
            <input value={buscar} onChange={e => { setBuscar(e.target.value); setPagina(1) }} placeholder="Buscar por nombre o dueño..." style={{ ...inputStyle, flex:1 }} />
          </div>
          <select value={filtroEspecie} onChange={e => { setFiltroEspecie(e.target.value); setPagina(1) }} style={inputStyle}>
            <option value="">Todas las especies</option>
            <option>Perro</option><option>Gato</option><option>Conejo</option><option>Ave</option>
          </select>
          <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }} style={inputStyle}>
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="alerta">Alerta</option>
          </select>
        </div>

        {/* Tabla */}
        <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'14px', overflow:'hidden' }}>
          <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${s.border}` }}>
            <h6 style={{ fontWeight:800, fontSize:'1rem', margin:0 }}>Lista de Pacientes</h6>
            <span style={{ fontSize:'.78rem', color:s.textLight }}>Mostrando {paginados.length} de {filtrados.length}</span>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border spinner-border-sm" style={{ color:s.teal }}></div></div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:s.textLight }}>Sin resultados para los filtros aplicados.</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafbfc' }}>
                    {['Paciente','Especie / Raza','Edad','Dueño','Última Visita','Estado','Acciones'].map((h,i) => (
                      <th key={i} style={{ padding:'10px 20px', fontSize:'.68rem', fontWeight:800, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', borderBottom:`1.5px solid ${s.border}`, textAlign: i===6 ? 'center' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginados.map((p, idx) => {
                    const estado = p.estado ?? 'activo'
                    const st = statusStyle[estado] ?? statusStyle.activo
                    return (
                      <tr key={p.idMascota ?? idx} style={{ borderBottom:`1px solid ${s.border}` }}>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:COLORS[idx % COLORS.length], display:'grid', placeItems:'center', fontWeight:900, fontSize:'.9rem', color:'white', flexShrink:0 }}>{p.nombre?.[0]?.toUpperCase()}</div>
                            <span style={{ fontWeight:700, color:s.textDark }}>{p.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{p.especie} · <span style={{ color:s.textLight }}>{p.raza}</span></td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{p.edad ?? '—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{p.usuario?.nombres ?? p.dueno ?? '—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{p.ultimaVisita ?? '—'}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontSize:'.7rem', fontWeight:800, padding:'4px 12px', borderRadius:'50px', background:st.bg, color:st.color }}>{estado.charAt(0).toUpperCase()+estado.slice(1)}</span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', gap:'6px', justifyContent:'center' }}>
                            <button onClick={() => setHistorial(p)} title="Historial Clínico" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:s.white, cursor:'pointer', fontSize:'.84rem' }}>📋</button>
                            <button title="Editar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:s.white, cursor:'pointer', fontSize:'.84rem' }}>✏️</button>
                            <button title="Eliminar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:s.white, cursor:'pointer', fontSize:'.84rem' }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          <div style={{ padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${s.border}`, fontSize:'.82rem', color:s.textMid }}>
            <span>Página {pagina} de {totalPags}</span>
            <div style={{ display:'flex', gap:'6px' }}>
              <button onClick={() => setPagina(p => Math.max(1, p-1))} disabled={pagina===1} style={{ width:'34px', height:'34px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:'none', cursor:'pointer', fontWeight:700, opacity: pagina===1 ? .4 : 1 }}>‹</button>
              {Array.from({length: Math.min(5, totalPags)}, (_, i) => {
                const pg = Math.max(1, Math.min(pagina-2, totalPags-4)) + i
                return (
                  <button key={pg} onClick={() => setPagina(pg)} style={{ width:'34px', height:'34px', borderRadius:'8px', border:`1.5px solid ${pg===pagina ? s.teal : s.border}`, background: pg===pagina ? s.teal : 'none', color: pg===pagina ? '#fff' : s.textMid, cursor:'pointer', fontWeight:700 }}>{pg}</button>
                )
              })}
              <button onClick={() => setPagina(p => Math.min(totalPags, p+1))} disabled={pagina===totalPags} style={{ width:'34px', height:'34px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:'none', cursor:'pointer', fontWeight:700, opacity: pagina===totalPags ? .4 : 1 }}>›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Historial */}
      {historial && (
        <div onClick={(e) => e.target === e.currentTarget && setHistorial(null)} style={{ position:'fixed', inset:0, background:'rgba(10,18,28,.55)', zIndex:500, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px', overflowY:'auto', backdropFilter:'blur(4px)' }}>
          <div style={{ background:s.gray, width:'100%', maxWidth:'1160px', borderRadius:'20px', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.22)', minHeight:'90vh', display:'flex', flexDirection:'column' }}>

            {/* Modal topbar */}
            <div style={{ background:s.white, borderBottom:`1px solid ${s.border}`, padding:'0 28px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <span style={{ fontSize:'.82rem', color:s.textLight, fontWeight:600 }}>🏥 PetVission — Historial Clínico</span>
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', fontWeight:700, fontSize:'.88rem' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:s.tealMid, display:'grid', placeItems:'center', fontSize:'1.1rem' }}>👨‍⚕️</div>
                  Dr. {user?.nombres} {user?.apellidos}
                </div>
                <button onClick={() => setHistorial(null)} style={{ width:'32px', height:'32px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', cursor:'pointer', fontSize:'.9rem', color:s.textMid }}>✕</button>
              </div>
            </div>

            {/* Patient bar */}
            <div style={{ background:s.white, borderBottom:`1px solid ${s.border}`, padding:'10px 28px', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:s.teal, display:'grid', placeItems:'center', fontSize:'1.4rem' }}>🐾</div>
              <div>
                <div style={{ fontWeight:800, fontSize:'1rem' }}>{historial.nombre}</div>
                <div style={{ fontSize:'.78rem', color:s.textMid }}>{historial.especie} · {historial.raza} · {historial.edad ?? '—'} · Dueño: {historial.usuario?.nombres ?? historial.dueno ?? '—'}</div>
              </div>
              <button onClick={() => showToast('📋 Abriendo nueva consulta...','success')} style={{ marginLeft:'auto', background:s.tealBtn, color:'white', border:'none', borderRadius:'10px', padding:'10px 22px', fontWeight:800, fontSize:'.85rem', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.04em' }}>+ Nueva Consulta</button>
            </div>

            {/* 3 col body */}
            <div style={{ display:'grid', gridTemplateColumns:'280px 1fr 300px', flex:1, minHeight:0, overflow:'hidden' }}>

              {/* Col 1: Perfil */}
              <div style={{ background:s.white, borderRight:`1px solid ${s.border}`, padding:'20px 18px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ border:`1.5px solid ${s.border}`, borderRadius:'14px', padding:'20px 16px', textAlign:'center' }}>
                  <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:s.tealLight, display:'grid', placeItems:'center', fontSize:'2.2rem', margin:'0 auto 10px', border:`3px solid ${s.tealMid}` }}>🐾</div>
                  <div style={{ fontWeight:900, fontSize:'1.05rem' }}>{historial.nombre}</div>
                  <div style={{ fontSize:'.78rem', color:s.textMid, marginTop:'4px' }}>{historial.raza} · {historial.edad ?? '—'}</div>
                  <div style={{ marginTop:'10px', display:'flex', justifyContent:'center', gap:'14px' }}>
                    {['📋 Fichas','📸 Fotos','✏️ Editar'].map(l => <span key={l} style={{ fontSize:'.78rem', color:s.teal, fontWeight:700, cursor:'pointer' }}>{l}</span>)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize:'.65rem', fontWeight:800, color:s.textLight, letterSpacing:'.1em', textTransform:'uppercase', display:'block', borderBottom:`1.5px solid ${s.border}`, paddingBottom:'8px', marginBottom:'4px' }}>Signos Vitales</span>
                  {[['⚖️','Peso', historial.peso, 'kg'], ['📏','Talla', historial.talla, 'cm'], ['🌡️','Temperatura', historial.temperatura, '°C'], ['❤️','Frec. Cardíaca', historial.frecuenciaCardiaca, 'lpm']].map(([icon, name, val, unit]) => (
                    <div key={name} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 4px', borderBottom:`1px solid ${s.border}` }}>
                      <span style={{ fontSize:'1.1rem', width:'26px', textAlign:'center' }}>{icon}</span>
                      <span style={{ fontSize:'.83rem', color:s.textMid, flex:1 }}>{name}</span>
                      <span style={{ fontWeight:800, fontSize:'.88rem' }}>{val ?? '—'}<span style={{ fontSize:'.72rem', color:s.textLight, marginLeft:'2px' }}>{unit}</span></span>
                    </div>
                  ))}
                </div>

                <div>
                  <span style={{ fontSize:'.65rem', fontWeight:800, color:s.textLight, letterSpacing:'.1em', textTransform:'uppercase', display:'block', borderBottom:`1.5px solid ${s.border}`, paddingBottom:'8px', marginBottom:'4px' }}>Archivos Adjuntos</span>
                  <p style={{ fontSize:'.78rem', color:s.textLight, padding:'8px 0' }}>Sin archivos adjuntos.</p>
                  <button onClick={() => showToast('📁 Función próximamente')} style={{ width:'100%', marginTop:'8px', background:s.tealBtn, color:'white', border:'none', borderRadius:'9px', padding:'10px', fontWeight:800, fontSize:'.82rem', cursor:'pointer', textTransform:'uppercase' }}>⬆ Subir Archivo</button>
                </div>
              </div>

              {/* Col 2: Antecedentes */}
              <div style={{ overflowY:'auto', padding:'24px 28px', background:s.gray }}>
                <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'14px', padding:'22px 26px', marginBottom:'18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:800, fontSize:'.85rem', color:s.teal, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'16px' }}>
                    <div style={{ width:'22px', height:'22px', borderRadius:'6px', background:s.teal, display:'grid', placeItems:'center', color:'white', fontSize:'.72rem' }}>⚠</div>
                    Alergias y Contraindicaciones
                  </div>
                  {historial.alergias?.length > 0 ? (
                    <div style={{ background:s.redLight, border:'1.5px solid #f5c6c6', borderRadius:'10px', padding:'14px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:700, fontSize:'.88rem', color:s.red, marginBottom:'10px' }}>⚠️ Paciente con alergias registradas</div>
                      <ul style={{ listStyle:'none', paddingLeft:'16px' }}>
                        {historial.alergias.map((a, i) => <li key={i} style={{ fontSize:'.82rem', color:s.red, padding:'2px 0' }}>- {a}</li>)}
                      </ul>
                    </div>
                  ) : (
                    <p style={{ fontSize:'.82rem', color:s.textLight }}>Sin alergias registradas.</p>
                  )}
                </div>

                <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'14px', padding:'22px 26px', marginBottom:'18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:800, fontSize:'.85rem', color:s.teal, textTransform:'uppercase', marginBottom:'16px' }}>
                    <div style={{ width:'22px', height:'22px', borderRadius:'6px', background:s.teal, display:'grid', placeItems:'center', color:'white', fontSize:'.72rem' }}>📋</div>
                    Antecedentes Médicos
                  </div>
                  {[
                    ['Esterilizado/Castrado', historial.esterilizado ? 'Sí' : 'No registrado'],
                    ['Microchip', historial.microchip ?? 'No registrado'],
                    ['Enfermedades crónicas', historial.enfermedadesCronicas ?? 'Ninguna registrada'],
                    ['Cirugías previas', historial.cirugiasPrevias ?? 'Ninguna registrada'],
                    ['Última desparasitación', historial.ultimaDesparasitacion ?? 'No registrada'],
                    ['Vacunas al día', historial.vacunasAlDia ? 'Sí' : 'No registrado'],
                  ].map(([key, val]) => (
                    <div key={key} style={{ display:'grid', gridTemplateColumns:'190px 1fr', gap:'10px', padding:'11px 0', borderBottom:`1px solid ${s.border}`, fontSize:'.86rem' }}>
                      <span style={{ fontWeight:700, color:s.textDark }}>{key}</span>
                      <span style={{ color:s.textMid }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'14px', padding:'22px 26px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:800, fontSize:'.85rem', color:s.teal, textTransform:'uppercase', marginBottom:'16px' }}>
                    <div style={{ width:'22px', height:'22px', borderRadius:'6px', background:s.teal, display:'grid', placeItems:'center', color:'white', fontSize:'.72rem' }}>💊</div>
                    Medicación Actual
                  </div>
                  {historial.medicacionActual?.length > 0 ? (
                    historial.medicacionActual.map((m, i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'190px 1fr', gap:'10px', padding:'11px 0', borderBottom:`1px solid ${s.border}`, fontSize:'.86rem' }}>
                        <span style={{ fontWeight:700 }}>{m.tipo}</span>
                        <span style={{ color:s.textMid }}>{m.detalle}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize:'.82rem', color:s.textLight }}>Sin medicación activa registrada.</p>
                  )}
                </div>
              </div>

              {/* Col 3: Consultas */}
              <div style={{ background:s.white, borderLeft:`1px solid ${s.border}`, overflowY:'auto', padding:'20px 18px', display:'flex', flexDirection:'column' }}>
                <div style={{ fontSize:'.65rem', fontWeight:800, color:s.textLight, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'10px' }}>Reserva Agendada</div>
                <p style={{ fontSize:'.82rem', color:s.textMid, lineHeight:1.5, marginBottom:'20px' }}>No hay consultas agendadas próximamente.</p>

                <div style={{ fontSize:'.65rem', fontWeight:800, color:s.textLight, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'10px' }}>Historial de Consultas</div>
                {historial.consultas?.length > 0 ? (
                  historial.consultas.map((c, i) => {
                    const fecha = new Date(c.fechaHora ?? c.fecha)
                    return (
                      <div key={i} style={{ display:'flex', borderLeft:`3px solid ${s.teal}`, background:s.white, marginBottom:'12px', borderRadius:'0 10px 10px 0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.06)', cursor:'pointer' }}>
                        <div style={{ minWidth:'58px', background:s.gray, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 8px', borderRight:`1px solid ${s.border}` }}>
                          <div style={{ fontWeight:900, fontSize:'1.4rem', color:s.teal, lineHeight:1 }}>{fecha.getDate()}</div>
                          <div style={{ fontSize:'.62rem', fontWeight:800, color:s.tealDark, textTransform:'uppercase' }}>{['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][fecha.getMonth()]}</div>
                          <div style={{ fontSize:'.62rem', color:s.textLight }}>{fecha.getFullYear()}</div>
                        </div>
                        <div style={{ padding:'10px 12px', flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:'.88rem', color:s.textDark, marginBottom:'3px' }}>{c.motivo ?? 'Consulta'}</div>
                          <div style={{ fontSize:'.75rem', color:s.textLight, fontStyle:'italic', marginBottom:'5px' }}>{c.diagnostico ?? '—'}</div>
                          <div style={{ fontSize:'.72rem', color:s.textMid }}>{c.medicacion ?? ''}</div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p style={{ fontSize:'.82rem', color:s.textLight }}>Sin consultas registradas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', background: toast.tipo === 'success' ? s.tealBtn : s.textDark, color:'white', padding:'11px 22px', borderRadius:'50px', fontWeight:700, fontSize:'.86rem', zIndex:800, whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,.18)' }}>{toast.msg}</div>
      )}
    </>
  )
}

export default VetHistorial