import { useState, useEffect } from 'react';
import { ArrowLeft, PackageOpen, Plus, Trash2, FileText, ChevronRight, X, Coins, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function InventarioScreen() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ 
    nome: '', 
    itens: [{ nome: '', subprodutos: [] }] 
  });

  useEffect(() => {
    carregarTemplates();
  }, []);

  const carregarTemplates = async () => {
    try {
      const { data } = await api.get('/templates-cardapio');
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    setNewTemplate({
      ...newTemplate,
      itens: [...newTemplate.itens, { nome: '', subprodutos: [] }]
    });
  };

  const handleRemoveItem = (idx) => {
    const list = [...newTemplate.itens];
    list.splice(idx, 1);
    setNewTemplate({ ...newTemplate, itens: list });
  };

  const handleItemNameChange = (idx, name) => {
    const list = [...newTemplate.itens];
    list[idx].nome = name;
    setNewTemplate({ ...newTemplate, itens: list });
  };

  const handleAddSub = (itemIdx) => {
    const list = [...newTemplate.itens];
    list[itemIdx].subprodutos.push({ nome: '', precoUnitario: 0, quantidade: 1, ehFuncionario: false });
    setNewTemplate({ ...newTemplate, itens: list });
  };

  const handleSubChange = (itemIdx, subIdx, field, value) => {
    const list = [...newTemplate.itens];
    list[itemIdx].subprodutos[subIdx][field] = value;
    setNewTemplate({ ...newTemplate, itens: list });
  };

  const handleRemoveSub = (itemIdx, subIdx) => {
    const list = [...newTemplate.itens];
    list[itemIdx].subprodutos.splice(subIdx, 1);
    setNewTemplate({ ...newTemplate, itens: list });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Criando template...');
    try {
      await api.post('/templates-cardapio', newTemplate);
      toast.success('Template criado!', { id: loading });
      setIsModalOpen(false);
      setNewTemplate({ nome: '', itens: [{ nome: '', subprodutos: [] }] });
      carregarTemplates();
    } catch (err) {
      toast.error('Erro ao criar template', { id: loading });
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Excluir este template permanentemente?')) {
      try {
        await api.delete(`/templates-cardapio/${id}`);
        toast.success('Template removido');
        carregarTemplates();
      } catch (err) {
        toast.error('Erro ao excluir');
      }
    }
  };

  return (
    <Layout>
      <div className="topbar">
        <div className="welcome">
          <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'var(--primary-glow)', cursor:'pointer', display:'flex', gap:10, marginBottom: 10, fontSize: '1rem'}}>
            <ArrowLeft/> Voltar
          </button>
          <h1>Banco de Cardápios & Kits</h1>
          <p>Crie modelos completos com insumos e equipe para reutilizar.</p>
        </div>
        <button className="btn-primary" style={{width: 'auto', display: 'flex', gap: 8, alignItems: 'center'}} onClick={() => setIsModalOpen(true)}>
          <Plus size={20}/> Novo Template
        </button>
      </div>

      <div className="events-grid">
        {templates.length === 0 ? (
          <div className="glass-panel" style={{padding: '4rem', textAlign: 'center', gridColumn: '1 / -1'}}>
             <PackageOpen size={60} style={{opacity: 0.3, marginBottom: 20}}/>
             <h2>Nenhum template cadastrado</h2>
             <p style={{color: 'var(--text-muted)'}}>Crie modelos padrão como "Buffet de Hambúrguer" ou "Festa Infantil" para agilizar seus novos eventos.</p>
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="glass-panel event-card" style={{cursor: 'default', height: 'auto', display: 'flex', flexDirection: 'column'}}>
              <div className="event-header">
                <FileText size={24} color="var(--primary-glow)"/>
                <button onClick={() => handleExcluir(t.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}><Trash2 size={18}/></button>
              </div>
              <h3 className="event-title">{t.nome}</h3>
              <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10}}>
                 <p><strong>{t.itens?.length || 0} Itens Inclusos:</strong></p>
                 <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {t.itens?.map(i => (
                        <span key={i.id} style={{background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--glass-border)'}}>
                            {i.nome} ({i.subprodutos?.length || 0})
                        </span>
                    ))}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                <h2 style={{margin: 0}}>Novo Template Completo</h2>
                <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}><X size={24}/></button>
             </div>
             
             <form onSubmit={handleCreate}>
               <div className="input-group" style={{marginBottom: 25}}>
                 <label style={{display: 'block', marginBottom: 8, color: 'var(--text-muted)'}}>Nome do Template</label>
                 <input type="text" placeholder="ex: Casamento Premium" value={newTemplate.nome} onChange={e => setNewTemplate({...newTemplate, nome: e.target.value})} required/>
               </div>

               <div style={{marginBottom: 20}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                    <h3 style={{fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8}}><Package size={18} color="var(--primary-glow)"/> Itens do Cardápio</h3>
                    <button type="button" onClick={handleAddItem} className="btn-primary" style={{width: 'auto', padding: '6px 15px', fontSize: '0.85rem'}}>
                        <Plus size={16}/> Adicionar Item
                    </button>
                 </div>

                 <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                    {newTemplate.itens.map((item, itemIdx) => (
                        <div key={itemIdx} className="glass-panel" style={{padding: 20, background: 'rgba(255,255,255,0.02)'}}>
                            <div style={{display: 'flex', gap: 10, marginBottom: 15}}>
                                <input 
                                    type="text" 
                                    placeholder="Nome do Item (ex: Mesa de Doces)" 
                                    value={item.nome} 
                                    onChange={e => handleItemNameChange(itemIdx, e.target.value)} 
                                    required
                                    style={{flex: 1}}
                                />
                                <button type="button" onClick={() => handleRemoveItem(itemIdx)} style={{background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0 15px', borderRadius: 10, cursor: 'pointer'}}>
                                    <Trash2 size={18}/>
                                </button>
                            </div>

                            <div style={{paddingLeft: 20, borderLeft: '2px solid var(--glass-border)'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                                    <h4 style={{fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0}}>Insumos e Equipe</h4>
                                    <button type="button" onClick={() => handleAddSub(itemIdx)} style={{background: 'none', border: 'none', color: 'var(--primary-glow)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4}}>
                                        <Plus size={14}/> Add Insumo
                                    </button>
                                </div>

                                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                                    {item.subprodutos.map((sub, subIdx) => (
                                        <div key={subIdx} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                                            <div style={{display: 'flex', gap: 4}}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSubChange(itemIdx, subIdx, 'ehFuncionario', false)}
                                                    style={{
                                                        background: !sub.ehFuncionario ? 'var(--primary-solid)' : 'rgba(255,255,255,0.05)',
                                                        color: !sub.ehFuncionario ? 'white' : 'var(--text-muted)',
                                                        border: 'none', padding: '5px', borderRadius: 6, cursor: 'pointer'
                                                    }}
                                                    title="Material"
                                                >
                                                    <Package size={14}/>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { handleSubChange(itemIdx, subIdx, 'ehFuncionario', true); handleSubChange(itemIdx, subIdx, 'quantidade', 1); }}
                                                    style={{
                                                        background: sub.ehFuncionario ? 'var(--primary-solid)' : 'rgba(255,255,255,0.05)',
                                                        color: sub.ehFuncionario ? 'white' : 'var(--text-muted)',
                                                        border: 'none', padding: '5px', borderRadius: 6, cursor: 'pointer'
                                                    }}
                                                    title="Funcionário"
                                                >
                                                    <Users size={14}/>
                                                </button>
                                            </div>
                                            <input type="text" placeholder="Nome" value={sub.nome} onChange={e => handleSubChange(itemIdx, subIdx, 'nome', e.target.value)} required style={{flex: 2, fontSize: '0.85rem', padding: '6px 10px'}}/>
                                            {!sub.ehFuncionario && (
                                                <input type="number" placeholder="Qtd" value={sub.quantidade} onChange={e => handleSubChange(itemIdx, subIdx, 'quantidade', parseInt(e.target.value))} required style={{width: 65, fontSize: '0.85rem', padding: '6px 10px'}}/>
                                            )}
                                            <input type="number" placeholder="R$" value={sub.precoUnitario} onChange={e => handleSubChange(itemIdx, subIdx, 'precoUnitario', parseFloat(e.target.value))} required style={{width: 90, fontSize: '0.85rem', padding: '6px 10px'}}/>
                                            <button type="button" onClick={() => handleRemoveSub(itemIdx, subIdx)} style={{background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer'}}>
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
               </div>

               <div style={{display: 'flex', gap: 15, marginTop: 30}}>
                 <button type="button" className="btn-primary" style={{background: 'rgba(255,255,255,0.05)', color: 'white', flex: 1}} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                 <button type="submit" className="btn-primary" style={{flex: 2}}>Salvar Template Profissional</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
