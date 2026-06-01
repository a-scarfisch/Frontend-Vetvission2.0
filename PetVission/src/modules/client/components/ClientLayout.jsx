import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const ClientLayout = () => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/client', icon: '⊞' },
    { label: 'Mis Mascotas', path: '/client/mascotas', icon: '🐾' },
    { label: 'Mis Citas', path: '/client/mis-citas', icon: '📅' },
    { label: 'Mi Perfil', path: '/client/perfil', icon: '👤' },
  ]

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'U'

  return (
    <div style={{ background: '#f4f6f9', margin: 0 }}>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm px-3 sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-teal d-flex align-items-center gap-2" href="#">
            <i className="bi bi-heart-pulse-fill"></i> PetVission
          </a>
          <div className="d-none d-md-flex flex-grow-1 mx-4">
            <div className="input-group" style={{ maxWidth: '380px' }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input type="text" className="form-control bg-light border-start-0" placeholder="Buscar..." />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <div className="position-relative">
              <button className="btn btn-light rounded-circle p-2">
                <i className="bi bi-bell fs-5 text-muted"></i>
              </button>
              <span className="position-absolute top-0 end-0 badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>2</span>
            </div>
            <div className="dropdown">
              <button className="btn d-flex align-items-center gap-2 p-0 border-0" data-bs-toggle="dropdown">
                <div className="avatar-circle bg-teal text-white fw-bold">{initials}</div>
                <span className="d-none d-md-inline fw-medium small">{user?.nombres} {user?.apellidos}</span>
                <i className="bi bi-chevron-down small text-muted"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li><Link className="dropdown-item" to="/client/perfil"><i className="bi bi-person me-2 text-teal"></i>Mi perfil</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={clearUser}><i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        {/* SIDEBAR */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-inner">
            <ul className="sidebar-nav">
              <li className="sidebar-label">Principal</li>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li className="sidebar-label mt-3">Cuenta</li>
              <li>
                <button
                  onClick={clearUser}
                  className="sidebar-link text-danger border-0 bg-transparent w-100"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ClientLayout