import { useState } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const s = {
  teal:'#1a9e8f', tealDark:'#137a6e', tealLight:'#e6f7f5', tealMid:'#5bbdb5',
  border:'#e2e8f0', gray:'#f8fafc', textDark:'#334155', textMid:'#4a5568',
  textLight:'#94a3b8', white:'#fff', red:'#dc2626',
}

const VetProfile = () => {
  const { user, saveUser, clearUser } = useAuthContext()
  const [tab, setTab] = useState('info')
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    nombres: user?.nombres ?? '',
    apellidos: user?.apellidos ?? '',
    correo: user?.correo ?? '',
    telefono: user?.telefono ?? '',
    especialidad: user?.especialidad ?? 'Medicina General',
    genero: user?.genero ?? '',
    pais: user?.pais ?? 'Chile',
  })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleGuardar = () => {
    saveUser({ ...user, ...form })
    setEditing(false)
    showToast('✅ Perfil actualizado correctamente')
  }

  const initials = user ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}` : 'DV'

  const inputStyle = (edit) => ({
    padding:'12px 16px', border:`1.5px solid ${s.border}`, borderRadius:'12px',
    fontFamily:"'DM Sans', sans-serif", fontSize:'.9rem', color:s.textDark,
    background: edit ? s.white : s.gray, outline:'none', width:'100%',
    pointerEvents: edit ? 'all' : 'none', transition:'all .2s',
  })

  const labelStyle = { fontSize:'.7rem', fontWeight:800, color:s.textLight, letterSpacing:'.09em', textTransform:'uppercase' }

  return (
    <div style={{ flex:1, padding:'36px 40px', overflowY:'auto', background:'#f1f5f9' }}>
      <div style={{ background:s.white, border:`1.5px solid ${s.border}`, borderRadius:'20px', overflow:'hidden', boxShadow:'0 2px 16px rgba(26,181,163,.07)', maxWidth:'950px' }}>

        {/* Banner */}
        <div style={{ height:'120px', background:'linear-gradient(120deg,#b2e8e2 0%,#e6f9f7 40%,#fef9e7 100%)', position:'relative' }} />

        {/* Identity row */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 32px', marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'16px' }}>
            <div style={{ width:'88px', height:'88px', borderRadius:'50%', border:`4px solid ${s.white}`, background:s.tealLight, display:'grid', placeItems:'center', boxShadow:'0 4px 16px rgba(0,0,0,.1)', marginTop:'-44px' }}>
              <span style={{ fontFamily:"'Nunito', sans-serif", fontWeight:900, fontSize:'1.8rem', color:s.teal }}>{initials}</span>
            </div>
            <div style={{ paddingBottom:'6px' }}>
              <div style={{ fontFamily:"'Nunito', sans-serif", fontWeight:900, fontSize:'1.2rem' }}>{user?.nombres} {user?.apellidos}</div>
              <div style={{ fontSize:'.85rem', color:s.textLight, marginTop:'2px' }}>{user?.correo}</div>
              <div style={{ fontSize:'.78rem', color:s.teal, fontWeight:600, marginTop:'2px' }}>🩺 {form.especialidad}</div>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{ background:s.teal, color:'#fff', border:'none', borderRadius:'10px', padding:'10px 24px', fontWeight:800, fontSize:'.88rem', cursor:'pointer', marginBottom:'10px' }}>Editar</button>
          ) : (
            <button onClick={handleGuardar} style={{ background:s.teal, color:'#fff', border:'none', borderRadius:'10px', padding:'10px 24px', fontWeight:800, fontSize:'.88rem', cursor:'pointer', marginBottom:'10px' }}>💾 Guardar</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`1.5px solid ${s.border}`, padding:'0 32px' }}>
          {[['info','Información'],['seguridad','Seguridad']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding:'12px 20px', fontSize:'.88rem', fontWeight:700, color: tab===id ? s.teal : s.textLight, border:'none', background:'none', borderBottom:`2.5px solid ${tab===id ? s.teal : 'transparent'}`, marginBottom:'-1.5px', cursor:'pointer', transition:'all .18s' }}>{label}</button>
          ))}
        </div>

        {/* TAB: Información */}
        {tab === 'info' && (
          <div style={{ padding:'30px 32px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px 28px' }}>
              {[
                ['Nombres', 'nombres', 'text'],
                ['Apellidos', 'apellidos', 'text'],
                ['Teléfono', 'telefono', 'text'],
                ['Correo', 'correo', 'email'],
                ['Especialidad', 'especialidad', 'text'],
              ].map(([label, field, type]) => (
                <div key={field} style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(p => ({...p, [field]: e.target.value}))} style={inputStyle(editing)} />
                </div>
              ))}
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                <label style={labelStyle}>Género</label>
                <select value={form.genero} onChange={e => setForm(p => ({...p, genero:e.target.value}))} style={inputStyle(editing)}>
                  <option value="">Seleccionar</option>
                  <option>Masculino</option><option>Femenino</option><option>Prefiero no decir</option>
                </select>
              </div>
            </div>

            <hr style={{ border:'none', borderTop:`1px solid ${s.border}`, margin:'28px 0' }} />

            <div style={{ fontFamily:"'Nunito', sans-serif", fontWeight:800, fontSize:'.95rem', marginBottom:'16px' }}>📧 Mi dirección de email</div>
            <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 16px', borderRadius:'12px', background:s.gray, border:`1.5px solid ${s.border}` }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:s.tealLight, display:'grid', placeItems:'center', fontSize:'1.1rem', border:`1.5px solid ${s.tealMid}` }}>📧</div>
              <div>
                <div style={{ fontWeight:600, fontSize:'.9rem' }}>{user?.correo}</div>
                <div style={{ fontSize:'.75rem', color:s.textLight }}>Email principal</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:'.7rem', fontWeight:800, background:s.tealLight, color:s.teal, borderRadius:'50px', padding:'3px 10px' }}>Principal</span>
            </div>
          </div>
        )}

        {/* TAB: Seguridad */}
        {tab === 'seguridad' && (
          <div style={{ padding:'30px 32px' }}>
            <div style={{ fontFamily:"'Nunito', sans-serif", fontWeight:800, fontSize:'.95rem', marginBottom:'16px' }}>🔒 Seguridad de la cuenta</div>
            {[
              { icon:'🔑', bg:s.tealLight, title:'Contraseña', sub:'Última actualización hace 2 meses', btn:'Cambiar', color:s.textMid },
              { icon:'📱', bg:'#fff8ed', title:'Autenticación en dos pasos', sub:'Protección adicional para tu cuenta', btn:'Activar', color:s.textMid },
              { icon:'🖥️', bg:s.tealLight, title:'Sesiones activas', sub:'1 dispositivo conectado actualmente', btn:'Cerrar todas', color:s.textMid },
              { icon:'🗑️', bg:'#fdeaea', title:'Eliminar cuenta', sub:'Esta acción no se puede deshacer', btn:'Eliminar', color:s.red, borderColor:'#fdeaea' },
            ].map(item => (
              <div key={item.title} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'18px', borderRadius:'12px', border:`1.5px solid ${item.borderColor ?? s.border}`, background:s.white, marginBottom:'12px' }}>
                <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:item.bg, display:'grid', placeItems:'center', fontSize:'1.2rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'.9rem', color:item.color }}>{item.title}</div>
                  <div style={{ fontSize:'.78rem', color:s.textLight }}>{item.sub}</div>
                </div>
                <button onClick={() => showToast(`${item.title} — próximamente`)} style={{ marginLeft:'auto', padding:'7px 16px', borderRadius:'8px', border:`1.5px solid ${item.color === s.red ? s.red : s.border}`, background:'none', fontSize:'.82rem', fontWeight:700, color:item.color, cursor:'pointer' }}>{item.btn}</button>
              </div>
            ))}
            <div style={{ marginTop:'24px', paddingTop:'24px', borderTop:`1px solid ${s.border}` }}>
              <button onClick={clearUser} style={{ background:'none', color:s.red, border:`2px solid ${s.red}`, borderRadius:'10px', padding:'10px 24px', fontWeight:800, cursor:'pointer' }}>
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', background:s.teal, color:'#fff', padding:'12px 24px', borderRadius:'50px', fontWeight:700, fontSize:'.88rem', zIndex:600, boxShadow:'0 8px 24px rgba(26,181,163,.3)' }}>{toast}</div>
      )}
    </div>
  )
}

export default VetProfile