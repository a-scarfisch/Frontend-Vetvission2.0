import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const navItems = [
  { label:'Inicio', path:'/admin', icon:'bi-grid-fill', group:'Principal' },
  { label:'Usuarios', path:'/admin/usuarios', icon:'bi-people-fill', group:'Gestión' },
  { label:'Turnos', path:'/admin/turnos', icon:'bi-heart-pulse-fill', group:'Gestión' },
  { label:'Inventario', path:'/admin/inventario', icon:'bi-box-seam-fill', group:'Gestión' },
]

const AdminLayout = () => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()
  const initials = user ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}` : 'AD'

  const linkStyle = (path) => ({
    display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px',
    borderRadius:'8px', textDecoration:'none', fontSize:'.85rem', fontWeight:600,
    color: location.pathname === path ? 'white' : 'rgba(255,255,255,.7)',
    background: location.pathname === path ? 'rgba(255,255,255,.15)' : 'transparent',
    transition:'all .15s', marginBottom:'2px',
  })

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{ width:'240px', background:'linear-gradient(180deg,#1e3a5f 0%,#0f2942 100%)', display:'flex', flexDirection:'column', flexShrink:0, boxShadow:'4px 0 20px rgba(0,0,0,.15)', position:'sticky', top:0, height:'100vh' }}>
        {/* Brand */}
        <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'36px', height:'36px', background:'rgba(255,255,255,.2)', borderRadius:'10px', display:'grid', placeItems:'center' }}>
              <i className="bi bi-heart-pulse-fill" style={{ color:'white', fontSize:'1rem' }}></i>
            </div>
            <div>
              <div style={{ fontWeight:700, color:'white', fontSize:'.95rem' }}>PetVission</div>
              <div style={{ fontSize:'.67rem', opacity:.6, color:'white' }}>Panel Administrador</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
          <div style={{ fontSize:'.65rem', fontWeight:800, color:'rgba(255,255,255,.4)', letterSpacing:'.1em', textTransform:'uppercase', padding:'4px 12px 8px' }}>Principal</div>
          <Link to="/admin" style={linkStyle('/admin')}>
            <i className="bi bi-grid-fill" style={{ fontSize:'1rem', width:'18px' }}></i>
            <span>Inicio</span>
          </Link>

          <div style={{ fontSize:'.65rem', fontWeight:800, color:'rgba(255,255,255,.4)', letterSpacing:'.1em', textTransform:'uppercase', padding:'12px 12px 8px' }}>Gestión</div>
          {navItems.filter(n => n.group === 'Gestión').map(item => (
            <Link key={item.path} to={item.path} style={linkStyle(item.path)}>
              <i className={`bi ${item.icon}`} style={{ fontSize:'1rem', width:'18px' }}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,.25)', display:'grid', placeItems:'center', fontWeight:800, fontSize:'.75rem', color:'white', flexShrink:0 }}>{initials}</div>
            <div>
              <div style={{ fontSize:'.78rem', fontWeight:700, color:'white' }}>{user?.nombres} {user?.apellidos}</div>
              <div style={{ fontSize:'.65rem', opacity:.55, color:'white' }}>{user?.correo}</div>
            </div>
          </div>
          <button onClick={clearUser} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'7px 0', background:'none', border:'none', color:'rgba(255,255,255,.7)', fontSize:'.8rem', fontWeight:600, cursor:'pointer', width:'100%' }}>
            <i className="bi bi-box-arrow-right" style={{ fontSize:'1rem', width:'18px' }}></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#f4f6f8' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout