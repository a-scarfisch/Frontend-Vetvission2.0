const PACIENTES = {
  luna: {
    nombre: 'Luna', av: '🐱', avColor: '#0ea5e9',
    meta: 'Gato · Persa · 3 años · 4.2 kg',
    vitales: [
      { icon:'📏', name:'Altura/Largo', val:'45', unit:'cm' },
      { icon:'⚖️', name:'Peso', val:'4.2', unit:'kg' },
      { icon:'🌡️', name:'Temperatura', val:'38.5', unit:'°C' },
      { icon:'💓', name:'Frec. Cardíaca', val:'160', unit:'l/m' },
      { icon:'🫁', name:'Frec. Respiratoria', val:'24', unit:'r/m' },
    ],
    archivos: [
      { icon:'🖼️', name:'Rx_torax_2026.jpg', size:'1.8 MB', fecha:'May 05, 2026 · 10:14 AM' },
      { icon:'📄', name:'Analisis_sangre.pdf', size:'340 KB', fecha:'Abr 20, 2026 · 03:40 PM' },
    ],
    alergias: { medicamentos: ['Penicilina', 'Amoxicilina'], otras: ['Pescado de agua dulce'] },
    patologicos: [
      { key:'Antecedentes Negados', val:'Tuberculosis, Transfusiones', tipo:'negative' },
      { key:'Hospitalización Previa', val:'Bronquitis en Marzo 2025.', tipo:'positive' },
      { key:'Cirugías Previas', val:'Esterilización en 2024.', tipo:'positive' },
    ],
    vacunas: [
      { name:'Triple Felina', fecha:'2026-03-15', prox:'2027-03-15', estado:'vigente' },
      { name:'Rabia', fecha:'2026-03-15', prox:'2027-03-15', estado:'vigente' },
    ],
    consultas: [
      { dia:'05', mes:'MAY', anio:'2026', titulo:'Consulta General', diag:'Control de rutina', meds:'Vitaminas Omega-3 · 1 cápsula diaria.' },
      { dia:'15', mes:'MAR', anio:'2026', titulo:'Vacunación', diag:'Triple Felina + Rabia', meds:'Sin medicación recetada.' },
    ],
  },
  max: {
    nombre: 'Max', av: '🐶', avColor: '#22c55e',
    meta: 'Perro · Golden Retriever · 4 años · 28 kg',
    vitales: [
      { icon:'📏', name:'Altura', val:'58', unit:'cm' },
      { icon:'⚖️', name:'Peso', val:'28', unit:'kg' },
      { icon:'🌡️', name:'Temperatura', val:'38.8', unit:'°C' },
      { icon:'💓', name:'Frec. Cardíaca', val:'90', unit:'l/m' },
      { icon:'🫁', name:'Frec. Respiratoria', val:'18', unit:'r/m' },
    ],
    archivos: [
      { icon:'📄', name:'Examen_sangre_Max.pdf', size:'512 KB', fecha:'May 03, 2026 · 11:00 AM' },
    ],
    alergias: { medicamentos: ['Sulfonamidas'], otras: ['Polen (rinitis estacional)'] },
    patologicos: [
      { key:'Antecedentes Negados', val:'Transfusiones', tipo:'negative' },
      { key:'Hospitalización Previa', val:'Parvovirus en 2023, recuperación completa.', tipo:'positive' },
    ],
    vacunas: [
      { name:'Sextuple', fecha:'2026-01-10', prox:'2027-01-10', estado:'vigente' },
      { name:'Rabia', fecha:'2025-12-01', prox:'2026-12-01', estado:'vigente' },
    ],
    consultas: [
      { dia:'03', mes:'MAY', anio:'2026', titulo:'Control Displasia', diag:'Seguimiento cadera', meds:'Meloxicam 7.5mg · 1 comprimido/día.' },
    ],
  },
}

const HistorialModal = ({ pacienteId, onClose }) => {
  const p = PACIENTES[pacienteId]
  if (!p) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,18,28,.55)',
        zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', overflowY: 'auto', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#f4f6f8', width: '100%', maxWidth: '1160px',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: 600 }}>Consultorio PetVission</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '.88rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#b2e8e2', display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>👨‍⚕️</div>
              Dr. Veterinario
            </div>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: 'none', cursor: 'pointer', fontSize: '.9rem' }}>✕</button>
          </div>
        </div>

        {/* Patient bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a9e8f', display: 'grid', placeItems: 'center', fontSize: '1.3rem' }}>{p.av}</div>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>{p.nombre}</span>
        </div>

        {/* 3-col body */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', flex: 1 }}>

          {/* Col 1: Perfil */}
          <div style={{ background: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 20px', overflowY: 'auto' }}>
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px 16px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e6f7f5', display: 'grid', placeItems: 'center', fontSize: '2.2rem', margin: '0 auto 10px', border: '3px solid #b2e8e2' }}>{p.av}</div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{p.nombre}</div>
              <div style={{ fontSize: '.8rem', color: '#4a5568', marginTop: '4px' }}>{p.meta}</div>
            </div>

            <span style={{ fontSize: '.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px', marginBottom: '4px' }}>Últimos Signos Vitales</span>
            {p.vitales.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 4px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>{v.icon}</span>
                <span style={{ fontSize: '.85rem', color: '#4a5568', flex: 1 }}>{v.name}</span>
                <span style={{ fontWeight: 800, fontSize: '.9rem' }}>{v.val}<span style={{ fontSize: '.75rem', color: '#94a3b8', marginLeft: '3px' }}>{v.unit}</span></span>
              </div>
            ))}

            <span style={{ fontSize: '.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px', marginBottom: '4px', marginTop: '20px' }}>Archivos</span>
            {p.archivos.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px' }}>
                <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#1a9e8f' }}>{a.name}</div>
                  <div style={{ fontSize: '.72rem', color: '#94a3b8' }}>{a.size} | {a.fecha}</div>
                </div>
                <button style={{ width: '28px', height: '28px', border: '1.5px solid #e2e8f0', borderRadius: '6px', background: 'none', cursor: 'pointer' }}>📥</button>
              </div>
            ))}
          </div>

          {/* Col 2: Antecedentes */}
          <div style={{ overflowY: 'auto', padding: '28px 32px', background: '#f4f6f8' }}>
            <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '24px 28px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '.88rem', color: '#1a9e8f', marginBottom: '18px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#1a9e8f', display: 'grid', placeItems: 'center', color: 'white', fontSize: '.75rem' }}>＋</div>
                Alergias
              </div>
              <div style={{ background: '#fdeaea', border: '1.5px solid #f5c6c6', borderRadius: '10px', padding: '14px 18px' }}>
                {p.alergias.medicamentos.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '.88rem', color: '#e05252', marginBottom: '10px' }}>⚠️ Alergias a Medicamentos:</div>
                    <ul style={{ listStyle: 'none', paddingLeft: '16px' }}>
                      {p.alergias.medicamentos.map((m, i) => <li key={i} style={{ fontSize: '.85rem', color: '#e05252', padding: '2px 0' }}>- {m}</li>)}
                    </ul>
                  </>
                )}
                {p.alergias.otras.length > 0 && (
                  <>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#e05252', marginTop: '10px', marginBottom: '4px' }}>Otras alergias:</div>
                    <ul style={{ listStyle: 'none', paddingLeft: '16px' }}>
                      {p.alergias.otras.map((o, i) => <li key={i} style={{ fontSize: '.85rem', color: '#e05252', padding: '2px 0' }}>- {o}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '24px 28px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '.88rem', color: '#1a9e8f', marginBottom: '18px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#1a9e8f', display: 'grid', placeItems: 'center', color: 'white', fontSize: '.75rem' }}>＋</div>
                Antecedentes Patológicos
              </div>
              {p.patologicos.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e2e8f0', fontSize: '.88rem' }}>
                  <span style={{ fontWeight: 700, color: '#1a2535' }}>{r.key}</span>
                  <span style={{ color: '#4a5568' }}>{r.tipo === 'positive' ? '✔ ' : '✖ '}{r.val}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '.88rem', color: '#1a9e8f', marginBottom: '18px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#1a9e8f', display: 'grid', placeItems: 'center', color: 'white', fontSize: '.75rem' }}>💉</div>
                Esquema de Vacunación
              </div>
              {p.vacunas.map((v, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '.88rem' }}>{v.name}</strong>
                    <span style={{ fontSize: '.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '50px', background: v.estado === 'vigente' ? '#dcfce7' : '#fef9c3', color: v.estado === 'vigente' ? '#16a34a' : '#a16207' }}>
                      {v.estado === 'vigente' ? 'Vigente' : 'Próxima a vencer'}
                    </span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '4px' }}>Aplicada: {v.fecha} · Próxima: {v.prox}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Consultas */}
          <div style={{ background: '#fff', borderLeft: '1px solid #e2e8f0', overflowY: 'auto', padding: '24px 20px' }}>
            <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Consultas Agendadas</div>
            <p style={{ fontSize: '.82rem', color: '#4a5568', lineHeight: 1.5, marginBottom: '20px' }}>Aún no hay reservas agendadas.</p>

            <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Consultas Iniciadas</div>
            {p.consultas.map((c, i) => (
              <div key={i} style={{ display: 'flex', borderLeft: '3px solid #1a9e8f', background: '#fff', marginBottom: '14px', borderRadius: '0 10px 10px 0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                <div style={{ minWidth: '62px', background: '#f4f6f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1a9e8f', lineHeight: 1 }}>{c.dia}</span>
                  <span style={{ fontSize: '.65rem', fontWeight: 800, color: '#0e8f80', textTransform: 'uppercase' }}>{c.mes}</span>
                  <span style={{ fontSize: '.65rem', color: '#94a3b8', marginTop: '2px' }}>{c.anio}</span>
                </div>
                <div style={{ padding: '12px 14px', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.92rem', color: '#1a2535', marginBottom: '4px' }}>{c.titulo}</div>
                  <div style={{ fontSize: '.78rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '6px' }}>{c.diag}</div>
                  <div style={{ fontSize: '.75rem', color: '#4a5568' }}>{c.meds}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistorialModal