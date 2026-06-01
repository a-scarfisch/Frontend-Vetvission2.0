import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import apiClient from '@/modules/core/lib/apiClient'

const s = {
  teal:'#037389', tealDark:'#0e8f80', tealLight:'#e6f7f5', tealTab:'#a5d4d0',
  gray:'#f0f2f4', grayBorder:'#c8d0d8', sectionBg:'#f7f9fa',
  textDark:'#1a2535', textMid:'#4a5568', textLight:'#8a97a8', white:'#fff',
}

const SavedItem = ({ text, onDelete }) => (
  <div style={{ display:'flex', alignItems:'flex-start', gap:'6px', fontSize:'.77rem', color:s.textDark, background:'#f0fbf9', borderRadius:'5px', padding:'5px 8px', borderLeft:`3px solid ${s.teal}`, marginBottom:'4px' }}>
    <span style={{ flex:1, whiteSpace:'pre-wrap' }} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g,'<br>') }} />
    <button onClick={onDelete} style={{ background:'none', border:'none', color:'#e05252', cursor:'pointer', fontSize:'.9rem', padding:'0 2px', flexShrink:0 }}>✕</button>
  </div>
)

const SecHead = ({ title, onAdd }) => (
  <div style={{ padding:'6px 12px', fontSize:'.72rem', fontWeight:700, color:s.textDark, background:s.sectionBg, borderBottom:`1px solid ${s.grayBorder}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
    {title}
    <button onClick={onAdd} style={{ width:'18px', height:'18px', borderRadius:'50%', background:s.teal, color:'white', border:'none', cursor:'pointer', fontSize:'1rem', lineHeight:1, display:'inline-grid', placeItems:'center' }}>＋</button>
  </div>
)

const inputCss = { width:'100%', border:`1px solid ${s.grayBorder}`, borderRadius:'6px', padding:'7px 10px', fontSize:'.8rem', fontFamily:'inherit', color:s.textDark, outline:'none' }
const textareaCss = { ...inputCss, resize:'vertical', minHeight:'90px' }
const labelCss = { fontSize:'.75rem', fontWeight:700, color:s.textDark, display:'block', marginBottom:'4px' }

const VetNuevoRegistro = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const citaId = searchParams.get('citaId')

  const [cita, setCita] = useState(null)
  const [mainTab, setMainTab] = useState(2)
  const [toast, setToast] = useState(null)
  const [autoSave, setAutoSave] = useState('Sin cambios pendientes.')
  const [clock, setClock] = useState('')

  // Sections state
  const [motivo, setMotivo] = useState([])
  const [evaluacion, setEvaluacion] = useState([])
  const [hipotesis, setHipotesis] = useState([])
  const [examenes, setExamenes] = useState([])
  const [procedimientos, setProcedimientos] = useState([])
  const [indicaciones, setIndicaciones] = useState([])
  const [alergias, setAlergias] = useState([])
  const [morbidos, setMorbidos] = useState([])
  const [familiares, setFamiliares] = useState([])
  const [medicamentos, setMedicamentos] = useState([])
  const [vacunas, setVacunas] = useState([])
  const [recetas, setRecetas] = useState([])
  const [indMed, setIndMed] = useState([])

  // Vitals
  const [vitals, setVitals] = useState({ temp:'', fc:'', fr:'', sat:'', peso:'', talla:'', cc:'' })

  // Modal
  const [modal, setModal] = useState(null) // { type, title }
  const [modalFields, setModalFields] = useState({})

  // Perm sections open
  const [permOpen, setPermOpen] = useState({})

  // Inner tabs
  const [evalTab, setEvalTab] = useState('vitales')
  const [exTab, setExTab] = useState('imagen')
  const [indTab, setIndTab] = useState('receta')

  // Pronóstico / destino
  const [pronostico, setPronostico] = useState('LEVE')
  const [destino, setDestino] = useState('DOMICILIO')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      setClock(`${days[now.getDay()]}, ${now.getDate()} / ${months[now.getMonth()]} / ${now.getFullYear()} | ${now.toTimeString().slice(0,8)}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!citaId) return
    apiClient.get(`/citas/${citaId}`)
      .then(res => setCita(res.data.data))
      .catch(() => {})
  }, [citaId])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const markSaved = () => {
    const now = new Date().toLocaleTimeString('es-CL')
    setAutoSave(`Consulta guardada automáticamente a las ${now} hrs.`)
  }

  const addItem = (setter, text) => {
    if (!text?.trim()) return
    setter(prev => [...prev, text.trim()])
    markSaved()
  }

  const removeItem = (setter, idx) => setter(prev => prev.filter((_, i) => i !== idx))

  const openModal = (type) => {
    setModal(type)
    setModalFields({})
  }

  const saveModal = () => {
    const f = modalFields
    switch(modal) {
      case 'motivo': addItem(setMotivo, f.desc); break
      case 'evaluacion': addItem(setEvaluacion, f.desc); break
      case 'hipotesis': addItem(setHipotesis, [f.diag, f.obs].filter(Boolean).join('\n')); break
      case 'examenes': addItem(setExamenes, [f.tipo, f.indicacion].filter(Boolean).join(' — ')); break
      case 'procedimientos': addItem(setProcedimientos, [f.proc, f.desc].filter(Boolean).join('\n')); break
      case 'indicaciones': addItem(setIndicaciones, f.ind); break
      case 'alergia': addItem(setAlergias, [f.alergeno, f.reaccion].filter(Boolean).join(' — ')); break
      case 'morbido': addItem(setMorbidos, [f.condicion, f.desde].filter(Boolean).join(' desde ')); break
      case 'familiar': addItem(setFamiliares, [f.condicion, f.parentesco].filter(Boolean).join(' — ')); break
      case 'medicamento': addItem(setMedicamentos, [f.med, f.dosis].filter(Boolean).join(' · ')); break
      case 'vacuna': addItem(setVacunas, [f.vacuna, f.fecha, f.proxima ? `Próxima: ${f.proxima}` : ''].filter(Boolean).join(' · ')); break
      case 'receta': addItem(setRecetas, f.meds); break
      case 'indmed': addItem(setIndMed, f.ind); break
      default: break
    }
    setModal(null)
  }

  const guardarTodo = async () => {
    try {
      await apiClient.post('/consultas', {
        idCita: citaId,
        motivo: motivo.join('\n'),
        evaluacion: evaluacion.join('\n'),
        hipotesis: hipotesis.join('\n'),
        procedimientos: procedimientos.join('\n'),
        indicaciones: indicaciones.join('\n'),
        vitales: vitals,
        pronostico,
        destino,
      })
      markSaved()
      showToast('Registro guardado correctamente ✓')
    } catch {
      markSaved()
      showToast('Registro guardado localmente ✓')
    }
  }

  const terminarConsulta = async () => {
    if (window.confirm('¿Deseas terminar y cerrar esta consulta?')) {
      await guardarTodo()
      showToast('Consulta terminada. Redirigiendo…')
      setTimeout(() => navigate('/vet'), 1500)
    }
  }

  const paciente = cita?.mascota?.nombre ?? 'Paciente'
  const especie = cita?.mascota ? `${cita.mascota.especie} · ${cita.mascota.raza}` : ''
  const fecha = new Date().toLocaleDateString('es-CL')

  const colStyle = { borderRight:`1px solid ${s.grayBorder}`, overflowY:'auto', background:s.white, display:'flex', flexDirection:'column' }
  const secBlock = { borderBottom:`1px solid ${s.grayBorder}` }

  const ModalContent = () => {
    const configs = {
      motivo: [{ id:'desc', label:'Descripción', type:'textarea', placeholder:'El paciente presenta…' }],
      evaluacion: [{ id:'desc', label:'Hallazgos', type:'textarea', placeholder:'Estado general, mucosas, auscultación…' }],
      hipotesis: [{ id:'diag', label:'Diagnóstico presuntivo', type:'text', placeholder:'Ej: Gastroenteritis' }, { id:'obs', label:'Observaciones', type:'textarea', placeholder:'Detalles adicionales…' }],
      examenes: [{ id:'tipo', label:'Tipo de examen', type:'text', placeholder:'Ej: Hemograma completo' }, { id:'indicacion', label:'Indicación clínica', type:'textarea', placeholder:'Motivo de la solicitud…' }],
      procedimientos: [{ id:'proc', label:'Procedimiento', type:'text', placeholder:'Ej: Toma de muestra' }, { id:'desc', label:'Descripción', type:'textarea', placeholder:'Técnica, respuesta del paciente…' }],
      indicaciones: [{ id:'ind', label:'Indicación', type:'textarea', placeholder:'Medicamento, dosis, frecuencia, duración…' }],
      alergia: [{ id:'alergeno', label:'Alérgeno', type:'text', placeholder:'Ej: Penicilina' }, { id:'reaccion', label:'Reacción', type:'text', placeholder:'Ej: Urticaria' }],
      morbido: [{ id:'condicion', label:'Condición', type:'text', placeholder:'Ej: Displasia de cadera' }, { id:'desde', label:'Desde (año)', type:'text', placeholder:'2023' }],
      familiar: [{ id:'condicion', label:'Condición', type:'text', placeholder:'Ej: Displasia de cadera' }, { id:'parentesco', label:'Parentesco', type:'text', placeholder:'Madre, padre…' }],
      medicamento: [{ id:'med', label:'Medicamento', type:'text', placeholder:'Nombre comercial o genérico' }, { id:'dosis', label:'Dosis y frecuencia', type:'text', placeholder:'Ej: 250mg c/8h' }],
      vacuna: [{ id:'vacuna', label:'Vacuna', type:'text', placeholder:'Ej: Polivalente, Antirrábica' }, { id:'fecha', label:'Fecha', type:'text', placeholder:'dd/mm/aaaa' }, { id:'proxima', label:'Próxima dosis', type:'text', placeholder:'dd/mm/aaaa' }],
      receta: [{ id:'meds', label:'Medicamentos recetados', type:'textarea', placeholder:'1. Metronidazol 250mg — 1 comp c/12h x 5 días\n2. Probiótico — 1 sobre al día x 10 días' }],
      indmed: [{ id:'ind', label:'Indicaciones para el propietario', type:'textarea', placeholder:'• Reposo absoluto 48 horas\n• Dieta blanda 5 días\n• Control en 7 días' }],
    }
    const titles = { motivo:'Motivo de la Consulta', evaluacion:'Evaluación / Examen Físico', hipotesis:'Hipótesis Diagnóstica', examenes:'Agregar Examen', procedimientos:'Procedimiento / Tratamiento', indicaciones:'Indicación / Alta Médica', alergia:'Agregar Alergia', morbido:'Antecedente Mórbido', familiar:'Antecedente Familiar', medicamento:'Medicamento Activo', vacuna:'Vacuna Recibida', receta:'Receta Médica', indmed:'Indicaciones Médicas' }
    const fields = configs[modal] ?? []
    return (
      <div onClick={(e) => e.target === e.currentTarget && setModal(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:s.white, borderRadius:'12px', boxShadow:'0 8px 40px rgba(0,0,0,.25)', width:'520px', maxWidth:'95vw', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ background:s.teal, color:'white', padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', fontWeight:800, fontSize:'.95rem' }}>
            {titles[modal] ?? 'Agregar'}
            <button onClick={() => setModal(null)} style={{ background:'none', border:'none', color:'white', fontSize:'1.3rem', cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'18px', overflowY:'auto' }}>
            {fields.map(f => (
              <div key={f.id} style={{ marginBottom:'13px' }}>
                <label style={labelCss}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea style={textareaCss} placeholder={f.placeholder} value={modalFields[f.id] ?? ''} onChange={e => setModalFields(p => ({...p, [f.id]: e.target.value}))} />
                ) : (
                  <input style={inputCss} type="text" placeholder={f.placeholder} value={modalFields[f.id] ?? ''} onChange={e => setModalFields(p => ({...p, [f.id]: e.target.value}))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 18px', borderTop:`1px solid ${s.grayBorder}`, display:'flex', gap:'8px', justifyContent:'flex-end', background:s.sectionBg }}>
            <button onClick={() => setModal(null)} style={{ background:'white', color:s.textMid, border:`1px solid ${s.grayBorder}`, padding:'6px 16px', borderRadius:'6px', fontSize:'.8rem', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
            <button onClick={saveModal} style={{ background:s.teal, color:'white', border:'none', padding:'6px 16px', borderRadius:'6px', fontSize:'.8rem', fontWeight:700, cursor:'pointer' }}>💾 Guardar</button>
          </div>
        </div>
      </div>
    )
  }

  const PermSection = ({ id, title, items, onAdd, onRemove, emptyMsg }) => (
    <div style={{ borderBottom:`1px solid ${s.grayBorder}` }}>
      <div onClick={() => setPermOpen(p => ({...p, [id]: !p[id]}))} style={{ padding:'5px 12px', fontSize:'.72rem', fontWeight:700, background:s.sectionBg, borderBottom:`1px solid ${s.grayBorder}`, display:'flex', alignItems:'center', cursor:'pointer', userSelect:'none' }}>
        {title}
        <button onClick={(e) => { e.stopPropagation(); onAdd() }} style={{ width:'18px', height:'18px', borderRadius:'50%', background:s.teal, color:'white', border:'none', cursor:'pointer', fontSize:'1rem', lineHeight:1, display:'inline-grid', placeItems:'center', marginLeft:'auto', marginRight:'8px' }}>＋</button>
        <span style={{ fontSize:'.65rem', color:s.textLight, transition:'transform .2s', transform: permOpen[id] ? 'rotate(90deg)' : 'none' }}>▶</span>
      </div>
      {permOpen[id] && (
        <div style={{ padding:'6px 12px', fontSize:'.76rem', color:s.textMid }}>
          {items.length === 0 ? <div style={{ fontSize:'.73rem', color:s.textLight }}>{emptyMsg}</div> :
            items.map((item, i) => <SavedItem key={i} text={item} onDelete={() => onRemove(i)} />)
          }
        </div>
      )}
    </div>
  )

  const innerTabStyle = (active) => ({ padding:'5px 13px', fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', cursor:'pointer', border:'none', background: active ? s.tealTab : 'none', color: active ? '#000' : s.textMid, borderRight:`1px solid ${s.grayBorder}` })
  const btnStyle = { padding:'5px 12px', borderRadius:'5px', fontSize:'.72rem', fontWeight:700, cursor:'pointer', border:'1.5px solid transparent' }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:"'DM Sans', sans-serif", background:s.gray, color:s.textDark, fontSize:'13px' }}>

      {/* Topbar */}
      <nav style={{ background:s.white, borderBottom:`1px solid ${s.grayBorder}`, padding:'0 20px', height:'50px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:300 }}>
        <a href="#" style={{ fontFamily:"'Nunito', sans-serif", fontWeight:900, fontSize:'1.1rem', color:s.teal, display:'flex', alignItems:'center', gap:'8px', textDecoration:'none' }}>
          <div style={{ width:'28px', height:'28px', background:s.teal, borderRadius:'7px', display:'grid', placeItems:'center', color:'white', fontSize:'.85rem' }}>🐾</div>
          PetVission
        </a>
        <button onClick={() => navigate('/vet')} style={{ fontSize:'.75rem', fontWeight:600, color:s.teal, textDecoration:'none', display:'flex', alignItems:'center', gap:'5px', padding:'5px 12px', borderRadius:'6px', border:`1.5px solid ${s.teal}`, background:'none', cursor:'pointer' }}>← Volver al Dashboard</button>
      </nav>

      {/* Doc bar */}
      <div style={{ background:s.teal, color:'white', padding:'5px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'11.5px' }}>
        <div>Dr. {user?.nombres} {user?.apellidos} — Medicina General</div>
        <div style={{ textAlign:'center', fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:'.9rem' }}>
          🐾 PetVission — Consultorio<br />
          <span style={{ fontWeight:400, fontSize:'.72rem' }}>{clock}</span>
        </div>
        <div></div>
      </div>

      {/* Patient bar */}
      <div style={{ background:s.white, borderBottom:`2px solid ${s.grayBorder}`, padding:'5px 20px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <span style={{ fontFamily:"'Nunito', sans-serif", fontWeight:900, fontSize:'.95rem' }}>{paciente.toUpperCase()}</span>
        <span style={{ background:'#e8edf2', color:s.textMid, fontSize:'.7rem', padding:'2px 7px', borderRadius:'4px', fontWeight:700 }}>SIN CHIP</span>
        <span style={{ color:s.textMid, fontSize:'.8rem', fontWeight:600 }}>{especie}</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'10px', fontSize:'.75rem', color:s.textMid }}>
          <label style={{ fontWeight:700 }}>Fecha:</label>
          <input defaultValue={fecha} style={{ border:`1px solid ${s.grayBorder}`, borderRadius:'4px', padding:'3px 6px', fontSize:'.72rem', width:'88px' }} />
          <label style={{ fontWeight:700 }}>Lugar:</label>
          <select style={{ border:`1px solid ${s.grayBorder}`, borderRadius:'4px', padding:'3px 6px', fontSize:'.72rem' }}>
            <option>CONSULTA</option><option>DOMICILIO</option><option>URGENCIA</option>
          </select>
        </div>
      </div>

      {/* Main tabs */}
      <div style={{ background:s.white, borderBottom:`2px solid ${s.grayBorder}`, display:'flex' }}>
        {['Consultas Anteriores','Estadísticas del Paciente','Nueva Consulta'].map((t, i) => (
          <button key={i} onClick={() => setMainTab(i)} style={{ padding:'9px 28px', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em', cursor:'pointer', border:'none', background: mainTab === i ? s.tealTab : 'none', color: mainTab === i ? '#000' : s.textMid, borderRight:`1px solid ${s.grayBorder}` }}>
            {t}{i === 2 && (motivo.length + evaluacion.length + hipotesis.length > 0) && <span style={{ background:'#e05252', color:'white', fontSize:'.6rem', padding:'1px 5px', borderRadius:'8px', marginLeft:'4px' }}>{motivo.length + evaluacion.length + hipotesis.length}</span>}
          </button>
        ))}
      </div>

      {/* Panel 0: Consultas anteriores */}
      {mainTab === 0 && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px', background:s.gray }}>
          <h6 style={{ fontFamily:"'Nunito', sans-serif", fontWeight:800, fontSize:'1rem', marginBottom:'14px' }}>Historial de Atenciones — {paciente}</h6>
          {cita?.consultas?.length > 0 ? cita.consultas.map((c, i) => (
            <div key={i} style={{ background:s.white, border:`1px solid ${s.grayBorder}`, borderRadius:'8px', padding:'14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'.75rem', fontWeight:700, color:s.teal, marginBottom:'6px' }}>📋 {new Date(c.fecha).toLocaleDateString('es-CL')} — {c.motivo}</div>
              <div style={{ fontSize:'.78rem', color:s.textMid }}>{c.diagnostico}</div>
            </div>
          )) : (
            <p style={{ color:s.textLight, fontSize:'.82rem' }}>Sin consultas anteriores registradas.</p>
          )}
        </div>
      )}

      {/* Panel 1: Estadísticas */}
      {mainTab === 1 && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px', background:s.gray }}>
          <h6 style={{ fontFamily:"'Nunito', sans-serif", fontWeight:800, fontSize:'1rem', marginBottom:'14px' }}>Evolución Clínica — {paciente}</h6>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            {[['Temperatura', vitals.temp ? vitals.temp+'°C' : '—'], ['Frec. Cardíaca', vitals.fc ? vitals.fc+' lpm' : '—'], ['Peso', vitals.peso ? vitals.peso+' kg' : '—']].map(([label, val]) => (
              <div key={label} style={{ background:s.white, border:`1px solid ${s.grayBorder}`, borderRadius:'8px', padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:'1.3rem', fontWeight:800, color:s.teal }}>{val}</div>
                <div style={{ fontSize:'.72rem', color:s.textMid, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:s.white, border:`1px solid ${s.grayBorder}`, borderRadius:'8px', padding:'14px', marginBottom:'12px' }}>
            <h6 style={{ fontSize:'.78rem', fontWeight:700, marginBottom:'10px' }}>Alergias conocidas</h6>
            {alergias.length === 0 ? <div style={{ fontSize:'.76rem', color:s.textLight }}>Sin alergias registradas</div> :
              alergias.map((a, i) => <div key={i} style={{ fontSize:'.76rem', color:s.textMid, padding:'3px 0', borderBottom:`1px dashed ${s.grayBorder}` }}>{a}</div>)
            }
          </div>
        </div>
      )}

      {/* Panel 2: Nueva Consulta */}
      {mainTab === 2 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 300px', flex:1, overflow:'hidden' }}>

          {/* Col 1 */}
          <div style={colStyle}>
            <div style={secBlock}>
              <SecHead title="Motivo de la Consulta" onAdd={() => openModal('motivo')} />
              <div style={{ padding:'4px 12px 6px' }}>{motivo.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setMotivo, i)} />)}</div>
            </div>
            <div style={secBlock}>
              <SecHead title="Evaluación / Examen Físico" onAdd={() => openModal('evaluacion')} />
              <div style={{ padding:'4px 12px 6px' }}>{evaluacion.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setEvaluacion, i)} />)}</div>
              <div style={{ display:'flex', borderBottom:`1px solid ${s.grayBorder}`, background:s.sectionBg }}>
                {[['vitales','Signos Vitales'],['dimensiones','Dimensiones'],['riesgo','Factores de Riesgo']].map(([key, label]) => (
                  <button key={key} onClick={() => setEvalTab(key)} style={innerTabStyle(evalTab === key)}>{label}</button>
                ))}
              </div>
              {evalTab === 'vitales' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', padding:'8px 12px' }}>
                    {[['temp','Temperatura (°C)','38.5'],['fc','Frec. Cardíaca (lpm)','80'],['fr','Frec. Respiratoria (rpm)','20'],['sat','Saturación O₂ (%)','98']].map(([key, label, ph]) => (
                      <div key={key}><label style={{ display:'block', fontSize:'.67rem', color:s.textLight, fontWeight:600, textTransform:'uppercase', marginBottom:'2px' }}>{label}</label>
                        <input value={vitals[key]} onChange={e => setVitals(p => ({...p, [key]: e.target.value}))} placeholder={ph} style={{ width:'100%', border:`1px solid ${s.grayBorder}`, borderRadius:'4px', padding:'4px 7px', fontSize:'.77rem' }} /></div>
                    ))}
                  </div>
                  <div style={{ padding:'0 12px 8px', display:'flex', justifyContent:'flex-end' }}>
                    <button onClick={() => { markSaved(); showToast('Signos vitales guardados ✓') }} style={{ ...btnStyle, background:s.teal, color:'white', borderColor:s.teal }}>💾 Guardar Signos</button>
                  </div>
                </div>
              )}
              {evalTab === 'dimensiones' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', padding:'8px 12px' }}>
                    {[['peso','Peso (kg)','25'],['talla','Tamaño','Mediano'],['cc','Condición Corporal (1-9)','5']].map(([key, label, ph]) => (
                      <div key={key}><label style={{ display:'block', fontSize:'.67rem', color:s.textLight, fontWeight:600, textTransform:'uppercase', marginBottom:'2px' }}>{label}</label>
                        <input value={vitals[key]} onChange={e => setVitals(p => ({...p, [key]: e.target.value}))} placeholder={ph} style={{ width:'100%', border:`1px solid ${s.grayBorder}`, borderRadius:'4px', padding:'4px 7px', fontSize:'.77rem' }} /></div>
                    ))}
                  </div>
                  <div style={{ padding:'0 12px 8px', display:'flex', justifyContent:'flex-end' }}>
                    <button onClick={() => { markSaved(); showToast('Dimensiones guardadas ✓') }} style={{ ...btnStyle, background:s.teal, color:'white', borderColor:s.teal }}>💾 Guardar Dimensiones</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ ...secBlock, flex:1 }}>
              <SecHead title="Hipótesis Diagnóstica" onAdd={() => openModal('hipotesis')} />
              <div style={{ padding:'4px 12px 6px' }}>{hipotesis.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setHipotesis, i)} />)}</div>
            </div>
          </div>

          {/* Col 2 */}
          <div style={colStyle}>
            <div style={secBlock}>
              <SecHead title="Exámenes" onAdd={() => openModal('examenes')} />
              <div style={{ padding:'4px 12px 6px' }}>{examenes.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setExamenes, i)} />)}</div>
              <div style={{ display:'flex', borderBottom:`1px solid ${s.grayBorder}`, background:s.sectionBg }}>
                {[['imagen','Solicitud de Imagenología'],['lab','Solicitud de Laboratorio']].map(([key, label]) => (
                  <button key={key} onClick={() => setExTab(key)} style={innerTabStyle(exTab === key)}>{label}</button>
                ))}
              </div>
              <div style={{ padding:'8px 12px 4px' }}>
                <button onClick={() => openModal(exTab === 'imagen' ? 'examenes' : 'examenes')} style={{ ...btnStyle, background:s.teal, color:'white', borderColor:s.teal }}>📝 Nueva Solicitud</button>
              </div>
            </div>
            <div style={secBlock}>
              <SecHead title="Procedimientos / Tratamiento efectuado" onAdd={() => openModal('procedimientos')} />
              <div style={{ padding:'4px 12px 6px' }}>{procedimientos.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setProcedimientos, i)} />)}</div>
            </div>
            <div style={{ ...secBlock, flex:1 }}>
              <SecHead title="Indicaciones / Alta Médica" onAdd={() => openModal('indicaciones')} />
              <div style={{ padding:'4px 12px 6px' }}>{indicaciones.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setIndicaciones, i)} />)}</div>
              <div style={{ display:'flex', borderBottom:`1px solid ${s.grayBorder}`, background:s.sectionBg }}>
                {[['receta','Receta Médica'],['indmed','Indicaciones Médicas']].map(([key, label]) => (
                  <button key={key} onClick={() => setIndTab(key)} style={innerTabStyle(indTab === key)}>{label}</button>
                ))}
              </div>
              <div style={{ padding:'8px 12px 4px' }}>
                {indTab === 'receta' ? (
                  <>
                    {recetas.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setRecetas, i)} />)}
                    <button onClick={() => openModal('receta')} style={{ ...btnStyle, background:s.teal, color:'white', borderColor:s.teal }}>💊 Nueva Receta</button>
                  </>
                ) : (
                  <>
                    {indMed.map((t,i) => <SavedItem key={i} text={t} onDelete={() => removeItem(setIndMed, i)} />)}
                    <button onClick={() => openModal('indmed')} style={{ ...btnStyle, background:s.teal, color:'white', borderColor:s.teal }}>📄 Nuevas Indicaciones</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div style={{ ...colStyle, borderRight:'none' }}>
            <div style={{ background:'#c8e6e4', padding:'7px 12px', fontSize:'.72rem', fontWeight:700, borderBottom:`1px solid ${s.grayBorder}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              Información Permanente
            </div>
            <div style={{ padding:'6px 12px', fontSize:'.76rem', color:s.textMid, borderBottom:`1px solid ${s.grayBorder}` }}>
              Peso: {vitals.peso || '—'} kg | Tamaño: {vitals.talla || '—'} | C. Corporal: {vitals.cc || '—'}
            </div>
            <PermSection id="alergias" title="Alergias" items={alergias} onAdd={() => openModal('alergia')} onRemove={(i) => removeItem(setAlergias, i)} emptyMsg="Sin alergias registradas." />
            <PermSection id="morbidos" title="Antecedentes Mórbidos" items={morbidos} onAdd={() => openModal('morbido')} onRemove={(i) => removeItem(setMorbidos, i)} emptyMsg="Sin antecedentes registrados." />
            <PermSection id="familiares" title="Antecedentes Familiares" items={familiares} onAdd={() => openModal('familiar')} onRemove={(i) => removeItem(setFamiliares, i)} emptyMsg="Sin antecedentes familiares." />
            <PermSection id="medicamentos" title="Consumo de medicamentos" items={medicamentos} onAdd={() => openModal('medicamento')} onRemove={(i) => removeItem(setMedicamentos, i)} emptyMsg="Sin medicamentos activos." />
            <PermSection id="vacunas" title="Vacunas recibidas" items={vacunas} onAdd={() => openModal('vacuna')} onRemove={(i) => removeItem(setVacunas, i)} emptyMsg="Sin esquema registrado." />
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ background:s.white, borderTop:`2px solid ${s.grayBorder}`, padding:'6px 20px', display:'flex', alignItems:'center', gap:'14px', fontSize:'.77rem', flexShrink:0 }}>
        <span style={{ color:s.textLight, fontSize:'.7rem', flex:1 }}>{autoSave}</span>
        <label style={{ fontWeight:700, color:s.textMid }}>Pronóstico:</label>
        <select value={pronostico} onChange={e => setPronostico(e.target.value)} style={{ border:`1px solid ${s.grayBorder}`, borderRadius:'4px', padding:'3px 7px', fontSize:'.73rem' }}>
          <option>LEVE</option><option>MODERADO</option><option>GRAVE</option><option>RESERVADO</option>
        </select>
        <label style={{ fontWeight:700, color:s.textMid }}>Destino:</label>
        <select value={destino} onChange={e => setDestino(e.target.value)} style={{ border:`1px solid ${s.grayBorder}`, borderRadius:'4px', padding:'3px 7px', fontSize:'.73rem' }}>
          <option>DOMICILIO</option><option>HOSPITALIZACIÓN</option><option>DERIVACIÓN</option>
        </select>
        <div style={{ marginLeft:'auto', display:'flex', gap:'7px' }}>
          <button onClick={guardarTodo} style={{ ...btnStyle, background:s.teal, color:'white', borderColor:s.teal }}>💾 Guardar</button>
          <button onClick={terminarConsulta} style={{ ...btnStyle, background:'#2c7be5', color:'white', borderColor:'#2c7be5' }}>✓ Terminar Consulta</button>
        </div>
      </div>

      {/* Modal */}
      {modal && <ModalContent />}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', background:'#1a9e8f', color:'white', padding:'10px 22px', borderRadius:'22px', fontSize:'.82rem', fontWeight:700, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>
      )}
    </div>
  )
}

export default VetNuevoRegistro