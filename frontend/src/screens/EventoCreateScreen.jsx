import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, Save, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function EventoCreateScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [clientes, setClientes] = useState([]);
  
  // Pega a data selecionada no calendário, se existir
  const preSelectedDate = location.state?.selectedDate || '';

  const [formData, setFormData] = useState({
    nome: '', 
    clienteId: '', 
    data: preSelectedDate, 
    hora: '', 
    local: '',
    precoBase: '',
    pacote: '',
    detalhes: ''
  });

  useEffect(() => {
    // Carregar clientes para o dropdown
    api.get('/clientes')
       .then(res => setClientes(res.data))
       .catch(err => console.error("Erro ao puxar clientes", err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.clienteId) {
      toast.error('Você precisa selecionar ou cadastrar um cliente primeiro.');
      return;
    }

    const loadingToast = toast.loading('Criando evento...');
    try {
      const { data } = await api.post('/eventos', formData);
      toast.success('Evento criado sucesso!', { id: loadingToast });
      navigate(`/evento/${data.id}`); // Vai direto pros detalhes (insumos) do evento recém criado
    } catch (err) {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Layout>
      <div className="topbar">
        <div className="welcome">
          <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'var(--primary-glow)', cursor:'pointer', display:'flex', gap:10, marginBottom: 10, fontSize: '1rem'}}>
            <ArrowLeft/> Voltar
          </button>
          <h1>Novo Evento</h1>
          <p>Associe o evento a um cliente e defina o valor do contrato.</p>
        </div>
      </div>

      <div className="glass-panel" style={{padding: '2.5rem', maxWidth: '800px'}}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            
            <div className="input-group full-w">
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Nome ou Tema do Evento *</label>
              <input type="text" placeholder="Ex: Casamento da Ana" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required/>
            </div>

            <div className="input-group full-w" style={{position: 'relative'}}>
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Cliente (Contratante) *</label>
              {clientes.length === 0 ? (
                 <div style={{padding: 15, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 10, fontSize: '0.9rem'}}>
                    Nenhum cliente cadastrado. Você precisa cadastrar um cliente na aba "Clientes" antes de marcar um evento.
                 </div>
              ) : (
                <select 
                  style={{width: '100%', padding: '1rem 1.2rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem'}}
                  value={formData.clienteId} 
                  onChange={e => setFormData({...formData, clienteId: e.target.value})}
                  required
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {clientes.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.nome} (CPF: {cli.cpf || 'Sem CPF'})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group">
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Data *</label>
              <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required/>
            </div>
            <div className="input-group">
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Hora de Início *</label>
              <input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required/>
            </div>

            <div className="input-group full-w">
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Local do Evento</label>
              <input type="text" placeholder="Ex: Salão de Festas Villa Rosa" value={formData.local} onChange={e => setFormData({...formData, local: e.target.value})} />
            </div>

            <div className="input-group">
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Qual o Pacote/Combo?</label>
              <input type="text" placeholder="Ex: 50 Pessoas Premium" value={formData.pacote} onChange={e => setFormData({...formData, pacote: e.target.value})} />
            </div>

            <div className="input-group">
              <label style={{color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontSize: '0.9rem'}}>Receita (Preço Cobrado) *</label>
              <input type="number" step="0.01" placeholder="R$" value={formData.precoBase} onChange={e => setFormData({...formData, precoBase: e.target.value})} required/>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{marginTop: 30, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center'}} disabled={clientes.length === 0}>
            <Save size={20}/> Salvar e Adicionar Insumos
          </button>
        </form>
      </div>
    </Layout>
  );
}
