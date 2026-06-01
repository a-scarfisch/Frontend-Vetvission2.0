import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'

const s = {
  border:'#e2e8f0', gray:'#f4f6f8', textDark:'#1a2535',
  textMid:'#4a5568', textLight:'#94a3b8', white:'#fff',
  purple:'#7e22ce', purpleLight:'#ede9fe',
}

const estadoProducto = (stock, stockMinimo) => {
  if (stock <= 0) return { label:'Crítico', bg:'#fef2f2', color:'#991b1b' }
  if (stock < stockMinimo * 0.3) return { label:'Crítico', bg:'#fef2f2', color:'#991b1b' }
  if (stock < stockMinimo) return { label:'Stock Bajo', bg:'#fef3c7', color:'#92400e' }
  return { label:'OK', bg:'#dcfce7', color:'#166534' }
}

const inputStyle = { width:'100%', padding:'10px 14px', border:`1.5px solid #e2e8f0`, borderRadius:'10px', fontSize:'.88rem', outline:'none', fontFamily:"'DM Sans', sans-serif" }
const labelStyle = { display:'block', fontSize:'.72rem', fontWeight:700, color:'#94a3b8', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'6px' }

const AdminInventario = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [modal, setModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ nombre:'', categoria:'', proveedor:'', lote:'', vencimiento:'', ingreso:'', unidad:'', stock:0, stockMinimo:0, precioUnitario:0, descripcion:'' })
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/inventario')
      .then(res => setProductos(res.data.data ?? []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleGuardar = async () => {
    if (!form.nombre || !form.categoria || !form.lote || !form.vencimiento || !form.unidad) {
      setError('Completa los campos obligatorios (*)'); return
    }
    setError('')
    try {
      const res = await apiClient.post('/inventario', form)
      setProductos(prev => [...prev, res.data.data ?? { ...form, idProducto: Date.now() }])
      showToast('✅ Producto agregado correctamente')
    } catch {
      setProductos(prev => [...prev, { ...form, idProducto: Date.now() }])
      showToast('✅ Producto guardado localmente')
    }
    setModal(false)
    setForm({ nombre:'', categoria:'', proveedor:'', lote:'', vencimiento:'', ingreso:'', unidad:'', stock:0, stockMinimo:0, precioUnitario:0, descripcion:'' })
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await apiClient.delete(`/inventario/${id}`)
    } catch {}
    setProductos(prev => prev.filter(p => p.idProducto !== id))
    showToast('🗑️ Producto eliminado')
  }

  const filtrados = productos.filter(p => {
    const matchBuscar = !buscar || p.nombre?.toLowerCase().includes(buscar.toLowerCase())
    const matchCat = !filtroCategoria || p.categoria === filtroCategoria
    return matchBuscar && matchCat
  })

  const criticos = productos.filter(p => (p.stock ?? 0) < (p.stockMinimo ?? 0) * 0.3).length
  const stockBajo = productos.filter(p => (p.stock ?? 0) < (p.stockMinimo ?? 0)).length
  const valorTotal = productos.reduce((acc, p) => acc + ((p.stock ?? 0) * (p.precioUnitario ?? 0)), 0)
  const hoy = new Date().toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <>
      {/* Topbar */}
      <div style={{ background:s.white, borderBottom:`1.5px solid ${s.border}`, padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <h5 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>Inventario</h5>
          <small style={{ color:s.textLight }}>{hoy}</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'9px', background:s.gray, border:`1.5px solid ${s.border}`, borderRadius:'50px', padding:'8px 18px', width:'280px' }}>
            <span style={{ color:s.textLight }}>🔍</span>
            <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar producto..." style={{ border:'none', background:'none', outline:'none', fontSize:'.87rem', width:'100%' }} />
          </div>
          <div style={{ position:'relative' }}>
            <button style={{ width:'38px', height:'38px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', display:'grid', placeItems:'center', cursor:'pointer' }}>🔔</button>
            <span style={{ position:'absolute', top:'1px', right:'1px', width:'18px', height:'18px', background:'#e05252', borderRadius:'50%', fontSize:'.6rem', fontWeight:800, color:'white', display:'grid', placeItems:'center', border:'2px solid white' }}>5</span>
          </div>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#1e3a5f', display:'grid', placeItems:'center', fontWeight:800, fontSize:'.75rem', color:'white' }}>AD</div>
        </div>
      </div>

      <div style={{ padding:'28px 32px', flex:1, minHeight:'100vh', background:s.gray }}>

        {/* Alerta crítica */}
        {criticos > 0 && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'14px 20px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
            <span style={{ color:'#dc2626', fontSize:'1.1rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight:600, fontSize:'.88rem', color:'#dc2626' }}>Alerta de stock crítico</div>
              <div style={{ fontSize:'.82rem', color:s.textMid }}>{criticos} producto{criticos>1?'s':''} requiere{criticos>1?'n':''} reposición inmediata</div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18px', marginBottom:'28px' }}>
          {[
            { icon:'📦', bg:'#eff6ff', label:'Total Productos', val:loading?'—':productos.length },
            { icon:'⬇️', bg:'#fff7ed', label:'Stock Bajo', val:loading?'—':stockBajo, color:'#f59e0b' },
            { icon:'💰', bg:'#f0fdf4', label:'Valor Total', val:loading?'—':`$${Math.round(valorTotal/1000)}K` },
            { icon:'🚨', bg:'#fef2f2', label:'Alertas Críticas', val:loading?'—':criticos, color:'#ef4444' },
          ].map(k => (
            <div key={k.label} style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', padding:'20px 22px', display:'flex', alignItems:'center', gap:'18px' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:k.bg, display:'grid', placeItems:'center', fontSize:'1.4rem', flexShrink:0 }}>{k.icon}</div>
              <div>
                <div style={{ fontSize:'.78rem', color:s.textLight, marginBottom:'2px' }}>{k.label}</div>
                <div style={{ fontWeight:900, fontSize:'1.7rem', lineHeight:1, color:k.color ?? s.textDark }}>{k.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${s.border}` }}>
            <h6 style={{ fontWeight:800, margin:0 }}>Lista de Productos</h6>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ ...inputStyle, width:'auto', padding:'8px 14px' }}>
                <option value="">Todas las categorías</option>
                {['Vacunas','Antibióticos','Antiparasitarios','Anestésicos','Suministros','Otro'].map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => setModal(true)} style={{ background:`linear-gradient(135deg,${s.purple},#4c1d95)`, color:'#fff', border:'none', borderRadius:'9px', padding:'9px 20px', fontWeight:800, fontSize:'.88rem', cursor:'pointer', whiteSpace:'nowrap' }}>+ Añadir Producto</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border spinner-border-sm" style={{ color:s.purple }}></div></div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:s.textLight }}>No se encontraron productos.</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafbfc' }}>
                    {['Producto','Categoría','N° Lote','Vencimiento','Stock','Stock Mín.','Precio Unit.','Estado',''].map((h,i) => (
                      <th key={i} style={{ padding:'10px 20px', fontSize:'.68rem', fontWeight:800, color:s.textLight, letterSpacing:'.08em', textTransform:'uppercase', borderBottom:`1.5px solid ${s.border}`, textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p, idx) => {
                    const est = estadoProducto(p.stock ?? 0, p.stockMinimo ?? 0)
                    const stockColor = (p.stock ?? 0) < (p.stockMinimo ?? 0) * 0.3 ? '#dc2626' : (p.stock ?? 0) < (p.stockMinimo ?? 0) ? '#d97706' : '#16a34a'
                    return (
                      <tr key={p.idProducto ?? idx} style={{ borderBottom:`1px solid ${s.border}` }}>
                        <td style={{ padding:'14px 20px', fontWeight:600, color:s.textDark, whiteSpace:'nowrap' }}>{p.nombre}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>{p.categoria}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.8rem', color:s.textMid }}>{p.lote ?? '—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.82rem', color:s.textMid }}>{p.vencimiento ?? '—'}</td>
                        <td style={{ padding:'14px 20px', fontWeight:700, color:stockColor }}>{p.stock} {p.unidad}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.82rem', color:s.textLight }}>{p.stockMinimo} {p.unidad}</td>
                        <td style={{ padding:'14px 20px', fontSize:'.88rem', color:s.textMid }}>${p.precioUnitario?.toLocaleString('es-CL') ?? '—'}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:est.bg, color:est.color }}>{est.label}</span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button title="Editar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:`1.5px solid ${s.border}`, background:s.white, cursor:'pointer', fontSize:'.84rem' }}>✏️</button>
                            <button onClick={() => handleEliminar(p.idProducto)} title="Eliminar" style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1.5px solid #fecaca', background:'#fef2f2', cursor:'pointer', fontSize:'.84rem' }}>🗑️</button>
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

      {/* Modal Añadir Producto */}
      {modal && (
        <div onClick={(e) => e.target===e.currentTarget && setModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:300, display:'grid', placeItems:'center', padding:'16px' }}>
          <div style={{ background:s.white, borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'640px', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
            <button onClick={() => setModal(false)} style={{ position:'absolute', top:'14px', right:'14px', width:'30px', height:'30px', borderRadius:'50%', border:`1.5px solid ${s.border}`, background:'none', cursor:'pointer' }}>✕</button>
            <h5 style={{ fontWeight:900, marginBottom:'24px' }}>📦 Añadir Producto</h5>

            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'14px' }}>
              <div>
                <label style={labelStyle}>Nombre del producto *</label>
                <input value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))} placeholder="ej: Vacuna Triple Felina" style={inputStyle} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select value={form.categoria} onChange={e => setForm(p=>({...p,categoria:e.target.value}))} style={inputStyle}>
                    <option value="">Seleccionar...</option>
                    {['Vacunas','Antibióticos','Antiparasitarios','Anestésicos','Suministros','Otro'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Laboratorio / Proveedor</label>
                  <input value={form.proveedor} onChange={e => setForm(p=>({...p,proveedor:e.target.value}))} placeholder="ej: Zoetis" style={inputStyle} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Número de Lote *</label>
                  <input value={form.lote} onChange={e => setForm(p=>({...p,lote:e.target.value}))} placeholder="ej: LOT-2024-001" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de Vencimiento *</label>
                  <input type="date" value={form.vencimiento} onChange={e => setForm(p=>({...p,vencimiento:e.target.value}))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Fecha de Ingreso</label>
                  <input type="date" value={form.ingreso} onChange={e => setForm(p=>({...p,ingreso:e.target.value}))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Unidad *</label>
                  <input value={form.unidad} onChange={e => setForm(p=>({...p,unidad:e.target.value}))} placeholder="ej: dosis, tabletas" style={inputStyle} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Stock actual</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p=>({...p,stock:e.target.value}))} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock mínimo</label>
                  <input type="number" value={form.stockMinimo} onChange={e => setForm(p=>({...p,stockMinimo:e.target.value}))} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Precio unitario ($)</label>
                  <input type="number" value={form.precioUnitario} onChange={e => setForm(p=>({...p,precioUnitario:e.target.value}))} placeholder="0" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Descripción / Observaciones</label>
                <textarea value={form.descripcion} onChange={e => setForm(p=>({...p,descripcion:e.target.value}))} rows={2} placeholder="Condiciones de almacenamiento, indicaciones, etc." style={{ ...inputStyle, resize:'vertical', minHeight:'70px' }} />
              </div>
            </div>

            {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:'8px', fontSize:'.82rem', marginTop:'16px' }}>{error}</div>}

            <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1.5px solid ${s.border}`, background:'none', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
              <button onClick={handleGuardar} style={{ flex:2, padding:'12px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${s.purple},#4c1d95)`, color:'#fff', fontWeight:800, cursor:'pointer' }}>Guardar Producto</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', background:'#1e293b', color:'#fff', padding:'12px 24px', borderRadius:'50px', fontWeight:700, fontSize:'.88rem', zIndex:600, whiteSpace:'nowrap' }}>{toast}</div>
      )}
    </>
  )
}

export default AdminInventario