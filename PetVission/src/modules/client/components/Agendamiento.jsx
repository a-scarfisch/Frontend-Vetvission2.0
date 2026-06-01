import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getMascotasByUsuario } from '@/modules/mascotas/services/mascotasService'
import { getVeterinarios, getDisponibilidadVeterinario, agendarCita } from '@/modules/client/services/citasService'

const ESPECIALIDADES = {
  'Consulta Médica': ['Medicina General Veterinaria', 'Cirugía', 'Fisioterapia y Rehabilitación'],
  'Vacunación': ['Calendario de Vacunación General'],
  'Servicios': ['Peluquería y Estética', 'Desparasitación', 'Microchip', 'Imagenología', 'Laboratorio y Exámenes'],
}

const SERVICIOS = [
  { label: 'Consulta Médica', icon: '🩺', bg: '#e6f7f5' },
  { label: 'Vacunación', icon: '💉', bg: '#fff8ed' },
  { label: 'Servicios', icon: '✂️', bg: '#f5f0ff' },
]

const EMOJIS = { Perro: '🐶', Gato: '🐱', Conejo: '🐰', Ave: '🐦' }

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const Agendamiento = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [mascotas, setMascotas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [loadingMascotas, setLoadingMascotas] = useState(true)
  const [loadingVets, setLoadingVets] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [successModal, setSuccessModal] = useState(false)

  const [state, setState] = useState({
    mascota: null, servicio: null, especialidad: null,
    centro: 'PetVission Santiago Centro', vet: null,
    fecha: null, hora: null,
  })

  // Generar próximos 7 días
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return { fecha: d, dia: DIAS_SEMANA[d.getDay()], num: d.getDate(), mes: MESES[d.getMonth()], noHours: d.getDay() === 0 }
  })

  useEffect(() => {
    if (!user?.idUsuario) return
    getMascotasByUsuario(user.idUsuario)
      .then(setMascotas)
      .catch(() => setMascotas([]))
      .finally(() => setLoadingMascotas(false))
  }, [user])

  useEffect(() => {
    if (step === 4) {
      setLoadingVets(true)
      getVeterinarios()
        .then(setVeterinarios)
        .catch(() => setVeterinarios([]))
        .finally(() => setLoadingVets(false))
    }
  }, [step])

  const handleConfirmar = async () => {
    setEnviando(true)
    try {
      await agendarCita({
        idMascota: state.mascota?.idMascota,
        idVeterinario: state.vet?.idUsuario,
        fechaHora: state.hora,
        motivo: state.especialidad,
        servicio: state.servicio,
      })
      setSuccessModal(true)
    } catch {
      alert('Error al agendar la cita. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  const steps = ['Paciente', 'Servicio', 'Procedimiento', 'Día y Hora', 'Confirmar']

  const s = { teal: '#1a9e8f', tealLight: '#e6f7f5', tealMid: '#b2e8e2', tealDark: '#137a6e', gray: '#f4f6f8', border: '#dde3ea', textMid: '#4a5568', textLight: '#8a97a8', textDark: '#1a2535', red: '#e05252', green: '#4caf7d' }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: s.gray }}>

      {/* Symptom banner */}
      <div style={{ background: s.teal, padding: '10px 32px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {[['🍽️', '¿No come bien?', 'Consulta Médica', 'Medicina General Veterinaria'],
          ['💉', '¿Necesita vacunas?', 'Vacunación', 'Calendario de Vacunación General'],
          ['🩺', 'Control de rutina', 'Consulta Médica', 'Medicina General Veterinaria'],
          ['🐛', 'Desparasitación', 'Servicios', 'Desparasitación'],
        ].map(([icon, label, serv, esp]) => (
          <button
            key={label}
            onClick={() => { setState(p => ({ ...p, servicio: serv, especialidad: esp })); setStep(3) }}
            style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: '50px', padding: '7px 18px', color: 'white', fontSize: '.82rem', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >{icon} {label}</button>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px 64px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.7rem' }}>Nueva Reserva</h1>
          <p style={{ fontSize: '.9rem', color: s.textMid, marginTop: '3px' }}>Paso {step}: {['Identificar paciente', 'Seleccionar servicio', 'Seleccionar especialidad', 'Seleccionar día y hora', 'Confirmar cita'][step - 1]}</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          {steps.map((label, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', top: '18px', left: '50%', width: '100%', height: '3px', background: i < step - 1 ? s.teal : s.border, zIndex: 0 }} />
              )}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid ${i < step ? s.teal : s.border}`, background: i < step ? s.teal : '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '.85rem', color: i < step ? 'white' : s.textLight, zIndex: 1, position: 'relative', transition: 'all .3s', boxShadow: i === step - 1 ? `0 0 0 5px rgba(26,158,143,.2)` : 'none' }}>
                {i < step - 1 ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '.7rem', fontWeight: 600, color: i < step ? s.tealDark : s.textLight, marginTop: '6px', textAlign: 'center' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '22px', boxShadow: '0 2px 8px rgba(26,158,143,.10)', padding: '32px', border: `1px solid ${s.border}` }}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: 900, fontSize: '1.2rem' }}>¿Para quién es la cita?</h4>
                <p style={{ color: s.textMid, fontSize: '.9rem', marginTop: '4px' }}>Selecciona la mascota que será atendida</p>
              </div>
              {loadingMascotas ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: s.teal }}></div></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {mascotas.map((m) => (
                    <div
                      key={m.idMascota}
                      onClick={() => setState(p => ({ ...p, mascota: m }))}
                      style={{ border: `2px solid ${state.mascota?.idMascota === m.idMascota ? s.teal : s.border}`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', background: state.mascota?.idMascota === m.idMascota ? s.tealLight : '#fff', transition: 'all .2s' }}
                    >
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: s.tealMid, display: 'grid', placeItems: 'center', fontSize: '1.6rem' }}>{EMOJIS[m.especie] ?? '🐾'}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{m.nombre}</div>
                        <div style={{ fontSize: '.8rem', color: s.textMid }}>{m.raza} · {m.edad} años</div>
                      </div>
                    </div>
                  ))}
                  {mascotas.length === 0 && <p style={{ color: s.textLight, fontSize: '.9rem' }}>No tienes mascotas registradas.</p>}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${s.border}` }}>
                <button onClick={() => setStep(2)} disabled={!state.mascota} style={{ background: state.mascota ? s.teal : s.border, color: state.mascota ? '#fff' : s.textLight, border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, fontSize: '1rem', cursor: state.mascota ? 'pointer' : 'not-allowed' }}>Continuar →</button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: 900, fontSize: '1.2rem' }}>¿Qué servicio necesitas agendar?</h4>
                <p style={{ color: s.textMid, fontSize: '.9rem', marginTop: '4px' }}>Elige el tipo de atención para tu mascota</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {SERVICIOS.map((sv) => (
                  <div
                    key={sv.label}
                    onClick={() => setState(p => ({ ...p, servicio: sv.label, especialidad: null }))}
                    style={{ border: `2px solid ${state.servicio === sv.label ? s.teal : s.border}`, borderRadius: '14px', padding: '24px 14px', textAlign: 'center', cursor: 'pointer', background: state.servicio === sv.label ? s.tealLight : '#fff', transition: 'all .22s' }}
                  >
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: sv.bg, display: 'grid', placeItems: 'center', fontSize: '1.5rem', margin: '0 auto 12px' }}>{sv.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '.9rem' }}>{sv.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${s.border}` }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', color: s.teal, border: `2px solid ${s.teal}`, borderRadius: '14px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer' }}>← Volver</button>
                <button onClick={() => setStep(3)} disabled={!state.servicio} style={{ background: state.servicio ? s.teal : s.border, color: state.servicio ? '#fff' : s.textLight, border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, cursor: state.servicio ? 'pointer' : 'not-allowed' }}>Continuar →</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: s.textMid, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: '8px' }}>Especialidad / Procedimiento</div>
                <select
                  value={state.especialidad ?? ''}
                  onChange={(e) => setState(p => ({ ...p, especialidad: e.target.value }))}
                  style={{ width: '100%', padding: '14px 18px', border: `2px solid ${s.border}`, borderRadius: '14px', fontSize: '.95rem', outline: 'none', color: s.textDark, background: '#fff' }}
                >
                  <option value="" disabled>Selecciona la especialidad...</option>
                  {(ESPECIALIDADES[state.servicio] ?? []).map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: s.textMid, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: '8px' }}>Centro de atención</div>
                <select
                  value={state.centro}
                  onChange={(e) => setState(p => ({ ...p, centro: e.target.value }))}
                  style={{ width: '100%', padding: '14px 18px', border: `2px solid ${s.border}`, borderRadius: '14px', fontSize: '.95rem', outline: 'none', color: s.textDark, background: '#fff' }}
                >
                  <option value="PetVission Santiago Centro">PetVission Santiago Centro</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${s.border}` }}>
                <button onClick={() => setStep(2)} style={{ background: 'none', color: s.teal, border: `2px solid ${s.teal}`, borderRadius: '14px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer' }}>← Volver</button>
                <button onClick={() => setStep(4)} disabled={!state.especialidad} style={{ background: state.especialidad ? s.teal : s.border, color: state.especialidad ? '#fff' : s.textLight, border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, cursor: state.especialidad ? 'pointer' : 'not-allowed' }}>Buscar Horas →</button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              {/* Date nav */}
              <div style={{ display: 'flex', borderBottom: `2px solid ${s.border}`, marginBottom: '28px', overflowX: 'auto' }}>
                {dias.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => !d.noHours && setState(p => ({ ...p, fecha: d.fecha, hora: null, vet: null }))}
                    style={{ padding: '12px 22px', textAlign: 'center', cursor: d.noHours ? 'not-allowed' : 'pointer', borderBottom: `3px solid ${state.fecha?.getDate() === d.num ? s.teal : 'transparent'}`, background: state.fecha?.getDate() === d.num ? s.tealLight : 'transparent', opacity: d.noHours ? .45 : 1, whiteSpace: 'nowrap', minWidth: '90px', transition: 'all .2s' }}
                  >
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: state.fecha?.getDate() === d.num ? s.tealDark : s.textLight, textTransform: 'uppercase' }}>{d.dia}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: state.fecha?.getDate() === d.num ? s.tealDark : s.textDark }}>{d.num}</div>
                    <div style={{ fontSize: '.72rem', color: state.fecha?.getDate() === d.num ? s.tealDark : s.textMid }}>{d.mes}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '16px' }}>
                📍 {state.centro} <span style={{ fontSize: '.8rem', color: s.textMid, fontWeight: 600 }}>({veterinarios.length} profesionales)</span>
              </div>

              {loadingVets ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: s.teal }}></div></div>
              ) : veterinarios.length === 0 ? (
                <p style={{ color: s.textLight, fontSize: '.9rem' }}>No hay veterinarios disponibles.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {veterinarios.map((v, i) => {
                    const horas = v.horasDisponibles ?? ['09:00', '10:00', '11:00', '14:00', '15:00']
                    const shown = horas.slice(0, 5)
                    const extra = horas.length - shown.length
                    return (
                      <div key={v.idUsuario ?? i} style={{ border: `2px solid ${s.border}`, borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: s.tealMid, display: 'grid', placeItems: 'center', fontSize: '1.5rem', flexShrink: 0 }}>👨‍⚕️</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{v.nombres ? `Dr. ${v.nombres} ${v.apellidos ?? ''}` : 'Veterinario'}</div>
                          <div style={{ fontSize: '.8rem', color: s.textMid, marginTop: '2px' }}>{v.especialidad ?? state.especialidad}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 2 }}>
                          {shown.map(h => (
                            <button
                              key={h}
                              onClick={() => setState(p => ({ ...p, vet: v, hora: h }))}
                              style={{ padding: '8px 16px', border: `2px solid ${state.hora === h && state.vet?.idUsuario === v.idUsuario ? 'transparent' : s.teal}`, borderRadius: '8px', fontWeight: 700, fontSize: '.82rem', color: state.hora === h && state.vet?.idUsuario === v.idUsuario ? '#fff' : s.teal, background: state.hora === h && state.vet?.idUsuario === v.idUsuario ? s.teal : '#fff', cursor: 'pointer', transition: 'all .18s' }}
                            >{h}</button>
                          ))}
                          {extra > 0 && <span style={{ fontSize: '.75rem', fontWeight: 700, color: s.teal, background: s.tealLight, borderRadius: '50px', padding: '4px 12px' }}>+{extra} más</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${s.border}` }}>
                <button onClick={() => setStep(3)} style={{ background: 'none', color: s.teal, border: `2px solid ${s.teal}`, borderRadius: '14px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer' }}>← Volver</button>
                <button onClick={() => setStep(5)} disabled={!state.hora} style={{ background: state.hora ? s.teal : s.border, color: state.hora ? '#fff' : s.textLight, border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, cursor: state.hora ? 'pointer' : 'not-allowed' }}>Confirmar Hora →</button>
              </div>
            </>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <>
              <div style={{ textAlign: 'center', padding: '24px 0 32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f8ef', display: 'grid', placeItems: 'center', fontSize: '2.2rem', margin: '0 auto 16px' }}>✅</div>
                <h2 style={{ fontWeight: 900, fontSize: '1.5rem' }}>Revisa y confirma tu cita</h2>
                <p style={{ color: s.textMid, marginTop: '4px' }}>Verifica los datos antes de confirmar</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  ['Mascota', state.mascota?.nombre ?? '—'],
                  ['Servicio', state.servicio ?? '—'],
                  ['Especialidad', state.especialidad ?? '—', state.centro],
                  ['Profesional', state.vet ? `Dr. ${state.vet.nombres ?? ''} ${state.vet.apellidos ?? ''}` : '—'],
                  ['Fecha', state.fecha ? `${DIAS_SEMANA[state.fecha.getDay()]} ${state.fecha.getDate()} de ${MESES[state.fecha.getMonth()]}` : '—'],
                  ['Hora', state.hora ?? '—'],
                ].map(([label, val, sub]) => (
                  <div key={label} style={{ background: s.gray, borderRadius: '14px', padding: '18px' }}>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: s.textLight, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: s.textDark, marginTop: '4px', color: label === 'Hora' ? s.teal : s.textDark }}>{val}</div>
                    {sub && <div style={{ fontSize: '.82rem', color: s.textMid }}>{sub}</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${s.border}` }}>
                <button onClick={() => setStep(4)} style={{ background: 'none', color: s.teal, border: `2px solid ${s.teal}`, borderRadius: '14px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer' }}>← Modificar</button>
                <button onClick={handleConfirmar} disabled={enviando} style={{ background: s.green, color: '#fff', border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {enviando ? <><div className="spinner-border spinner-border-sm"></div> Enviando...</> : '✓ Confirmar Cita'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Modal éxito */}
      {successModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, display: 'grid', placeItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '22px', padding: '32px', maxWidth: '520px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '8px' }}>¡Reserva confirmada!</h3>
            <p style={{ color: s.textMid, marginBottom: '24px' }}>La cita para {state.mascota?.nombre} ha sido agendada exitosamente.</p>
            <div style={{ background: s.tealLight, borderRadius: '14px', padding: '16px', marginBottom: '24px' }}>
              <strong>Dr. {state.vet?.nombres} {state.vet?.apellidos}</strong><br />
              📅 {state.fecha?.getDate()} {MESES[state.fecha?.getMonth()]} · ⏰ {state.hora}<br />
              📍 {state.centro}
            </div>
            <button onClick={() => navigate('/client')} style={{ background: s.teal, color: '#fff', border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', width: '100%' }}>Volver al Dashboard</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agendamiento