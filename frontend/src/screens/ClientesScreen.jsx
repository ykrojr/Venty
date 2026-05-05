import { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, MapPin, X, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '', cpf: '', telefone: '', email: '', endereco: ''
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', cpf: '', telefone: '', email: '', endereco: '' });
    setEditandoId(null);
    setIsModalOpen(false);
  };

  const abrirModalEditar = (cliente) => {
    setFormData(cliente);
    setEditandoId(cliente.id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Salvando cliente...');
    
    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, formData);
        toast.success('Cliente atualizado com sucesso!', { id: loadingToast });
      } else {
        await api.post('/clientes', formData);
        toast.success('Cliente cadastrado com sucesso!', { id: loadingToast });
      }
      resetForm();
      carregarClientes();
    } catch (err) {
      toast.dismiss(loadingToast);
      // erro tratado no interceptor global
    }
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      const loadingToast = toast.loading('Excluindo...');
      try {
        await api.delete(`/clientes/${id}`);
        toast.success('Cliente excluído', { id: loadingToast });
        carregarClientes();
      } catch (err) {
        toast.dismiss(loadingToast);
      }
    }
  };

  return (
    <Layout>
      <div className="topbar">
        <div className="welcome">
          <h1>Gestão de Clientes</h1>
          <p>Cadastre e gerencie a ficha dos seus locatários.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <Plus size={20}/> Novo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="glass-panel" style={{textAlign: 'center', padding: '4rem', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          <Users size={60} style={{marginBottom: 20, opacity: 0.5}}/>
          <h2>Nenhum cliente cadastrado</h2>
          <p>Você ainda não tem clientes salvos na sua base.</p>
          <button className="btn-primary" style={{marginTop: 20, width: 'auto', padding: '0.8rem 2rem'}} onClick={() => setIsModalOpen(true)}>Adicionar o Primeiro</button>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {clientes.map(cli => (
            <div key={cli.id} className="glass-panel" style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3 style={{fontSize: '1.3rem', marginBottom: 5}}>{cli.nome} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>• CPF: {cli.cpf}</span></h3>
                <div style={{display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 10}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: 5}}><Phone size={14}/> {cli.telefone || '-'}</span>
                  <span style={{display: 'flex', alignItems: 'center', gap: 5}}><Mail size={14}/> {cli.email || '-'}</span>
                  <span style={{display: 'flex', alignItems: 'center', gap: 5}}><MapPin size={14}/> {cli.endereco || '-'}</span>
                </div>
              </div>
              
              <div style={{display: 'flex', gap: 10}}>
                <button 
                  onClick={() => abrirModalEditar(cli)} 
                  style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: 10, cursor: 'pointer', transition: '0.3s'}}
                >
                  <Edit2 size={18}/>
                </button>
                <button 
                  onClick={() => handleExcluir(cli.id, cli.nome)} 
                  style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '10px', borderRadius: 10, cursor: 'pointer', transition: '0.3s'}}
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cliente */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={resetForm}><X size={24}/></button>
            <h2>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: 20}}>Preencha os dados de contato do locatário.</p>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="input-group full-w">
                  <input type="text" placeholder="Nome Completo *" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required/>
                </div>
                <div className="input-group">
                  <input type="text" placeholder="CPF" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>
                <div className="input-group">
                  <input type="text" placeholder="Celular / WhatsApp" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
                <div className="input-group full-w">
                  <input type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="input-group full-w">
                  <input type="text" placeholder="Endereço Completo" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{marginTop: 10}}>
                {editandoId ? 'Atualizar Dados' : 'Cadastrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
