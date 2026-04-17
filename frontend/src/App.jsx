import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { CalendarDays, Plus, Calendar, Clock, MapPin, X, LogOut, Package, DollarSign, ChevronRight } from 'lucide-react'
import EventoDetalheScreen from './EventoDetalheScreen'
import InventarioScreen from './InventarioScreen'

// ==========================================
// TELA DE LOGIN / REGISTRO
// ==========================================
function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false)
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [nomeAdmin, setNomeAdmin] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [errorStatus, setErrorStatus] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorStatus('Carregando sistema matriz...')
    
    try {
      let baseUrl = '/api/auth/login'
      let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      }

      if (isRegister) {
        baseUrl = `/api/auth/register?nomeEmpresa=${encodeURIComponent(nomeEmpresa)}&nomeAdmin=${encodeURIComponent(nomeAdmin)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
        requestOptions = { method: 'POST' }
      }

      const response = await fetch(baseUrl, requestOptions)
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('@Venty:token', data.token)
        localStorage.setItem('@Venty:user', JSON.stringify(data.usuario))
        navigate('/dashboard')
      } else {
        setErrorStatus(data.erro || 'Falha na comunicação.')
      }
    } catch(err) {
      setErrorStatus('O servidor Backend pode estar desligado.')
    }
  }

  return (
    <div className="auth-container">
      <div className="glass-panel auth-box">
        <div className="auth-header">
          <div className="logo-icon"><CalendarDays size={40} /></div>
          <h2>Venty</h2>
          <p>{isRegister ? 'Crie seu espaço de trabalho gratuito' : 'O futuro da gestão dos seus eventos'}</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="input-group">
                <input type="text" placeholder="Nome da Sua Empresa" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} required/>
              </div>
              <div className="input-group">
                <input type="text" placeholder="Seu Nome Completo" value={nomeAdmin} onChange={e => setNomeAdmin(e.target.value)} required/>
              </div>
            </>
          )}
          <div className="input-group">
            <input type="email" placeholder="Seu email corporativo" value={email} onChange={e => setEmail(e.target.value)} required/>
          </div>
          <div className="input-group">
            <input type="password" placeholder="Sua senha secreta" value={senha} onChange={e => setSenha(e.target.value)} required/>
          </div>
          {errorStatus && <p style={{color: '#818cf8', fontSize: '0.9rem', textAlign: 'center'}}>{errorStatus}</p>}
          <button className="btn-primary" type="submit">{isRegister ? 'Criar Empresa' : 'Entrar no Painel'}</button>
          <button type="button" onClick={() => setIsRegister(!isRegister)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: 10}}>
            {isRegister ? 'Já tenho uma conta. Fazer Login.' : 'Ainda não sou cliente. Criar Empresa.'}
          </button>
        </form>
      </div>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
    </div>
  )
}

// ==========================================
// TELA DO DASHBOARD PRINCIPAL
// ==========================================
function DashboardScreen() {
  const [eventos, setEventos] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('@Venty:token')
    const userStr = localStorage.getItem('@Venty:user')
    if (!token) { navigate('/login'); return }
    setUsuario(JSON.parse(userStr))
    carregarEventos(token)
  }, [navigate])

  const carregarEventos = async (token) => {
    try {
      const resp = await fetch('/api/v1/eventos', { headers: { 'Authorization': `Bearer ${token}` }})
      if (resp.ok) setEventos(await resp.json())
      else if (resp.status === 403) navigate('/login')
    } catch(err) { console.error(err) }
  }

  const handleLogout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <CalendarDays color="var(--primary-glow)"/> <strong>Venty</strong>
        </div>
        <nav className="nav-links">
          <div className="nav-item active"><Calendar size={20}/> Eventos</div>
          <div className="nav-item" onClick={handleLogout}><LogOut size={20}/> Sair</div>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="main-content">
        <div className="bg-glow"></div>
        <div className="topbar">
          <div className="welcome">
            <h1>Olá, {usuario?.nome} 👋</h1>
            <p>Empresa: {usuario?.tenantNome}</p>
          </div>
          <button className="btn-primary" style={{width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center'}} onClick={() => setIsModalOpen(true)}>
            <Plus size={20}/> Novo Evento
          </button>
        </div>

        {eventos.length === 0 ? (
          <div style={{textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)'}}>
            <Calendar size={60} style={{marginBottom: 20, opacity: 0.5}}/>
            <h2>Nenhum evento criado</h2>
            <p>A agenda da sua empresa está vazia. Crie seu primeiro evento!</p>
          </div>
        ) : (
          <div className="events-grid">
            {eventos.map(ev => (
              <div key={ev.id} className="glass-panel event-card" onClick={() => navigate(`/evento/${ev.id}`)}>
                <div className="event-header">
                  <span className={`event-status ${ev.concluido ? 'concluido' : ''}`}>
                    {ev.concluido ? 'Finalizado' : 'Programado'}
                  </span>
                  <ChevronRight size={18} color="var(--text-muted)"/>
                </div>
                <h3 className="event-title">{ev.nome}</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '0.5rem'}}>
                   <span className="event-info"><Calendar size={16}/> {ev.data} • {ev.hora}</span>
                   <span className="event-info"><MapPin size={16}/> {ev.endereco}</span>
                   
                   {/* Resumo financeiro no card */}
                   <div style={{background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: 8, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5}}>
                     <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                       <Package size={14}/> {ev.produtos?.length || 0} itens contratados
                     </span>
                     <span style={{fontSize: '0.9rem', color: ev.lucroEsperado > 0 ? 'var(--success)' : 'var(--text-muted)'}}>
                       <DollarSign size={14}/> <strong>Lucro: R$ {ev.lucroEsperado?.toFixed(2)}</strong>
                     </span>
                   </div>
                </div>
                <div className="event-footer">
                  <span className="event-price">Base R$ {ev.precoBase?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && <CreateEventModal onClose={() => setIsModalOpen(false)} onCreated={() => carregarEventos(localStorage.getItem('@Venty:token'))} />}
    </div>
  )
}

// ==========================================
// MODAL DE CRIAÇÃO DE EVENTO
// ==========================================
function CreateEventModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({nome: '', data: '', hora: '', endereco: '', precoBase: ''})
  
  const handleSave = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('@Venty:token')
    await fetch('/api/v1/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, concluido: false })
    })
    onCreated()
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <button className="modal-close" onClick={onClose}><X size={24}/></button>
        <h2>Adicionar Novo Evento</h2>
        <p style={{color: 'var(--text-muted)'}}>Preencha os dados base do contrato.</p>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="input-group full-w">
              <input type="text" placeholder="Nome / Tema do Evento" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required/>
            </div>
            <div className="input-group">
              <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required/>
            </div>
            <div className="input-group">
              <input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required/>
            </div>
            <div className="input-group full-w">
              <input type="text" placeholder="Endereço Completo" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
            </div>
            <div className="input-group full-w">
              <input type="number" step="0.01" placeholder="Valor Base Cobrado (R$)" value={formData.precoBase} onChange={e => setFormData({...formData, precoBase: e.target.value})} required/>
            </div>
          </div>
          <button type="submit" className="btn-primary">Criar Evento</button>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// PONTO DE ENTRADA PRINCIPAL
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/evento/:id" element={<EventoDetalheScreen />} />
        <Route path="/inventario" element={<InventarioScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
