import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Users, Coins, Trash2, Upload, CheckSquare, Square, FileText, DollarSign, MapPin, Calendar, Clock, Contact, X, ChevronRight, Edit2, Plus, Save } from 'lucide-react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function EventoDetalheScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [evento, setEvento] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [pdfGrupos, setPdfGrupos] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [newSub, setNewSub] = useState({ nome: '', precoUnitario: 0, quantidade: 1, ehFuncionario: false });

  useEffect(() => { 
    carregarDados(); 
    carregarTemplates();
  }, [id]);

  const carregarDados = async () => {
    try {
      const { data } = await api.get(`/eventos/${id}`);
      setEvento(data);
      setProdutos(data.produtos || []);
      setLocalValue(data.local || '');
    } catch (err) {
      toast.error('Não foi possível carregar o evento.');
    }
  };

  const carregarTemplates = async () => {
    try {
      const { data } = await api.get('/templates-cardapio');
      setAvailableTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLocal = async () => {
    try {
      await api.put(`/eventos/${id}`, {
        nome: evento.nome,
        clienteId: evento.clienteId,
        data: evento.data,
        hora: evento.hora,
        local: localValue,
        precoBase: evento.precoBase,
        pacote: evento.pacote,
        detalhes: evento.detalhes,
        status: evento.status,
        valorEntrada: evento.valorEntrada,
        desconto: evento.desconto,
      });
      toast.success('Local atualizado!');
      setIsEditingLocal(false);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao atualizar local.');
    }
  };

  const handleApplyTemplate = async (templateId) => {
    const loading = toast.loading('Aplicando template de cardápio...');
    try {
      await api.post(`/templates-cardapio/${templateId}/aplicar/${id}`);
      toast.success('Template aplicado com sucesso!', { id: loading });
      setShowTemplateModal(false);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao aplicar template.', { id: loading });
    }
  };

  const mudarStatus = async (novoStatus) => {
    const loadingToast = toast.loading('Mudando status...');
    try {
      await api.patch(`/eventos/${id}/status?status=${novoStatus}`);
      toast.success('Status alterado para ' + novoStatus, { id: loadingToast });
      carregarDados();
    } catch (err) {
      toast.dismiss(loadingToast);
    }
  };

  const handleRemover = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      const loading = toast.loading('Removendo...');
      try {
        await api.delete(`/eventos/${id}/produtos/${produtoId}`);
        toast.success('Produto removido', { id: loading });
        carregarDados();
      } catch (err) {
        toast.dismiss(loading);
      }
    }
  };

  const handleAddSubproduto = async (produto) => {
    if (!newSub.nome) return toast.error('Informe o nome do insumo.');
    const loading = toast.loading('Adicionando insumo...');
    try {
      const subsAtualizados = [...(produto.subprodutos || []), {
        nome: newSub.nome,
        precoUnitario: newSub.precoUnitario || 0,
        quantidade: newSub.ehFuncionario ? 1 : (newSub.quantidade || 1),
        ehFuncionario: newSub.ehFuncionario
      }];
      await api.put(`/eventos/${id}/produtos/${produto.id}`, {
        nome: produto.nome,
        subprodutos: subsAtualizados
      });
      toast.success('Insumo adicionado!', { id: loading });
      setAddingSubTo(null);
      setNewSub({ nome: '', precoUnitario: 0, quantidade: 1, ehFuncionario: false });
      carregarDados();
    } catch (err) {
      toast.error('Erro ao adicionar insumo.', { id: loading });
    }
  };

  const handleRemoverSubproduto = async (produto, subId) => {
    const loading = toast.loading('Removendo insumo...');
    try {
      const subsAtualizados = produto.subprodutos.filter(s => s.id !== subId);
      await api.put(`/eventos/${id}/produtos/${produto.id}`, {
        nome: produto.nome,
        subprodutos: subsAtualizados
      });
      toast.success('Insumo removido!', { id: loading });
      carregarDados();
    } catch (err) {
      toast.error('Erro ao remover insumo.', { id: loading });
    }
  };

  // ============== PARSER INTELIGENTE DE PDF ==============
  const PALAVRAS_TITULO = [
    'ESTA', 'MESA', 'KIT', 'BUFFET', 'SERVI', 'GOURMET', 'BAR ',
    'OPEN', 'CANTO', 'ESPA', 'ILHA', 'PONTO', 'CORNER', 'CREPE',
    'HAMBURGUER', 'HAMBÚRGUER', 'PIZZA', 'SUSHI', 'CHURRASCO',
    'DOCERIA', 'CONFEITARIA', 'BEBIDA', 'DRINK', 'CHOPP', 'COFFEE'
  ];

  const parece_titulo = (linha) => {
    const upper = linha.toUpperCase().trim();
    if (upper.length > 80) return false;
    if (PALAVRAS_TITULO.some(kw => upper.includes(kw))) return true;
    // Linha toda em maiúsculas e curta = provavelmente título
    const semNumeros = upper.replace(/[0-9.,R$%]/g, '').trim();
    if (semNumeros.length > 4 && semNumeros === semNumeros.toUpperCase() && semNumeros.length < 60) {
      const letras = (semNumeros.match(/[A-ZÀ-Ú]/g) || []).length;
      if (letras / semNumeros.replace(/\s/g, '').length > 0.7) return true;
    }
    return false;
  };

  const extrairPreco = (texto) => {
    // Busca por R$ seguido de número, ex: R$ 15,00 ou R$15.00
    const regexReais = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d{1,3}(?:,\d{3})*\.\d{2}|\d+,\d{2}|\d+\.\d{2})/i;
    const match = texto.match(regexReais);
    if (match) {
      const valorStr = match[1].replace(/\./g, '').replace(',', '.');
      const valor = parseFloat(valorStr);
      const textoLimpo = texto.replace(match[0], '').replace(/-\s*$/, '').trim();
      return { valor, textoLimpo };
    }
    return { valor: 0, textoLimpo: texto };
  };

  const agruparLinhas = (linhas) => {
    const grupos = [];
    let grupoAtual = null;

    for (const linha of linhas) {
      if (!linha || linha.trim().length < 4) continue;
      if (parece_titulo(linha)) {
        grupoAtual = { titulo: linha.trim(), itens: [], selecionado: true, expandido: true };
        grupos.push(grupoAtual);
      } else {
        if (!grupoAtual) {
          grupoAtual = { titulo: linha.trim(), itens: [], selecionado: true, expandido: false };
          grupos.push(grupoAtual);
        } else {
          const { valor, textoLimpo } = extrairPreco(linha.trim());
          grupoAtual.itens.push({ texto: textoLimpo, valor, textoOriginal: linha.trim(), selecionado: true });
        }
      }
    }
    return grupos;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(event) {
      const typedArray = new Uint8Array(event.target.result);
      try {
        const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const content = await page.getTextContent();
          
          const linesObj = {};
          content.items.forEach(item => {
             // Agrupa itens em linhas com margem de erro de ~5 pixels
             const y = Math.round(item.transform[5] / 5) * 5;
             if (!linesObj[y]) linesObj[y] = [];
             linesObj[y].push({ str: item.str, x: item.transform[4] });
          });
          
          // No PDF, o Y = 0 é na base inferior da página, então ordenamos decrescente
          const sortedY = Object.keys(linesObj).map(Number).sort((a, b) => b - a);
          
          let pageText = '';
          sortedY.forEach(y => {
            // Ordena os pedaços da linha pela posição X (da esquerda para a direita)
            linesObj[y].sort((a, b) => a.x - b.x);
            // Junta com espaço e tira espaços duplos
            const linhaString = linesObj[y].map(i => i.str.trim()).filter(s => s.length > 0).join(' ');
            if (linhaString.length > 0) {
              pageText += linhaString + '\n';
            }
          });
          
          fullText += pageText + '\n';
        }
        
        // Limpar múltiplas quebras de linha e espaços
        const linhas = fullText.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(l => l.length > 3);
        const grupos = agruparLinhas(linhas);
        setPdfGrupos(grupos);
        setExpandidos(Object.fromEntries(grupos.map((g, i) => [i, g.expandido])));
        setShowPdfModal(true);
      } catch(err) {
        toast.error('Erro ao ler o PDF: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const toggleGrupo = (gi) => {
    setPdfGrupos(prev => prev.map((g, i) => i === gi ? {...g, selecionado: !g.selecionado} : g));
  };
  const toggleItem = (gi, ii) => {
    setPdfGrupos(prev => prev.map((g, i) => i === gi
      ? {...g, itens: g.itens.map((it, j) => j === ii ? {...it, selecionado: !it.selecionado} : it)}
      : g
    ));
  };
  const toggleExpandido = (gi) => {
    setExpandidos(prev => ({...prev, [gi]: !prev[gi]}));
  };
  const selecionarTodos = (val) => {
    setPdfGrupos(prev => prev.map(g => ({...g, selecionado: val, itens: g.itens.map(it => ({...it, selecionado: val}))})));
  };

  const handleSalvarGrupos = async () => {
    const gruposSelecionados = pdfGrupos.filter(g => g.selecionado);
    if (gruposSelecionados.length === 0) return toast.error('Selecione ao menos uma estação.');
    const loading = toast.loading('Importando estações do cardápio...');
    try {
      await Promise.all(gruposSelecionados.map(g =>
        api.post(`/eventos/${id}/produtos`, {
          nome: g.titulo,
          subprodutos: g.itens.filter(it => it.selecionado).map(it => ({
            nome: it.texto,
            precoUnitario: it.valor,
            quantidade: 1,
            ehFuncionario: false
          }))
        })
      ));
      toast.success(`${gruposSelecionados.length} estações importadas!`, { id: loading });
      setShowPdfModal(false);
      setPdfGrupos([]);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao importar.', { id: loading });
    }
  };

  if (!evento) return <Layout><div style={{padding: '3rem', color: 'var(--text-muted)'}}>Carregando evento...</div></Layout>;

  const custoTotal = produtos.reduce((sum, p) => sum + (p.custoTotal || 0), 0);
  const precoBase = evento.precoBase || 0;
  const lucro = precoBase - custoTotal;

  return (
    <Layout>
      <div className="topbar">
        <div className="welcome">
          <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'var(--primary-glow)', cursor:'pointer', display:'flex', gap:10, marginBottom: 10, fontSize: '1rem'}}>
            <ArrowLeft/> Voltar
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
            <h1>{evento.nome}</h1>
            <select 
              value={evento.status} 
              onChange={e => mudarStatus(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)',
                padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem'
              }}
            >
              <option value="PLANEJAMENTO">Em Planejamento</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 20, color: 'var(--text-muted)', marginTop: 8}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 6}}><Calendar size={16}/> {evento.data} • <Clock size={16}/> {evento.hora}</span>
            <span style={{display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-glow)'}}><Contact size={16}/> Cliente: {evento.clienteNome || 'Desconhecido'}</span>
            
            {isEditingLocal ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
                    <MapPin size={16}/>
                    <input 
                        value={localValue} 
                        onChange={e => setLocalValue(e.target.value)}
                        placeholder="Local do evento"
                        style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary-glow)', color: 'white', padding: '2px 8px', borderRadius: 5, fontSize: '0.85rem'}}
                    />
                    <button onClick={handleUpdateLocal} style={{background: 'var(--primary-glow)', border: 'none', color: 'black', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.75rem'}}>OK</button>
                    <button onClick={() => setIsEditingLocal(false)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem'}}>X</button>
                </div>
            ) : (
                <span onClick={() => setIsEditingLocal(true)} style={{display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'}}>
                    <MapPin size={16}/> {evento.local || 'Definir Local'} <Edit2 size={12} style={{opacity: 0.5}}/>
                </span>
            )}
          </div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20}}>
        <div className="glass-panel" style={{padding: '20px 30px', display: 'flex', gap: 30, width: '100%'}}>
          <div style={{textAlign: 'center', flex: 1}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Receita Prevista</p>
            <p style={{fontSize: '1.8rem', fontWeight: 700, color: 'white'}}>R$ {precoBase.toFixed(2)}</p>
          </div>
          <div style={{width: 1, background: 'var(--glass-border)'}}></div>
          <div style={{textAlign: 'center', flex: 1}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Custos Calculados</p>
            <p style={{fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning)'}}>R$ {custoTotal.toFixed(2)}</p>
          </div>
          <div style={{width: 1, background: 'var(--glass-border)'}}></div>
          <div style={{textAlign: 'center', flex: 1}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Lucro Líquido Real</p>
            <p style={{fontSize: '1.8rem', fontWeight: 700, color: lucro > 0 ? 'var(--success)' : '#ef4444'}}>R$ {lucro.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style={{display: 'flex', gap: 15, marginTop: 30, marginBottom: 30}}>
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} />
        <button className="btn-primary" style={{width: 'auto', display: 'flex', gap: 8, alignItems: 'center'}} onClick={() => fileInputRef.current.click()}>
          <Upload size={18}/> Importar Cardápio (PDF)
        </button>
        <button className="btn-primary" style={{width: 'auto', display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', color: 'white'}} onClick={() => setShowTemplateModal(true)}>
          <FileText size={18}/> Usar Meu Template
        </button>
      </div>

      <h2 style={{marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10}}><Package size={22}/> O que você precisa entregar no evento?</h2>
      {produtos.length === 0 ? (
        <div className="glass-panel" style={{padding: 40, textAlign: 'center', color: 'var(--text-muted)'}}>
          <FileText size={50} style={{marginBottom: 15, opacity: 0.4}}/>
          <p>Nenhum item cadastrado.</p>
          <p style={{fontSize: '0.9rem', marginTop: 10}}>Use o botão acima para importar ou usar um template profissional.</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
          {produtos.map(p => (
            <div key={p.id} className="glass-panel" style={{padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)'}}>
              <div style={{padding: '18px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)'}}>
                <div>
                    <strong style={{fontSize: '1.1rem'}}>{p.nome}</strong>
                    <div style={{display: 'flex', gap: 20, marginTop: 10, color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                    <span><Package size={14}/> Mat.: R$ {(p.custoMateriais || 0).toFixed(2)}</span>
                    <span><Users size={14}/> Eqp.: R$ {(p.custoFuncionarios || 0).toFixed(2)}</span>
                    <span style={{color: 'var(--warning)', fontWeight: 'bold'}}><Coins size={14}/> Custo Total: R$ {(p.custoTotal || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div style={{display: 'flex', gap: 8}}>
                    <button
                        onClick={() => { setAddingSubTo(addingSubTo === p.id ? null : p.id); setNewSub({ nome: '', precoUnitario: 0, quantidade: 1, ehFuncionario: false }); }}
                        style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: 'var(--primary-glow)', padding: '10px', borderRadius: 10, cursor: 'pointer' }}
                        title="Adicionar insumo"
                    >
                        <Plus size={18}/>
                    </button>
                    <button
                        onClick={() => handleRemover(p.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '10px', borderRadius: 10, cursor: 'pointer' }}
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
              </div>

              {/* FORMULÁRIO INLINE DE ADICIONAR INSUMO */}
              {addingSubTo === p.id && (
                <div style={{padding: '15px 25px', background: 'rgba(99,102,241,0.05)', borderTop: '1px solid var(--glass-border)'}}>
                  <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10}}>
                    <button
                      type="button"
                      onClick={() => setNewSub({...newSub, ehFuncionario: false})}
                      style={{
                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5,
                        background: !newSub.ehFuncionario ? 'var(--primary-solid)' : 'rgba(255,255,255,0.05)',
                        color: !newSub.ehFuncionario ? 'white' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      <Package size={14}/> Material
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSub({...newSub, ehFuncionario: true, quantidade: 1})}
                      style={{
                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5,
                        background: newSub.ehFuncionario ? 'var(--primary-solid)' : 'rgba(255,255,255,0.05)',
                        color: newSub.ehFuncionario ? 'white' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      <Users size={14}/> Funcionário
                    </button>
                  </div>
                  <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                    <input type="text" placeholder="Nome do insumo" value={newSub.nome} onChange={e => setNewSub({...newSub, nome: e.target.value})} style={{flex: 2, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'white', fontSize: '0.85rem'}}/>
                    {!newSub.ehFuncionario && (
                      <input type="number" placeholder="Qtd" min="1" value={newSub.quantidade} onChange={e => setNewSub({...newSub, quantidade: parseInt(e.target.value) || 1})} style={{width: 70, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'white', fontSize: '0.85rem'}}/>
                    )}
                    <input type="number" placeholder="R$ Valor" step="0.01" value={newSub.precoUnitario} onChange={e => setNewSub({...newSub, precoUnitario: parseFloat(e.target.value) || 0})} style={{width: 110, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'white', fontSize: '0.85rem'}}/>
                    <button onClick={() => handleAddSubproduto(p)} style={{background: 'var(--primary-solid)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem'}}>
                      <Save size={14}/> Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* LISTA DE SUBPRODUTOS */}
              {p.subprodutos?.length > 0 && (
                <div style={{padding: '10px 25px 20px 25px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--glass-border)'}}>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Insumos Alocados</p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        {p.subprodutos.map(s => (
                            <div key={s.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    {s.ehFuncionario ? <Users size={14} color="var(--primary-glow)"/> : <Package size={14} color="var(--text-muted)"/>}
                                    <span>{s.ehFuncionario ? s.nome : `${s.quantidade}x ${s.nome}`}</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                    <span style={{color: s.ehFuncionario ? 'var(--primary-glow)' : 'var(--text-muted)'}}>
                                        R$ {(s.precoUnitario * s.quantidade).toFixed(2)}
                                    </span>
                                    <button onClick={() => handleRemoverSubproduto(p, s.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, padding: 2}}>
                                        <X size={14}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ==================== MODAL INTELIGENTE DE PDF ==================== */}
      {showPdfModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{width: '90%', maxWidth: 750, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '2rem', position: 'relative', animation: 'slideUp 0.4s'}}>
            <button className="modal-close" onClick={() => setShowPdfModal(false)}><X size={24}/></button>

            <div style={{marginBottom: 16}}>
              <h2 style={{marginBottom: 4}}>🧠 Importação Inteligente de Cardápio</h2>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                O sistema identificou <strong style={{color: 'var(--primary-glow)'}}>{pdfGrupos.length} estações/seções</strong> no PDF.
                Cada estação vira um <strong>Produto</strong> e seus itens viram <strong>Subprodutos</strong> para edição de custos depois.
              </p>
            </div>

            {/* Barra de ações rápidas */}
            <div style={{display: 'flex', gap: 8, marginBottom: 14}}>
              <button onClick={() => selecionarTodos(true)} style={{background: 'rgba(99,102,241,0.15)', border: '1px solid var(--primary-glow)', color: 'var(--primary-glow)', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem'}}>
                ✅ Selecionar Tudo
              </button>
              <button onClick={() => selecionarTodos(false)} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem'}}>
                ☐ Desmarcar Tudo
              </button>
              <span style={{marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center'}}>
                {pdfGrupos.filter(g => g.selecionado).length} de {pdfGrupos.length} estações selecionadas
              </span>
            </div>

            {/* Lista de grupos/estações */}
            <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6}}>
              {pdfGrupos.map((grupo, gi) => (
                <div key={gi} style={{
                  border: `1px solid ${grupo.selecionado ? 'var(--primary-glow)' : 'var(--glass-border)'}`,
                  borderRadius: 12, overflow: 'hidden',
                  background: grupo.selecionado ? 'rgba(99,102,241,0.06)' : 'rgba(0,0,0,0.2)',
                  transition: '0.2s'
                }}>
                  {/* Cabeçalho do grupo */}
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer'}}
                    onClick={() => toggleGrupo(gi)}>
                    {grupo.selecionado
                      ? <CheckSquare size={18} color="var(--primary-glow)"/>
                      : <Square size={18} color="#555"/>}
                    <span style={{flex: 1, fontWeight: 600, fontSize: '0.95rem', color: grupo.selecionado ? 'white' : 'var(--text-muted)'}}>{grupo.titulo}</span>
                    {grupo.itens.length > 0 && (
                      <button onClick={e => { e.stopPropagation(); toggleExpandido(gi); }}
                        style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center'}}>
                        <span style={{fontSize: '0.75rem', marginRight: 4}}>{grupo.itens.length} itens</span>
                        <ChevronRight size={14} style={{transform: expandidos[gi] ? 'rotate(90deg)' : 'none', transition: '0.2s'}}/>
                      </button>
                    )}
                  </div>

                  {/* Itens do grupo (expansível) */}
                  {expandidos[gi] && grupo.itens.length > 0 && (
                    <div style={{borderTop: '1px solid var(--glass-border)', padding: '8px 14px 12px 40px', display: 'flex', flexDirection: 'column', gap: 5}}>
                      {grupo.itens.map((item, ii) => (
                        <div key={ii}
                          onClick={() => toggleItem(gi, ii)}
                          style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
                            background: item.selecionado ? 'rgba(99,102,241,0.1)' : 'transparent'}}>
                          {item.selecionado
                            ? <CheckSquare size={14} color="var(--primary-glow)"/>
                            : <Square size={14} color="#555"/>}
                          <span style={{flex: 1, fontSize: '0.85rem', color: item.selecionado ? 'var(--text-main)' : 'var(--text-muted)'}}>{item.texto}</span>
                          {item.valor > 0 && (
                            <span style={{fontSize: '0.8rem', color: 'var(--primary-glow)', fontWeight: 600}}>
                              R$ {item.valor.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={handleSalvarGrupos} style={{marginTop: 16}}>
              🚀 Importar {pdfGrupos.filter(g => g.selecionado).length} Estações para o Evento
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE SELEÇÃO DE TEMPLATE ==================== */}
      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
            <button className="modal-close" onClick={() => setShowTemplateModal(false)}><X size={24}/></button>
            <h2 style={{marginBottom: 10}}>📋 Meus Modelos</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: 20}}>Selecione um cardápio pronto para este evento.</p>
            
            <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 10}}>
              {availableTemplates.length === 0 ? (
                <p style={{textAlign: 'center', padding: 20, color: 'var(--text-muted)'}}>Nenhum template cadastrado no Inventário.</p>
              ) : (
                availableTemplates.map(t => (
                  <div key={t.id} 
                    className="glass-panel" 
                    onClick={() => handleApplyTemplate(t.id)}
                    style={{padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s'}}
                  >
                    <div>
                      <strong style={{color: 'var(--primary-glow)'}}>{t.nome}</strong>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{t.itens?.length || 0} itens</p>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)"/>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
