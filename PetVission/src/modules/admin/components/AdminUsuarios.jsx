import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'

const COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7','#0f766e','#dc2626']

const rolStyle = {
  VETERINARIO: { bg:'#f0fdf4', color:'#15803d' },
  CLIENTE:     { bg:'#eff6ff', color:'#1d4ed8' },
  ADMINISTRADOR: { bg:'#fdf4ff', color:'#7e22ce' },
  COLABORADOR: { bg:'#fdf4ff', color:'#7e22ce' },
}

const s = {
  border:'#e2e8f0', gray:'#f4f6f8', textDark:'#1a2535',
  textMid:'#4a5568', textLight:'#94a3b8', white:'#fff',
}

const inputStyle = { width:'100%', padding:'10px 14px', border:`1.5px solid ${s.border}`, borderRadius:'10px', fontSize:'.88rem', outline:'none', fontFamily:"'DM Sans', sans-serif" }
const labelStyle = { display:'block', fontSize:'.72rem', fontWeight:700, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'6px' }

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [modal, setModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ nombres:'', apellidos:'', edad:'', telefono:'', correo:'', password:'', rol:'CLIENTE', activo:true })
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/usuarios')
      .then(res => setUsuarios(res.data.data ?? []))
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleGuardar = async () => {
    if (!form.nombres || !form.apellidos || !form.correo || !form.rol) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }
    setError('')
    try {
      const res = await apiClient.post('/usuarios', form)
      setUsuarios(prev => [res.data.data, ...prev])
      showToast('✅ Usuario creado correctamente')
      setModal(false)
      setForm({ nombres:'', apellidos:'', edad:'', telefono:'', correo:'', password:'', rol:'CLIENTE', activo:true })
    } catch {
      setError('Error al crear el usuario. Intenta nuevamente.')
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return
    try {
      await apiClient.delete(`/usuarios/${id}`)
      setUsuarios(prev => prev.filter(u => u.idUsuario !== id))
      showToast('🗑️ Usuario eliminado')
    } catch {
      showToast('⚠️ Error al eliminar')
    }
  }

  const filtrados = usuarios.filter(u => {
    const matchBuscar = !buscar || `${u.nombres} ${u.apellidos}`.toLowerCase().includes(buscar.toLowerCase()) || u.correo?.toLowerCase().includes(buscar.toLowerCase())
    const matchRol = !filtroRol || u.rol === filtroRol
    return matchBuscar && matchRol
  })

  const vets = usuarios.filter(u => u.rol === 'VETERINARIO').length
  const clientes = usuarios.filter(u => u.rol === 'CLIENTE').length

  const hoy = new Date().toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <>
      {/* Topbar */}
      <div style={{ background:s.white, borderBottom:`1.5px solid ${s.border}`, padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <h5 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>Gestión de Usuarios</h5>
          <small style={{ color:s.textLight }}>{hoy}</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'9px', background:s.gray, border:`1.5px solid ${s.border}`, borderRadius:'50px', padding:'8px 18px', width:'280px' }}>
            <span style={{ color:s.textLight }}>🔍</span>
            <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar usuario..." style={{ border:'none', background:'none', outline:'none', fontSize:'.87rem', width:'100%' }} />
          </div>
          <div style={{ position:'relative' }}>
            <button style={{ width:'38px', height:'38px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', display:'grid', placeItems:'center', cursor:'pointer' }}>🔔</button>
            <span style={{ position:'absolute', top:'1px', right:'1px', width:'18px', height:'18px', background:'#e05252', borderRadius:'50%', fontSize:'.6rem', fontWeight:800, color:'white', display:'grid', placeItems:'center', border:'2px solid white' }}>5</span>
          </div>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#1e3a5f', display:'grid', placeItems:'center', fontWeight:800, fontSize:'.75rem', color:'white' }}>AD</div>
        </div>
      </div>

      <div style={{ padding:'28px 32px', flex:1, minHeight:'100vh', background:s.gray }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18px', marginBottom:'28px' }}>
          {[
            { icon:'👥', bg:'#eff6ff', label:'Total Usuarios', val:loading?'—':usuarios.length },
            { icon:'👨‍⚕️', bg:'#f0fdf4', label:'Veterinarios', val:loading?'—':vets },
            { icon:'👤', bg:'#eff6ff', label:'Clientes', val:loading?'—':clientes },
            { icon:'🏷️', bg:'#fdf4ff', label:'Otros Roles', val:loading?'—':usuarios.length-vets-clientes },
          ].map(k => (
            <div key={k.label} style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', padding:'20px 22px', display:'flex', alignItems:'center', gap:'18px' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:k.bg, display:'grid', placeItems:'center', fontSize:'1.4rem', flexShrink:0 }}>{k.icon}</div>
              <div>
                <div style={{ fontSize:'.78rem', color:s.textLight, marginBottom:'2px' }}>{k.label}</div>
                <div style={{ fontWeight:900, fontSize:'1.7rem', lineHeight:1 }}>{k.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${s.border}` }}>
            <h6 style={{ fontWeight:800, margin:0 }}>Lista de Usuarios</h6>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setModal(true)} style={{ background:'#3b82f6', color:'#fff', border:'none', borderRadius:'9px', padding:'9px 20px', fontWeight:800, fontSize:'.88rem', cursor:'pointer' }}>+ Nuevo Usuario</button>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ padding:'12px 24px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[['','Todos'],['VETERINARIO','Veterinarios'],['CLIENTE','Clientes'],['ADMINISTRADOR','Administradores']].map(([val, label]) => (
              <button key={val} onClick={() => setFiltroRol(val)} style={{ border:`1.5px solid ${filtroRol===val ? '#3b82f6' : s.border}`, borderRadius:'20px', padding:'4px 14px', fontSize:'.8rem', background: filtroRol===val ? '#eff6ff' : '#fff', color: filtroRol===val ? '#1d4ed8' : s.textMid, cursor:'pointer', fontWeight:600 }}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border spinner-border-sm" style={{ color:'#1a9e8f' }}></div></div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:s.textLight }}>No se encontraron usuarios.</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafbfc' }}>
                    {['Nombre','Teléfono','Email','Rol','Estado','Última Actividad',''].map((h,i) => (
                      <th key={i} style={{ padding:'10px 20px', fontSize:'.68rem', fontWeight:800, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', borderBottom:`1.5px solid ${s.border}`, textAlign:'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u, idx) => {
                    const rs = rolStyle[u.rol] ?? { bg:'#f1f5f9', color:'#64748b' }
                    return (
                      <tr key={u.idUsuario ?? idx} style={{ borderBottom:`1px solid ${s.border}` }}>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:COLORS[idx%COLORS.length], display:'grid', placeItems:'center', fontWeight:800, fontSize:'.85rem', color:'white', flexShrink:0 }}>{u.nombres?.[0]}{u.apellidos?.[0]??''}</div>
                            <span style={{ fontWeight:600 }}>{u.nombres} {u.apellidos}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{u.telefono ?? '—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{u.correo}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'50px', background:rs.bg, color:rs.color }}>{u.rol?.charAt(0)+(u.rol?.slice(1).toLowerCase()??'')}</span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'50px', background:u.activo!==false?'#dcfce7':'#f1f5f9', color:u.activo!==false?'#15803d':'#64748b' }}>{u.activo!==false?'Activo':'Inactivo'}</span>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{u.ultimaActividad ?? '—'}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button title="Editar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:s.white, cursor:'pointer', fontSize:'.84rem' }}>✏️</button>
                            <button onClick={() => handleEliminar(u.idUsuario)} title="Eliminar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1.5px solid #fecaca', background:'#fef2f2', cursor:'pointer', fontSize:'.84rem' }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Usuario */}
      {modal && (
        <div onClick={(e) => e.target===e.currentTarget && setModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:300, display:'grid', placeItems:'center', padding:'16px' }}>
          <div style={{ background:s.white, borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'520px', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
            <button onClick={() => setModal(false)} style={{ position:'absolute', top:'14px', right:'14px', width:'30px', height:'30px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', cursor:'pointer' }}>✕</button>
            <h5 style={{ fontWeight:900, marginBottom:'24px' }}>👤 Nuevo Usuario</h5>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div><label style={labelStyle}>Nombres *</label><input value={form.nombres} onChange={e => setForm(p=>({...p,nombres:e.target.value}))} placeholder="Nombres" style={inputStyle} /></div>
              <div><label style={labelStyle}>Apellidos *</label><input value={form.apellidos} onChange={e => setForm(p=>({...p,apellidos:e.target.value}))} placeholder="Apellidos" style={inputStyle} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div><label style={labelStyle}>Teléfono</label><input value={form.telefono} onChange={e => setForm(p=>({...p,telefono:e.target.value}))} placeholder="+56 9 XXXX XXXX" style={inputStyle} /></div>
              <div><label style={labelStyle}>Edad</label><input type="number" value={form.edad} onChange={e => setForm(p=>({...p,edad:e.target.value}))} placeholder="Años" style={inputStyle} /></div>
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Correo *</label>
              <input type="email" value={form.correo} onChange={e => setForm(p=>({...p,correo:e.target.value}))} placeholder="correo@ejemplo.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Contraseña *</label>
              <input type="password" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="Contraseña" style={inputStyle} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <div>
                <label style={labelStyle}>Rol *</label>
                <select value={form.rol} onChange={e => setForm(p=>({...p,rol:e.target.value}))} style={inputStyle}>
                  <option value="CLIENTE">Cliente</option>
                  <option value="VETERINARIO">Veterinario</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={form.activo} onChange={e => setForm(p=>({...p,activo:e.target.value==='true'}))} style={inputStyle}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:'8px', fontSize:'.82rem', marginBottom:'16px' }}>{error}</div>}

            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1.5px solid ${s.border}`, background:'none', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
              <button onClick={handleGuardar} style={{ flex:2, padding:'12px', borderRadius:'10px', border:'none', background:'#3b82f6', color:'#fff', fontWeight:800, cursor:'pointer' }}>Guardar Usuario</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', background:'#1a9e8f', color:'#fff', padding:'12px 24px', borderRadius:'50px', fontWeight:700, fontSize:'.88rem', zIndex:600, whiteSpace:'nowrap' }}>{toast}</div>
      )}
    </>
  )
}

export default AdminUsuarios