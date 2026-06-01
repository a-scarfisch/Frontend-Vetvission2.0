import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthContext()

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute