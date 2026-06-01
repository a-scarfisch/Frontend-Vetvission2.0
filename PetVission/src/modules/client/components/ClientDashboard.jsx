import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getMascotasByUsuario } from '@/modules/mascotas/services/mascotasService'
import { getCitasByUsuario } from '@/modules/client/services/citasService'

const ClientDashboard = () => {
  const { user } = useAuthContext()
  const [mascotas, setMascotas] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.idUsuario) return
    Promise.all([
      getMascotasByUsuario(user.idUsuario),
      getCitasByUsuario(user.idUsuario),
    ])
      .then(([m, c]) => { setMascotas(m); setCitas(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const nombre = user?.nombres ?? 'Usuario'
  const proximaCita = citas.find(c => c.estado === 'CONFIRMADA' || c.estado === 'PENDIENTE')
  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE').length
  const emojis = { Perro: '🐶', Gato: '🐱', Ave: '🐦', Conejo: '🐰' }

  return (
    <>
      {/* Bienvenida */}
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h4 className="fw-bold mb-1">¡Hola, {nombre}! 👋</h4>
            <p className="text-muted mb-0">Aquí tienes un resumen del estado de tus mascotas</p>
          </div>
          <div className="col-auto d-none d-sm-block">
            <Link to="/client/agendamiento" className="btn btn-teal text-white px-4">
              <i className="bi bi-calendar-plus me-2"></i>Nueva cita
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-teal-light">
              <i className="bi bi-heart-fill text-teal"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-number">{loading ? '—' : mascotas.length}</div>
              <div className="kpi-label">Mis mascotas</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#fff3cd' }}>
              <i className="bi bi-calendar2-check-fill" style={{ color: '#ffc107' }}></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-number">{loading ? '—' : citas.filter(c => c.estado === 'CONFIRMADA').length}</div>
              <div className="kpi-label">Citas confirmadas</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#cff4fc' }}>
              <i className="bi bi-file-medical-fill" style={{ color: '#0dcaf0' }}></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-number">{loading ? '—' : citas.length}</div>
              <div className="kpi-label">Total consultas</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#d1e7dd' }}>
              <i className="bi bi-bell-fill" style={{ color: '#198754' }}></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-number">{loading ? '—' : citasPendientes}</div>
              <div className="kpi-label">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Mis mascotas */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-heart-fill text-teal me-2"></i>Mis Mascotas
              </h6>
              <Link to="/client/mascotas/nueva" className="btn btn-teal text-white px-3">
                <i className="bi bi-plus"></i> Agregar
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" style={{ color: '#1a9e8f' }}></div>
                  Cargando...
                </div>
              ) : mascotas.length === 0 ? (
                <p className="text-muted text-center py-3">No tienes mascotas registradas aún.</p>
              ) : (
                mascotas.slice(0, 3).map((m, i) => (
                  <div key={m.idMascota ?? i} className="pet-item mb-3">
                    <div className="pet-avatar" style={{ background: '#e8f5f0' }}>
                      {emojis[m.especie] ?? '🐾'}
                    </div>
                    <div className="pet-info">
                      <div className="fw-semibold">{m.nombre}</div>
                      <small className="text-muted">{m.raza} · {m.edad} años</small>
                    </div>
                    <span className="badge bg-teal-light text-teal ms-auto">
                      {m.estado ?? 'Activo'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Próximas reservas */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-calendar2-check-fill text-teal me-2"></i>Próximas Reservas
              </h6>
              <Link to="/client/mis-citas" className="btn btn-teal text-white px-3">
                <i className="bi bi-calendar-plus me-2"></i>Ver todas
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" style={{ color: '#1a9e8f' }}></div>
                  Cargando...
                </div>
              ) : !proximaCita ? (
                <p className="text-muted text-center py-3">No tienes citas próximas.</p>
              ) : (
                <div className="appointment-card">
                  <div className="appt-date">
                    <div className="appt-day">
                      {new Date(proximaCita.fechaHora).getDate()}
                    </div>
                    <div className="appt-month">
                      {new Date(proximaCita.fechaHora).toLocaleString('es', { month: 'short' })}
                    </div>
                  </div>
                  <div className="appt-info">
                    <div className="fw-semibold">{proximaCita.motivo ?? 'Consulta'}</div>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(proximaCita.fechaHora).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      {proximaCita.veterinario ? ` · ${proximaCita.veterinario}` : ''}
                    </small>
                  </div>
                  <span className="badge rounded-pill" style={{ background: '#e8f5f0', color: '#2a9d8f' }}>
                    {proximaCita.estado}
                  </span>
                </div>
              )}
              <div className="text-center mt-4">
                <Link to="/client/agendamiento" className="btn btn-teal text-white px-4">
                  <i className="bi bi-calendar-plus me-2"></i>Agendar nueva cita
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClientDashboard