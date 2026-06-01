import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { crearMascota } from '@/modules/mascotas/services/mascotasService'

const ESPECIES = [
  { label: 'Perro', emoji: '🐶' },
  { label: 'Gato', emoji: '🐱' },
  { label: 'Otro', emoji: '🐹' },
]

const ESTADOS = [
  { label: 'Saludable', clase: 'green', icon: '✔' },
  { label: 'Vacuna pendiente', clase: 'amber', icon: '💉' },
  { label: 'En tratamiento', clase: 'red', icon: '🩺' },
]

const estadoStyle = {
  green: { border: '#22c55e', background: '#f0fdf4', color: '#16a34a' },
  amber: { border: '#f5a623', background: '#fff8ed', color: '#b45309' },
  red:   { border: '#e05252', background: '#fdeaea', color: '#e05252' },
}

const NuevaMascota = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    nombre: '', especie: 'Perro', raza: '', edad: '',
    peso: '', sexo: '', estado: 'Saludable',
    animalServicio: 'no', notas: '',
  })

  const s = {
    teal: '#1ab5a3', tealDark: '#0e8f80', tealLight: '#e6f9f7',
    tealMid: '#a8ede7', border: '#e2e8f0', gray: '#f4f6f8',
    textDark: '#1a2535', textMid: '#4a5568', textLight: '#94a3b8',
    red: '#e05252',
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '14px 18px',
    border: `2px solid ${hasError ? s.red : s.border}`, borderRadius: '14px',
    fontFamily: "'DM Sans', sans-serif", fontSize: '.92rem',
    color: s.textDark, background: '#fff', outline: 'none',
  })

  const labelStyle = {
    display: 'block', fontSize: '.7rem', fontWeight: 800,
    color: s.textLight, letterSpacing: '.1em',
    textTransform: 'uppercase', marginBottom: '8px',
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setErrors({ nombre: true })
      return
    }
    setErrors({})
    setEnviando(true)
    try {
      await crearMascota({
        nombre: form.nombre,
        especie: form.especie,
        raza: form.raza,
        edad: form.edad,
        peso: form.peso,
        sexo: form.sexo,
        estado: form.estado,
        animalServicio: form.animalServicio === 'si',
        notas: form.notas,
        idUsuario: user?.idUsuario,
      })
      showToast(`✅ ¡${form.nombre} (${form.especie}) registrado con éxito!`)
      setTimeout(() => navigate('/client/mascotas'), 1500)
    } catch {
      showToast('⚠️ Error al registrar la mascota')
    } finally {
      setEnviando(false)
    }
  }

  const emojiActual = ESPECIES.find(e => e.label === form.especie)?.emoji ?? '🐾'

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: s.textMid, fontSize: '.88rem', fontWeight: 600, marginBottom: '28px', padding: '7px 14px', borderRadius: '50px', border: `1.5px solid ${s.border}`, background: '#fff', cursor: 'pointer' }}
      >← Volver</button>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.tealLight, border: `2px solid ${s.tealMid}`, display: 'grid', placeItems: 'center', fontSize: '1.4rem' }}>🏠</div>
        <div>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1.6rem' }}>Agregar Nueva Mascota</h1>
          <p style={{ fontSize: '.88rem', color: s.textMid, marginTop: '2px' }}>Registra a tu compañero en PetVission para gestionar su salud</p>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: '#fff', borderRadius: '20px', border: `1.5px solid ${s.border}`, padding: '36px 40px', maxWidth: '680px', boxShadow: '0 2px 12px rgba(26,181,163,.07)' }}>

        {/* Avatar area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', padding: '20px', background: s.gray, borderRadius: '14px', border: `2px dashed ${s.border}` }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: s.tealLight, border: `3px solid ${s.tealMid}`, display: 'grid', placeItems: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
            {emojiActual}
          </div>
          <div>
            <strong style={{ display: 'block', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '.95rem' }}>Foto de la mascota</strong>
            <span style={{ fontSize: '.78rem', color: s.textLight }}>Sube una imagen (opcional)</span>
          </div>
        </div>

        {/* Nombre */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Nombre de la mascota</label>
          <input
            type="text"
            placeholder="Ej: Rocky"
            value={form.nombre}
            onChange={(e) => { setForm(p => ({ ...p, nombre: e.target.value })); setErrors({}) }}
            style={inputStyle(errors.nombre)}
          />
          {errors.nombre && <span style={{ fontSize: '.78rem', color: s.red }}>El nombre es obligatorio</span>}
        </div>

        {/* Especie */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Especie</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {ESPECIES.map((e) => (
              <button
                key={e.label}
                onClick={() => setForm(p => ({ ...p, especie: e.label }))}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 8px', borderRadius: '12px', border: `2px solid ${form.especie === e.label ? s.teal : s.border}`, background: form.especie === e.label ? s.tealLight : '#fff', cursor: 'pointer', fontSize: '.82rem', fontWeight: 700, color: form.especie === e.label ? s.teal : s.textMid, transition: 'all .18s' }}
              >
                <span style={{ fontSize: '1.8rem' }}>{e.emoji}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Raza + Edad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
          <div>
            <label style={labelStyle}>Raza</label>
            <input type="text" placeholder="Ej: Labrador" value={form.raza} onChange={(e) => setForm(p => ({ ...p, raza: e.target.value }))} style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle}>Edad</label>
            <input type="text" placeholder="Ej: 1 año" value={form.edad} onChange={(e) => setForm(p => ({ ...p, edad: e.target.value }))} style={inputStyle()} />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: `1px solid ${s.border}`, margin: '28px 0' }} />

        {/* Peso + Sexo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
          <div>
            <label style={labelStyle}>Peso</label>
            <input type="text" placeholder="Ej: 8.5 kg" value={form.peso} onChange={(e) => setForm(p => ({ ...p, peso: e.target.value }))} style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle}>Sexo</label>
            <select value={form.sexo} onChange={(e) => setForm(p => ({ ...p, sexo: e.target.value }))} style={inputStyle()}>
              <option value="">Seleccionar</option>
              <option>Macho</option>
              <option>Hembra</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: `1px solid ${s.border}`, margin: '28px 0' }} />

        {/* Estado de salud */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Estado de salud actual</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ESTADOS.map((e) => {
              const sel = form.estado === e.label
              const st = estadoStyle[e.clase]
              return (
                <button
                  key={e.label}
                  onClick={() => setForm(p => ({ ...p, estado: e.label }))}
                  style={{ padding: '8px 16px', borderRadius: '50px', border: `2px solid ${sel ? st.border : s.border}`, background: sel ? st.background : '#fff', fontSize: '.82rem', fontWeight: 700, color: sel ? st.color : s.textMid, cursor: 'pointer', transition: 'all .15s' }}
                >{e.icon} {e.label}</button>
              )
            })}
          </div>
        </div>

        {/* Animal de servicio */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Animal de Servicio</label>
          <select value={form.animalServicio} onChange={(e) => setForm(p => ({ ...p, animalServicio: e.target.value }))} style={inputStyle()}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Notas adicionales (opcional)</label>
          <textarea
            rows={3}
            placeholder="Ej: Alérgico al pollo, le gusta jugar con pelotas…"
            value={form.notas}
            onChange={(e) => setForm(p => ({ ...p, notas: e.target.value }))}
            style={{ ...inputStyle(), resize: 'vertical' }}
          />
        </div>

        <hr style={{ border: 'none', borderTop: `1px solid ${s.border}`, margin: '28px 0' }} />

        {/* Buttons */}
        <button
          onClick={handleSubmit}
          disabled={enviando}
          style={{ width: '100%', padding: '15px', background: s.teal, color: '#fff', border: 'none', borderRadius: '14px', fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {enviando ? <><div className="spinner-border spinner-border-sm"></div> Registrando...</> : '🐾 Agregar Mascota'}
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{ width: '100%', padding: '14px', background: 'none', color: s.textMid, border: `2px solid ${s.border}`, borderRadius: '14px', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', marginTop: '10px' }}
        >Cancelar</button>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', background: s.teal, color: '#fff', padding: '13px 24px', borderRadius: '50px', fontWeight: 700, fontSize: '.88rem', zIndex: 600, boxShadow: '0 8px 24px rgba(26,181,163,.35)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

export default NuevaMascota