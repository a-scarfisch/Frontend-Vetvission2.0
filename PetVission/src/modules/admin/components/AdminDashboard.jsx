import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '@/modules/core/lib/apiClient'

const s = {
  border:'#e2e8f0', gray:'#f4f6f8', textDark:'#1a2535',
  textMid:'#4a5568', textLight:'#94a3b8', white:'#fff',
}

const COLORS = ['#3b82f6','#0f766e','#7e22ce','#dc2626','#f97316','#1a9e8f']

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([])
  const [citas, setCitas] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get('/usuarios').catch(() => ({ data:{ data:[] } })),
      apiClient.get('/citas').catch(() => ({ data:{ data:[] } })),
      apiClient.get('/mascotas').catch(() => ({ data:{ data:[] } })),
    ]).then(([u, c, m]) => {
      setUsuarios(u.data.data ?? [])
      setCitas(c.data.data ?? [])
      setMascotas(m.data.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const hoy = new Date().toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <>
      {/* Topbar */}
      <div style={{ background:s.white, borderBottom:`1.5px solid ${s.border}`, padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <h5 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>Dashboard</h5>
          <small style={{ color:s.textLight }}>{hoy}</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'9px', background:s.gray, border:`1.5px solid ${s.border}`, borderRadius:'50px', padding:'8px 18px', width:'280px' }}>
            <span style={{ color:s.textLight }}>🔍</span>
            <input type="text" placeholder="Buscar..." style={{ border:'none', background:'none', outline:'none', fontSize:'.87rem', width:'100%' }} />
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
            { icon:'👥', bg:'#eff6ff', label:'Total Usuarios', val:loading?'—':usuarios.length, sub:'registrados' },
            { icon:'📅', bg:'#f0fdf4', label:'Total Citas', val:loading?'—':citas.length, sub:`${citas.filter(c=>c.estado==='CONFIRMADA').length} confirmadas` },
            { icon:'🐾', bg:'#fff7ed', label:'Mascotas', val:loading?'—':mascotas.length, sub:'registradas' },
            { icon:'👨‍⚕️', bg:'#fdf4ff', label:'Veterinarios', val:loading?'—':usuarios.filter(u=>u.rol==='VETERINARIO').length, sub:'activos' },
          ].map(k => (
            <div key={k.label} style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', padding:'20px 22px', display:'flex', alignItems:'center', gap:'18px' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:k.bg, display:'grid', placeItems:'center', fontSize:'1.4rem', flexShrink:0 }}>{k.icon}</div>
              <div>
                <div style={{ fontSize:'.78rem', color:s.textLight, marginBottom:'2px' }}>{k.label}</div>
                <div style={{ fontWeight:900, fontSize:'1.7rem', lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:'.72rem', color:'#22c55e', marginTop:'3px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Últimos usuarios */}
        <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', overflow:'hidden', marginBottom:'22px' }}>
          <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${s.border}` }}>
            <h6 style={{ fontWeight:800, margin:0 }}>Últimos usuarios registrados</h6>
            <Link to="/admin/usuarios" style={{ fontSize:'.82rem', color:'#6b7280', border:`1px solid ${s.border}`, borderRadius:'8px', padding:'5px 14px', textDecoration:'none', fontWeight:600 }}>Ver todos</Link>
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color:'#1a9e8f' }}></div></div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafbfc' }}>
                    {['Usuario','Correo','Rol','Estado',''].map((h,i) => (
                      <th key={i} style={{ padding:'10px 20px', fontSize:'.68rem', fontWeight:800, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', borderBottom:`1.5px solid ${s.border}`, textAlign:'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {usuarios.slice(0,5).map((u, idx) => {  
                
                    const rolStyle = u.rol === 'VETERINARIO'
                      ? { bg:'#e0f2fe', color:'#0369a1' }
                      : u.rol === 'ADMINISTRADOR'
                      ? { bg:'#fdf4ff', color:'#7e22ce' }
                      : { bg:'#f0fdf4', color:'#15803d' }
                    return (
                      <tr key={idx} style={{ borderBottom:`1px solid ${s.border}` }}>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:COLORS[idx%COLORS.length], display:'grid', placeItems:'center', fontWeight:800, fontSize:'.8rem', color:'white', flexShrink:0 }}>{u.nombres?.[0]}{u.apellidos?.[0]??''}</div>
                            <span style={{ fontWeight:600, fontSize:'.88rem' }}>{u.nombres} {u.apellidos}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:'.82rem', color:s.textMid }}>{u.correo}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'50px', background:rolStyle.bg, color:rolStyle.color }}>{u.rol?.charAt(0)+(u.rol?.slice(1).toLowerCase()??'')}</span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'50px', background:u.activo!==false?'#dcfce7':'#f1f5f9', color:u.activo!==false?'#15803d':'#64748b' }}>{u.activo!==false?'Activo':'Inactivo'}</span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <button style={{ width:'30px', height:'30px', borderRadius:'7px', border:`1.5px solid ${s.border}`, background:s.white, cursor:'pointer' }}>✏️</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Reservas por estado */}
<div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', padding:'22px 24px', marginBottom:'22px' }}>
  <h6 style={{ fontWeight:800, margin:'0 0 20px' }}>Reservas por estado — Hoy</h6>
  <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'28px' }}>
    {[
      { label:'Confirmadas', val:citas.filter(c=>c.estado==='CONFIRMADA').length, color:'#22c55e' },
      { label:'Pendientes', val:citas.filter(c=>c.estado==='PENDIENTE').length, color:'#f59e0b' },
      { label:'Canceladas', val:citas.filter(c=>c.estado==='CANCELADA').length, color:'#e05252' },
    ].map(item => {
      const total = citas.length || 1
      return (
        <div key={item.label}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'.85rem', fontWeight:500 }}>{item.label}</span>
            <span style={{ fontSize:'.85rem', fontWeight:700, color:item.color }}>{loading ? '—' : item.val}</span>
          </div>
          <div style={{ height:'8px', borderRadius:'8px', background:'#f1f5f9', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:'8px', background:item.color, width:`${loading ? 0 : Math.round(item.val/total*100)}%`, transition:'width .5s' }} />
          </div>
        </div>
      )
    })}
  </div>

  <div>
    <div style={{ fontSize:'.75rem', fontWeight:600, color:s.textLight, marginBottom:'14px', letterSpacing:'.05em', textTransform:'uppercase' }}>Veterinarios activos hoy</div>
    {usuarios.filter(u => u.rol === 'VETERINARIO').slice(0, 3).map((v, i) => (
      <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
        <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#0f766e', display:'grid', placeItems:'center', fontWeight:800, fontSize:'.8rem', color:'white', flexShrink:0 }}>{v.nombres?.[0]}{v.apellidos?.[0]??''}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'.88rem', fontWeight:600 }}>Dr. {v.nombres} {v.apellidos}</div>
          <div style={{ fontSize:'.72rem', color:s.textLight }}>Veterinario activo</div>
        </div>
        <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'50px', background:'#dcfce7', color:'#15803d' }}>Online</span>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* Actividad reciente */}
        <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${s.border}` }}>
            <h6 style={{ fontWeight:800, margin:0 }}>Actividad reciente del sistema</h6>
            <span style={{ fontSize:'.82rem', color:s.textLight }}>Últimas 24 horas</span>
          </div>
          {usuarios.length === 0 && !loading && (
          <div style={{ padding:'32px', textAlign:'center', color:s.textLight }}>No hay usuarios registrados aún.</div>
            )}
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#fafbfc' }}>
                {['Evento','Usuario','Módulo','Hora','Estado'].map((h,i) => (
                  <th key={i} style={{ padding:'10px 20px', fontSize:'.68rem', fontWeight:800, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', borderBottom:`1.5px solid ${s.border}`, textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
                         
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard