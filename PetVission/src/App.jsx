import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import Login from './modules/auth/components/Login.jsx'
import Register from './modules/auth/components/Register.jsx'

// Client
import ClientLayout from './modules/client/components/ClientLayout.jsx'
import ClientDashboard from './modules/client/components/ClientDashboard.jsx'
import Agendamiento from './modules/client/components/Agendamiento.jsx'
import MisCitas from './modules/client/components/MisCitas.jsx'
import MisMascotas from './modules/mascotas/components/MisMascotas.jsx'
import MiPerfil from './modules/client/components/MiPerfil.jsx'

// Vet
import VetLayout from './modules/vet/components/VetLayout.jsx'
import VetDashboard from './modules/vet/components/VetDashboard.jsx'
import VetCitas from './modules/vet/components/VetCitas.jsx'
import VetHorarios from './modules/vet/components/VetHorarios.jsx'
import NuevaMascota from './modules/mascotas/components/NuevaMascota.jsx'
import VetPacientes from './modules/vet/components/VetPacientes.jsx'
import VetHistorial from './modules/vet/components/VetHistorial.jsx'
import VetInventario from './modules/vet/components/VetInventario.jsx'
import VetNuevoRegistro from './modules/vet/components/VetNuevoRegistro.jsx'
import VetProfile from './modules/vet/components/VetProfile.jsx'

// Admin 
import AdminLayout from './modules/admin/components/AdminLayout.jsx'
import AdminDashboard from './modules/admin/components/AdminDashboard.jsx'
import AdminUsuarios from './modules/admin/components/AdminUsuarios.jsx'
import AdminTurnos from './modules/admin/components/AdminTurnos.jsx'
import AdminInventario from './modules/admin/components/AdminInventario.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Cliente */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route path="agendamiento" element={<Agendamiento />} />
          <Route path="mis-citas" element={<MisCitas />} />
          <Route path="mascotas" element={<MisMascotas />} />
          <Route path="agendamiento" element={<Agendamiento />} />
          <Route path="perfil" element={<MiPerfil />} />
          <Route path="mascotas/nueva" element={<NuevaMascota />} />
        </Route>

        {/* Veterinario */}
        <Route path="/vet" element={<VetLayout />}>
          <Route index element={<VetDashboard />} />
          <Route path="citas" element={<VetCitas />} />
          <Route path="horarios" element={<VetHorarios />} />
          <Route path="pacientes" element={<VetPacientes />} />
          <Route path="historial" element={<VetHistorial />} />
          <Route path="inventario" element={<VetInventario />} />
          <Route path="nuevo-registro" element={<VetNuevoRegistro />} />
          <Route path="perfil" element={<VetProfile />} />
        </Route>

        {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="turnos" element={<AdminTurnos />} />
          <Route path="inventario" element={<AdminInventario />} />
          </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App