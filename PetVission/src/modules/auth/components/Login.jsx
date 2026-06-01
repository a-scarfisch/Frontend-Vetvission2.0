import LoginForm from './LoginForm.jsx'

const Login = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h1 className="h3 fw-bold">PetVission</h1>
          <p className="text-muted">Inicia sesión en tu cuenta</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default Login