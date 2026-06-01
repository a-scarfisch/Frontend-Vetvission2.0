import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const navItems = [
  { label: 'Inicio', path: '/vet', icon: 'bi-house-fill' },
  { label: 'Mi Horario', path: '/vet/horarios', icon: 'bi-calendar3-week-fill' },
  { label: 'Mis Pacientes', path: '/vet/pacientes', icon: 'bi-people-fill', badge: '4' },
  { label: 'Historial Clínico', path: '/vet/historial', icon: 'bi-clipboard2-pulse-fill' },
  { label: 'Inventario', path: '/vet/inventario', icon: 'bi-box-seam-fill' },
  { label: 'Mi Perfil', path: '/vet/perfil', icon: 'bi-person-fill' },
]

const VetLayout = () => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'V'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside style={{
        width: '260px', height: '100vh', position: 'sticky', top: 0,
        background: 'linear-gradient(180deg,#085e75 0%,#134e4a 100%)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        boxShadow: '4px 0 20px rgba(0,0,0,.12)',
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,.2)', borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: '1rem' }}>
              <i className="bi bi-heart-pulse-fill" style={{ color: 'white' }}></i>
            </div>
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '.95rem', color: 'white' }}>PetVission</div>
              <div style={{ fontSize: '.67rem', opacity: .6, color: 'white', marginTop: '1px' }}>Gestión Veterinaria</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px',
                  borderRadius: '8px', textDecoration: 'none', fontSize: '.8rem', fontWeight: 600,
                  color: active ? 'white' : 'rgba(255,255,255,.7)',
                  background: active ? 'rgba(255,255,255,.18)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,.15)' : 'none',
                  transition: 'all .15s',
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', width: '18px', textAlign: 'center' }}></i>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ background: '#f59e0b', color: 'white', fontSize: '.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: '8px' }}>{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '.75rem', color: 'white', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'white' }}>{user?.nombres} {user?.apellidos}</div>
              <div style={{ fontSize: '.65rem', opacity: .55, color: 'white' }}>{user?.correo}</div>
            </div>
          </div>
          <button
            onClick={clearUser}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem', width: '18px' }}></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6f8' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default VetLayout