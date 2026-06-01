import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import apiClient from '@/modules/core/lib/apiClient'

const COLORS = ['#0ea5e9','#22c55e','#f97316','#7e22ce','#e05252','#1a9e8f','#f5a623']

const VetPacientes = () => {
  const { user } = useAuthContext()
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre:'', especie:'', raza:'', fechaNacimiento:'', peso:'', dueno:'', telefono:'', animalServicio:'no' })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    apiClient.get('/mascotas')
      .then(res => setPacientes(res.data.data ?? []))
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleGuardar = async () => {
    try {
      await apiClient.post('/mascotas', form)
      showToast('✅ Paciente registrado correctamente')
      setModal(false)
      setForm({ nombre:'', especie:'', raza:'', fechaNacimiento:'', peso:'', dueno:'', telefono:'', animalServicio:'no' })
      const res = await apiClient.get('/mascotas')
      setPacientes(res.data.data ?? [])
    } catch {
      showToast('⚠️ Error al guardar el paciente')
    }
  }

  const filtrados = pacientes.filter(p => {
    const matchNombre = !buscar || p.nombre?.toLowerCase().includes(buscar.toLowerCase()) || p.dueno?.toLowerCase().includes(buscar.toLowerCase())
    const matchEspecie = !filtroEspecie || p.especie === filtroEspecie
    return matchNombre && matchEspecie
  })

  const total = pacientes.length
  const perros = pacientes.filter(p => p.especie === 'Perro').length
  const gatos = pacientes.filter(p => p.especie === 'Gato').length

  const s = { teal:'#1ab5a3', tealDark:'#0e8f80', border:'#e2e8f0', gray:'#f4f6f8', textDark:'#1a2535', textMid:'#4a5568', textLight:'#94a3b8', white:'#fff', red:'#e05252' }

  const inputStyle = { width:'100%', padding:'10px 14px', border:`1.5px solid ${s.border}`, borderRadius:'10px', fontSize:'.88rem', outline:'none', fontFamily:"'DM Sans', sans-serif" }
  const labelStyle = { display:'block', fontSize:'.72rem', fontWeight:700, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'6px' }

  return (
    <>
      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:`1.5px solid ${s.border}`, padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <h5 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>Pacientes</h5>
          <small style={{ color:s.textLight }}>Gestión de mascotas registradas</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'9px', background:s.gray, border:`1.5px solid ${s.border}`, borderRadius:'50px', padding:'8px 18px', width:'280px' }}>
            <span style={{ color:s.textLight }}>🔍</span>
            <input value={buscar} onChange={e => setBuscar(e.target.value)} type="text" placeholder="Buscar paciente..." style={{ border:'none', background:'none', outline:'none', fontSize:'.87rem', width:'100%' }} />
          </div>
          <div style={{ position:'relative' }}>
            <button style={{ width:'38px', height:'38px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', display:'grid', placeItems:'center', cursor:'pointer' }}>🔔</button>
            <span style={{ position:'absolute', top:'1px', right:'1px', width:'18px', height:'18px', background:s.red, borderRadius:'50%', fontSize:'.6rem', fontWeight:800, color:'white', display:'grid', placeItems:'center', border:'2px solid white' }}>3</span>
          </div>
        </div>
      </div>

      <div style={{ padding:'28px 32px', flex:1, minHeight:'100vh', background:s.gray }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18px', marginBottom:'28px' }}>
          {[
            { icon:'👥', bg:'#eff6ff', iconColor:'#3b82f6', label:'Total Pacientes', val:loading?'—':total, sub:`${perros+gatos > 0 ? Math.round(perros/total*100) : 0}% perros` },
            { icon:'🐶', bg:'#fff7ed', iconColor:'#f97316', label:'Perros', val:loading?'—':perros, sub:`${total > 0 ? Math.round(perros/total*100) : 0}% del total` },
            { icon:'🐱', bg:'#f0fdf4', iconColor:'#22c55e', label:'Gatos', val:loading?'—':gatos, sub:`${total > 0 ? Math.round(gatos/total*100) : 0}% del total` },
            { icon:'⚠️', bg:'#fef2f2', iconColor:'#ef4444', label:'Casos Urgentes', val:'0', sub:'Requieren atención' },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff', border:`1.5px solid ${s.border}`, borderRadius:'16px', padding:'20px 22px', display:'flex', alignItems:'center', gap:'18px' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:k.bg, display:'grid', placeItems:'center', fontSize:'1.4rem', flexShrink:0 }}>{k.icon}</div>
              <div>
                <div style={{ fontSize:'.78rem', color:s.textLight, marginBottom:'2px' }}>{k.label}</div>
                <div style={{ fontWeight:900, fontSize:'1.7rem', lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:'.72rem', color:s.textLight, marginTop:'3px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ background:'#fff', border:`1.5px solid ${s.border}`, borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${s.border}` }}>
            <h6 style={{ fontWeight:800, fontSize:'1.05rem', margin:0 }}>Lista de Pacientes</h6>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setModal(true)} style={{ background:s.teal, color:'#fff', border:'none', borderRadius:'9px', padding:'9px 20px', fontWeight:800, fontSize:'.88rem', cursor:'pointer' }}>+ Añadir Nuevo Paciente</button>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div style={{ padding:'12px 24px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[['', 'Todos'], ['Perro', '🐶 Perros'], ['Gato', '🐱 Gatos']].map(([val, label]) => (
              <button key={val} onClick={() => setFiltroEspecie(val)} style={{ border:`1.5px solid ${filtroEspecie === val ? '#3b82f6' : s.border}`, borderRadius:'20px', padding:'4px 14px', fontSize:'.8rem', background: filtroEspecie === val ? '#eff6ff' : '#fff', color: filtroEspecie === val ? '#1d4ed8' : s.textMid, cursor:'pointer', fontWeight:600 }}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border spinner-border-sm" style={{ color:s.teal }}></div></div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:s.textLight }}>No se encontraron pacientes.</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1.5px solid ${s.border}` }}>
                    {['Nombre','Especie','Raza','Dueño','Teléfono','Última Visita','Animal de Servicio',''].map((h,i) => (
                      <th key={i} style={{ padding:'12px 16px', fontSize:'.72rem', fontWeight:800, color:s.textLight, letterSpacing:'.07em', textTransform:'uppercase', textAlign:'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p, idx) => (
                    <tr key={p.idMascota ?? idx} style={{ borderBottom:`1px solid ${s.border}` }}>
                      <td style={{ padding:'16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:COLORS[idx % COLORS.length], display:'grid', placeItems:'center', fontWeight:900, fontSize:'.85rem', color:'white', flexShrink:0 }}>{p.nombre?.[0]?.toUpperCase()}</div>
                          <span style={{ fontWeight:600 }}>{p.nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding:'16px', fontSize:'.88rem', color:s.textMid }}>{p.especie}</td>
                      <td style={{ padding:'16px', fontSize:'.88rem', color:s.textMid }}>{p.raza}</td>
                      <td style={{ padding:'16px', fontSize:'.88rem', color:s.textMid }}>{p.dueno ?? p.usuario?.nombres ?? '—'}</td>
                      <td style={{ padding:'16px', fontSize:'.88rem', color:s.textMid }}>{p.telefono ?? p.usuario?.telefono ?? '—'}</td>
                      <td style={{ padding:'16px', fontSize:'.88rem', color:s.textMid }}>{p.ultimaVisita ?? '—'}</td>
                      <td style={{ padding:'16px' }}>
                        <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:'12px', fontSize:'.75rem', fontWeight:600, background: p.animalServicio ? '#dcfce7' : '#f1f5f9', color: p.animalServicio ? '#15803d' : '#64748b' }}>
                          {p.animalServicio ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding:'16px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button title="Historial" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:'#fff', cursor:'pointer', fontSize:'.88rem' }}>📋</button>
                          <button title="Editar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:'#fff', cursor:'pointer', fontSize:'.88rem' }}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Paciente */}
      {modal && (
        <div onClick={(e) => e.target === e.currentTarget && setModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:300, display:'grid', placeItems:'center', padding:'16px' }}>
          <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'520px', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
            <button onClick={() => setModal(false)} style={{ position:'absolute', top:'14px', right:'14px', width:'30px', height:'30px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', cursor:'pointer' }}>✕</button>
            <h5 style={{ fontWeight:900, marginBottom:'24px' }}>Nuevo Paciente</h5>

            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Nombre</label>
              <input value={form.nombre} onChange={e => setForm(p => ({...p, nombre:e.target.value}))} placeholder="Nombre de la mascota" style={inputStyle} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div>
                <label style={labelStyle}>Especie</label>
                <select value={form.especie} onChange={e => setForm(p => ({...p, especie:e.target.value}))} style={inputStyle}>
                  <option value="">Seleccionar</option>
                  <option>Perro</option><option>Gato</option><option>Ave</option><option>Conejo</option><option>Otro</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Raza</label>
                <input value={form.raza} onChange={e => setForm(p => ({...p, raza:e.target.value}))} placeholder="Raza" style={inputStyle} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div>
                <label style={labelStyle}>Fecha Nacimiento</label>
                <input type="date" value={form.fechaNacimiento} onChange={e => setForm(p => ({...p, fechaNacimiento:e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input type="number" value={form.peso} onChange={e => setForm(p => ({...p, peso:e.target.value}))} placeholder="0.0" step="0.1" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Dueño</label>
              <input value={form.dueno} onChange={e => setForm(p => ({...p, dueno:e.target.value}))} placeholder="Nombre del dueño" style={inputStyle} />
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Teléfono</label>
              <input value={form.telefono} onChange={e => setForm(p => ({...p, telefono:e.target.value}))} placeholder="+56 9 XXXX XXXX" style={inputStyle} />
            </div>
            <div style={{ marginBottom:'24px' }}>
              <label style={labelStyle}>Animal de Servicio</label>
              <select value={form.animalServicio} onChange={e => setForm(p => ({...p, animalServicio:e.target.value}))} style={inputStyle}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>

            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1.5px solid ${s.border}`, background:'none', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
              <button onClick={handleGuardar} style={{ flex:2, padding:'12px', borderRadius:'10px', border:'none', background:s.teal, color:'#fff', fontWeight:800, cursor:'pointer' }}>Guardar Paciente</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', background:s.teal, color:'#fff', padding:'12px 24px', borderRadius:'50px', fontWeight:700, fontSize:'.88rem', zIndex:600, whiteSpace:'nowrap' }}>{toast}</div>
      )}
    </>
  )
}

export default VetPacientes