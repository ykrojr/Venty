import { useState, useEffect } from 'react'
import { Plus, Package, Users, Coins, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function InventarioScreen() {
  const [produtos, setProdutos] = useState([])
  const [nomeProduto, setNomeProduto] = useState('')
  const [subprodutos, setSubprodutos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    const token = localStorage.getItem('@Venty:token')
    const resp = await fetch('/api/v1/produtos', { headers: { 'Authorization': `Bearer ${token}` }})
    if(resp.ok) setProdutos(await resp.json())
  }

  const addSubproduto = () => {
    setSubprodutos([...subprodutos, { nome: '', precoUnitario: 0, quantidade: 1, ehFuncionario: false }])
  }

  const updateSubproduto = (index, field, value) => {
    const novos = [...subprodutos]
    novos[index][field] = value
    setSubprodutos(novos)
  }

  const handleSalvarProduto = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('@Venty:token')
    const payload = { nome: nomeProduto, subprodutos: subprodutos }
    
    await fetch('/api/v1/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    
    setNomeProduto('')
    setSubprodutos([])
    carregarProdutos()
  }

  // --- MÁGICA DA INTELIGÊNCIA ARTIFICIAL: LEITURA DOS PDFs DUDAS BUFFET ---
  const handleAutoImport = async () => {
    const token = localStorage.getItem('@Venty:token');
    if(!token) return;

    // Conhecimento LIDO do seu arquivo "Catálogo De Estações" e "Principal"
    const pacotesIniciais = [
      {
        nome: "Estação Principal - 200 Und (Até 30 Pessoas)",
        subprodutos: [
          { nome: "Insumos (Hambúrguer, Hot Dog, Pizza, Churros...)", precoUnitario: 1290.00, quantidade: 1, ehFuncionario: false },
          { nome: "Monitora Treinada", precoUnitario: 150.00, quantidade: 1, ehFuncionario: true }
        ]
      },
      {
        nome: "Estação Principal - 500 Und (Até 100 Pessoas)",
        subprodutos: [
          { nome: "Insumos (Hambúrguer, Hot Dog, Pizza, Churros...)", precoUnitario: 3300.00, quantidade: 1, ehFuncionario: false },
          { nome: "Monitora Treinada 1", precoUnitario: 150.00, quantidade: 1, ehFuncionario: true },
          { nome: "Monitora Treinada Extra", precoUnitario: 150.00, quantidade: 1, ehFuncionario: true }
        ]
      },
      {
        nome: "Estação de Chocofrutas",
        subprodutos: [
          { nome: "Insumos (Uva, Morango, Banana, Chocolate Especial)", precoUnitario: 1140.00, quantidade: 1, ehFuncionario: false },
          { nome: "Monitora e Casinha Personalizada", precoUnitario: 150.00, quantidade: 1, ehFuncionario: true }
        ]
      },
      {
        nome: "Estação de Hamburguer Artesanal",
        subprodutos: [
          { nome: "Insumos (Pão, Carne Artesanal, Bacon, Cheddar)", precoUnitario: 1500.00, quantidade: 1, ehFuncionario: false },
          { nome: "Monitora e Casinha Personalizada", precoUnitario: 150.00, quantidade: 1, ehFuncionario: true }
        ]
      }
    ];

    for (let pacote of pacotesIniciais) {
      await fetch('/api/v1/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(pacote)
      });
    }
    carregarProdutos(); // Recarrega tela!
  }

  return (
    <div className="dashboard-layout">
      {/* Container Esquerdo: Formulário */}
      <div style={{ flex: 1, padding: '3rem', borderRight: '1px solid var(--glass-border)' }}>
        <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'var(--primary-glow)', cursor:'pointer', display:'flex', gap:10}}>
          <ArrowLeft/> Voltar ao Dashboard
        </button>
        <h2 style={{marginTop: '2rem', marginBottom: '1.5rem'}}><Package/> Cadastrar Novo Cardápio/Kit</h2>
        
        <form onSubmit={handleSalvarProduto} className="auth-form" style={{background: 'var(--bg-panel)', padding: 25, borderRadius: 15, border: '1px solid var(--glass-border)'}}>
          <div className="input-group">
            <input type="text" placeholder="Nome do Combo (Ex: Casamento Premium)" value={nomeProduto} onChange={e=>setNomeProduto(e.target.value)} required/>
          </div>
          
          <div style={{marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem'}}>
             <h4 style={{marginBottom: 10}}>Componentes Deste Kit (Insumos & Equipe)</h4>
             {subprodutos.map((sub, idx) => (
                <div key={idx} style={{display: 'flex', gap: 10, marginBottom: 10, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8}}>
                  <input type="text" placeholder="Nome (Ex: Garçom)" style={{flex: 2, background:'transparent', color:'white', border:'1px solid #333', padding:5}} value={sub.nome} onChange={e => updateSubproduto(idx, 'nome', e.target.value)}/>
                  <input type="number" step="0.01" placeholder="Custo R$" style={{flex: 1, background:'transparent', color:'white', border:'1px solid #333', padding:5}} value={sub.precoUnitario} onChange={e => updateSubproduto(idx, 'precoUnitario', e.target.value)}/>
                  <input type="number" placeholder="Qtd" style={{flex: 0.5, background:'transparent', color:'white', border:'1px solid #333', padding:5}} value={sub.quantidade} onChange={e => updateSubproduto(idx, 'quantidade', e.target.value)}/>
                  <label style={{display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem'}}>
                    <input type="checkbox" checked={sub.ehFuncionario} onChange={e => updateSubproduto(idx, 'ehFuncionario', e.target.checked)}/> Profissional?
                  </label>
                </div>
             ))}
             <button type="button" onClick={addSubproduto} style={{background:'rgba(255,255,255,0.1)', color:'white', border:'none', padding: '10px 15px', borderRadius: 8, cursor:'pointer', marginTop: 10}}>+ Adicionar Componente</button>
          </div>

          <button type="submit" className="btn-primary" style={{marginTop: 20}}>Criar Cardápio Mestre</button>
        </form>
      </div>

      {/* Container Direito: Lista */}
      <div style={{ flex: 1, padding: '3rem', background: 'var(--bg-dark)' }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
           <h2>Seus Cardápios Registrados</h2>
           <button onClick={handleAutoImport} style={{background: 'linear-gradient(90deg, #a855f7, #6366f1)', color: 'white', padding: '10px 15px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
             ⚡ IA: Extrair Dudas Buffet (PDFs)
           </button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem'}}>
          {produtos.map(p => (
            <div key={p.id} className="glass-panel" style={{padding: 20}}>
              <h3>{p.nome}</h3>
              <div style={{display: 'flex', gap: 20, marginTop: 15, color: 'var(--text-muted)'}}>
                <span><Package size={16}/> Mat.: R$ {p.custoMateriais?.toFixed(2)}</span>
                <span><Users size={16}/> Eqp.: R$ {p.custoFuncionarios?.toFixed(2)}</span>
                <span style={{color: 'var(--warning)', fontWeight: 'bold'}}><Coins size={16}/> Custo: R$ {p.custoTotal?.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {produtos.length === 0 && <p style={{color: 'var(--text-muted)'}}>Nenhum cardápio customizável criado.</p>}
        </div>
      </div>
    </div>
  )
}
