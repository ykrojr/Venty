import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package, Users, Coins, Trash2, Upload, CheckSquare, Square, FileText, DollarSign } from 'lucide-react'

export default function EventoDetalheScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [evento, setEvento] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [pdfItems, setPdfItems] = useState([])       // Itens extraídos do PDF
  const [selectedPdf, setSelectedPdf] = useState([])  // Índices selecionados pelo usuário
  const [showPdfModal, setShowPdfModal] = useState(false)

  useEffect(() => { carregarDados() }, [id])

  const getToken = () => localStorage.getItem('@Venty:token')

  const carregarDados = async () => {
    const token = getToken()
    // Busca evento completo (inclui produtos via DTO)
    const resp = await fetch('/api/v1/eventos', { headers: { 'Authorization': `Bearer ${token}` }})
    if (resp.ok) {
      const todos = await resp.json()
      const ev = todos.find(e => e.id === parseInt(id))
      if (ev) { setEvento(ev); setProdutos(ev.produtos || []) }
    }
  }

  // ==================== REMOVER PRODUTO ====================
  const handleRemover = async (produtoId) => {
    const token = getToken()
    await fetch(`/api/v1/eventos/${id}/produtos/${produtoId}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    })
    carregarDados()
  }

  // ==================== UPLOAD E PARSING DE PDF ====================
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async function(event) {
      const typedArray = new Uint8Array(event.target.result)
      try {
        const pdf = await window.pdfjsLib.getDocument(typedArray).promise
        let fullText = ''
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1)
          const content = await page.getTextContent()
          const strings = content.items.map(item => item.str)
          fullText += strings.join(' ') + '\n--- PÁGINA ' + (i + 1) + ' ---\n'
        }
        // Extrai itens inteligivelmente: cada linha que não seja vazia
        const linhas = fullText.split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 3 && !l.startsWith('---'))
        
        // Agrupa pedaços em itens úteis (tentamos separar por palavras-chave de cardápio)
        const itensFinais = []
        for (const linha of linhas) {
          // Ignora linhas muito curtas ou repetitivas
          if (linha.length < 5) continue
          itensFinais.push(linha)
        }
        
        setPdfItems(itensFinais)
        setSelectedPdf([]) // Limpa seleção
        setShowPdfModal(true)
      } catch(err) {
        alert('Erro ao ler o PDF: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
    // Reset para permitir reupload do mesmo arquivo
    e.target.value = ''
  }

  // ==================== SALVAR ITENS SELECIONADOS DO PDF ====================
  const handleSalvarSelecionados = async () => {
    const token = getToken()
    for (const idx of selectedPdf) {
      const nomeItem = pdfItems[idx]
      // Cria cada item selecionado como um Produto deste evento
      await fetch(`/api/v1/eventos/${id}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          nome: nomeItem,
          subprodutos: [] // O usuário pode editar custos depois
        })
      })
    }
    setShowPdfModal(false)
    setPdfItems([])
    setSelectedPdf([])
    carregarDados()
  }

  const togglePdfItem = (idx) => {
    if (selectedPdf.includes(idx)) {
      setSelectedPdf(selectedPdf.filter(i => i !== idx))
    } else {
      setSelectedPdf([...selectedPdf, idx])
    }
  }

  if (!evento) return <div style={{padding: '3rem', color: 'var(--text-muted)'}}>Carregando evento...</div>

  const custoTotal = produtos.reduce((sum, p) => sum + (p.custoTotal || 0), 0)
  const precoBase = evento.precoBase || 0
  const lucro = precoBase - custoTotal

  return (
    <div style={{minHeight: '100vh', background: 'var(--bg-dark)', padding: '3rem', position: 'relative'}}>
      <div className="bg-glow"></div>

      {/* Cabeçalho */}
      <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'var(--primary-glow)', cursor:'pointer', display:'flex', gap:10, marginBottom: 20, fontSize: '1rem'}}>
        <ArrowLeft/> Voltar ao Dashboard
      </button>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: 5}}>{evento.nome}</h1>
          <p style={{color: 'var(--text-muted)'}}>{evento.data} • {evento.hora} • {evento.endereco}</p>
        </div>

        {/* Painel Financeiro */}
        <div className="glass-panel" style={{padding: '20px 30px', display: 'flex', gap: 30}}>
          <div style={{textAlign: 'center'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Receita</p>
            <p style={{fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-glow)'}}>R$ {precoBase.toFixed(2)}</p>
          </div>
          <div style={{textAlign: 'center'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Custos</p>
            <p style={{fontSize: '1.3rem', fontWeight: 700, color: 'var(--warning)'}}>R$ {custoTotal.toFixed(2)}</p>
          </div>
          <div style={{textAlign: 'center'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Lucro</p>
            <p style={{fontSize: '1.3rem', fontWeight: 700, color: lucro > 0 ? 'var(--success)' : '#ef4444'}}>R$ {lucro.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div style={{display: 'flex', gap: 15, marginTop: 30, marginBottom: 30}}>
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} />
        <button className="btn-primary" style={{width: 'auto', display: 'flex', gap: 8, alignItems: 'center'}} onClick={() => fileInputRef.current.click()}>
          <Upload size={18}/> Importar Cardápio (PDF)
        </button>
      </div>

      {/* Lista de Produtos deste Evento */}
      <h2 style={{marginBottom: 15}}><Package size={22}/> Itens Contratados Neste Evento</h2>
      {produtos.length === 0 ? (
        <div className="glass-panel" style={{padding: 40, textAlign: 'center', color: 'var(--text-muted)'}}>
          <FileText size={50} style={{marginBottom: 15, opacity: 0.4}}/>
          <p>Nenhum item cadastrado. Use o botão <strong>"Importar Cardápio (PDF)"</strong> para selecionar um arquivo do seu computador!</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {produtos.map(p => (
            <div key={p.id} className="glass-panel" style={{padding: '18px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: '0.3s'}}>
              <div>
                <strong style={{fontSize: '1.05rem'}}>{p.nome}</strong>
                <div style={{display: 'flex', gap: 20, marginTop: 8, color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                  <span><Package size={14}/> Mat.: R$ {(p.custoMateriais || 0).toFixed(2)}</span>
                  <span><Users size={14}/> Eqp.: R$ {(p.custoFuncionarios || 0).toFixed(2)}</span>
                  <span style={{color: 'var(--warning)'}}><Coins size={14}/> Total: R$ {(p.custoTotal || 0).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => handleRemover(p.id)} style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: '0.3s'}}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ==================== MODAL DE SELEÇÃO DO PDF ==================== */}
      {showPdfModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
            <h2>📄 Itens Detectados no PDF</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: 15}}>
              Marque somente os itens que o cliente <strong>realmente pediu</strong>. O restante será descartado.
            </p>

            <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, paddingRight: 10}}>
              {pdfItems.map((item, idx) => (
                <div key={idx}
                  onClick={() => togglePdfItem(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: selectedPdf.includes(idx) ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.3)',
                    border: selectedPdf.includes(idx) ? '1px solid var(--primary-glow)' : '1px solid transparent',
                    padding: '12px 15px', borderRadius: 8, cursor: 'pointer', transition: '0.2s'
                  }}>
                  {selectedPdf.includes(idx) ? <CheckSquare size={20} color="var(--primary-glow)"/> : <Square size={20} color="#555"/>}
                  <span style={{fontSize: '0.92rem'}}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', gap: 15}}>
              <button className="btn-primary" onClick={handleSalvarSelecionados} style={{flex: 1}}>
                Salvar {selectedPdf.length} iten(s) selecionado(s)
              </button>
              <button onClick={() => setShowPdfModal(false)} style={{background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: 12, cursor: 'pointer'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
