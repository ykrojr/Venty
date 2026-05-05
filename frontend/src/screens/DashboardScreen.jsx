import { useState, useEffect } from 'react';
import { ChevronRight, Calendar, MapPin, Package, DollarSign, Plus, TrendingUp, BarChart as BarChartIcon, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function DashboardScreen() {
  const [eventos, setEventos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [respEventos, respMetricas] = await Promise.all([
        api.get('/eventos'),
        api.get('/dashboard')
      ]);
      setEventos(respEventos.data);
      setMetricas(respMetricas.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConcluir = async (e, eventoId) => {
    e.stopPropagation();
    const loading = toast.loading('Concluindo evento...');
    try {
      await api.patch(`/eventos/${eventoId}/status?status=CONCLUIDO`);
      toast.success('Evento marcado como Concluído!', { id: loading });
      carregarDados();
    } catch (err) {
      toast.error('Erro ao concluir evento.', { id: loading });
    }
  };

  const handleExcluir = async (e, eventoId) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    const loading = toast.loading('Excluindo evento...');
    try {
      await api.delete(`/eventos/${eventoId}`);
      toast.success('Evento excluído!', { id: loading });
      carregarDados();
    } catch (err) {
      toast.error('Erro ao excluir evento.', { id: loading });
    }
  };

  // Dados para o gráfico de pizza (Status)
  const statusData = metricas?.eventosPorStatus ? Object.entries(metricas.eventosPorStatus).map(([name, value]) => ({
    name: name === 'PLANEJAMENTO' ? 'Planejamento' :
          name === 'CONFIRMADO' ? 'Confirmado' :
          name === 'EM_ANDAMENTO' ? 'Em Andamento' :
          name === 'CONCLUIDO' ? 'Concluído' : 'Cancelado',
    value
  })) : [];

  const COLORS = {
    'Planejamento': '#f59e0b',
    'Confirmado': '#6366f1',
    'Em Andamento': '#818cf8',
    'Concluído': '#10b981',
    'Cancelado': '#ef4444'
  };

  // Dados para o gráfico de barras (Financeiro)
  const financeData = metricas ? [
    { name: 'Financeiro Geral', Receita: metricas.receitaTotal, Custos: metricas.custosTotais, Lucro: metricas.lucroTotal }
  ] : [];

  return (
    <Layout>
      <div className="topbar">
        <div className="welcome">
          <h1>Visão Geral da Empresa</h1>
          <p>Acompanhe suas métricas e próximos eventos.</p>
        </div>
        <button className="btn-primary" style={{width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center'}} onClick={() => navigate('/evento/novo')}>
          <Plus size={20}/> Novo Evento
        </button>
      </div>

      {/* Cards de Métricas e Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Gráfico de Barras: Receita vs Custos */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
             <TrendingUp size={20} color="var(--primary-glow)"/> Comparativo Financeiro (R$)
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--glass-border)', borderRadius: 10 }}
                  itemStyle={{ fontSize: '0.9rem' }}
                />
                <Legend />
                <Bar dataKey="Receita" fill="var(--primary-solid)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lucro" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza: Status */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChartIcon size={20} color="var(--primary-glow)"/> Distribuição de Status
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--glass-border)', borderRadius: 10 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <h2>Próximos Eventos</h2>
      {eventos.length === 0 ? (
        <div className="glass-panel" style={{textAlign: 'center', padding: '4rem', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          <Calendar size={60} style={{marginBottom: 20, opacity: 0.5}}/>
          <h2>Nenhum evento programado</h2>
          <p>Sua agenda está vazia. Cadastre o seu primeiro cliente e evento!</p>
          <button className="btn-primary" style={{marginTop: 20, width: 'auto', padding: '0.8rem 2rem'}} onClick={() => navigate('/evento/novo')}>Criar Primeiro Evento</button>
        </div>
      ) : (
        <div className="events-grid">
          {eventos.map(ev => (
            <div key={ev.id} className="glass-panel event-card" onClick={() => navigate(`/evento/${ev.id}`)}>
              <div className="event-header">
                <span className={`event-status ${ev.status === 'CONCLUIDO' ? 'concluido' : ''}`}>
                  {ev.status || (ev.concluido ? 'CONCLUIDO' : 'AGENDADO')}
                </span>
                <ChevronRight size={18} color="var(--text-muted)"/>
              </div>
              <h3 className="event-title">{ev.nome}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '0.5rem'}}>
                  <span className="event-info"><Calendar size={16}/> {ev.data} • {ev.hora}</span>
                  <span className="event-info"><MapPin size={16}/> {ev.clienteNome || 'Cliente não associado'}</span>
                  
                  {/* Resumo financeiro no card */}
                  <div style={{background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: 8, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5}}>
                    <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                      <Package size={14}/> {ev.produtos?.length || 0} itens contratados
                    </span>
                    <span style={{fontSize: '0.9rem', color: ev.lucroEsperado > 0 ? 'var(--success)' : 'var(--text-muted)'}}>
                      <DollarSign size={14}/> <strong>Lucro Real: R$ {ev.lucroEsperado?.toFixed(2)}</strong>
                    </span>
                  </div>
              </div>
              <div className="event-footer" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span className="event-price">Base R$ {ev.precoBase?.toFixed(2) || '0.00'}</span>
                <div style={{display: 'flex', gap: 6}} onClick={e => e.stopPropagation()}>
                  {ev.status !== 'CONCLUIDO' && (
                    <button
                      onClick={e => handleConcluir(e, ev.id)}
                      title="Marcar como Concluído"
                      style={{background: 'rgba(16,185,129,0.1)', border: 'none', color: 'var(--success)', padding: '6px 8px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem'}}
                    >
                      <CheckCircle2 size={15}/> Concluir
                    </button>
                  )}
                  <button
                    onClick={e => handleExcluir(e, ev.id)}
                    title="Excluir evento"
                    style={{background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '6px 8px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem'}}
                  >
                    <Trash2 size={15}/> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
