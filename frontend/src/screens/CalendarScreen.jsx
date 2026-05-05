import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, ArrowLeft, Plus, X, MapPin, Clock, Calendar as Cal, Package, Users, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import Layout from '../components/Layout';

export default function CalendarScreen() {
  const [eventos, setEventos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      const { data } = await api.get('/eventos');
      
      const eventsFormatted = data.map(ev => ({
        id: ev.id,
        title: `${ev.hora ? ev.hora.substring(0,5) : ''} ${ev.nome}`,
        start: ev.data,
        backgroundColor: getStatusColor(ev.status),
        borderColor: 'transparent',
        extendedProps: { ...ev }
      }));
      
      setEventos(eventsFormatted);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANEJAMENTO': return '#f59e0b';
      case 'CONFIRMADO': return '#6366f1';
      case 'EM_ANDAMENTO': return '#818cf8';
      case 'CONCLUIDO': return '#10b981';
      case 'CANCELADO': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const handleDateClick = (arg) => {
    navigate('/evento/novo', { state: { selectedDate: arg.dateStr } });
  };

  return (
    <Layout>
      <div className="topbar">
        <div className="welcome">
          <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'var(--primary-glow)', cursor:'pointer', display:'flex', gap:10, marginBottom: 10, fontSize: '1rem'}}>
            <ArrowLeft/> Voltar
          </button>
          <h1>Calendário de Eventos</h1>
          <p>Clique em um evento para ver a alocação e detalhes rápidos.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', position: 'relative' }}>
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={eventos}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            dayMaxEvents={3}
            locale="pt-br"
            buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            height="auto"
          />
        </div>

        {/* PAINEL LATERAL DE ALOCAÇÃO (DRAWER) */}
        {selectedEvent && (
          <div className="drawer-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="drawer-content glass-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <h2>Alocação do Evento</h2>
                    <button className="close-btn" onClick={() => setSelectedEvent(null)}><X size={24}/></button>
                </div>
                
                <div className="drawer-body">
                    <h1 style={{fontSize: '1.5rem', marginBottom: 5}}>{selectedEvent.nome}</h1>
                    <div className="event-meta-info">
                        <span><Cal size={16}/> {selectedEvent.data}</span>
                        <span><Clock size={16}/> {selectedEvent.hora}</span>
                        <span><MapPin size={16}/> {selectedEvent.local || 'Local não definido'}</span>
                    </div>

                    <div className="allocation-section">
                        <h3><Package size={18}/> Itens Alocados</h3>
                        {selectedEvent.produtos?.length === 0 ? (
                            <p className="empty-msg">Nenhum item alocado para este evento.</p>
                        ) : (
                            <div className="allocation-list">
                                {selectedEvent.produtos?.map(p => (
                                    <div key={p.id} className="allocation-item">
                                        <div className="item-main">
                                            <strong>{p.nome}</strong>
                                            <span className="item-cost">R$ {(p.custoTotal || 0).toFixed(2)}</span>
                                        </div>
                                        {p.subprodutos?.length > 0 && (
                                            <div className="sub-allocation">
                                                {p.subprodutos.map(s => (
                                                    <div key={s.id} className="sub-item">
                                                        <span>{s.quantidade}x {s.nome}</span>
                                                        <span style={{color: s.ehFuncionario ? 'var(--primary-glow)' : 'var(--text-muted)'}}>
                                                            {s.ehFuncionario ? <Users size={12} style={{display:'inline', marginRight:4}}/> : ''}
                                                            R$ {(s.precoUnitario * s.quantidade).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="drawer-footer">
                        <button className="btn-primary" onClick={() => navigate(`/evento/${selectedEvent.id}`)}>
                            Ver Detalhes Completos <ChevronRight size={18}/>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .calendar-container {
          color: var(--text-main);
        }
        .fc {
          --fc-border-color: var(--glass-border);
          --fc-button-bg-color: var(--primary-solid);
          --fc-button-border-color: var(--glass-border);
          --fc-button-hover-bg-color: var(--primary-hover);
          --fc-button-active-bg-color: var(--primary-hover);
          --fc-today-bg-color: rgba(99, 102, 241, 0.1);
        }
        .fc-toolbar-title {
          font-family: var(--font-heading);
          font-size: 1.5rem !important;
        }
        .fc-col-header-cell {
          padding: 10px 0;
          background: rgba(255,255,255,0.02);
          font-weight: 600;
          color: var(--text-muted);
        }
        .fc-daygrid-event {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        .fc-daygrid-event:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
        .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid var(--glass-border);
        }
        .fc-theme-standard .fc-scrollgrid {
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            overflow: hidden;
        }

        /* DRAWER STYLES */
        .drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex;
            justify-content: flex-end;
            animation: fadeIn 0.3s ease;
        }
        .drawer-content {
            width: 450px;
            height: 100%;
            border-radius: 0;
            border-left: 1px solid var(--glass-border);
            padding: 0;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s ease;
        }
        .drawer-header {
            padding: 25px;
            border-bottom: 1px solid var(--glass-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .drawer-header h2 {
            font-size: 1.2rem;
            color: var(--text-muted);
        }
        .close-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            transition: 0.2s;
        }
        .close-btn:hover { color: white; }
        
        .drawer-body {
            padding: 30px;
            flex: 1;
            overflow-y: auto;
        }
        .event-meta-info {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
            color: var(--text-muted);
            font-size: 0.95rem;
        }
        .event-meta-info span {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .allocation-section {
            margin-top: 40px;
        }
        .allocation-section h3 {
            font-size: 1.1rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--primary-glow);
        }
        .empty-msg {
            text-align: center;
            padding: 40px;
            color: var(--text-muted);
            font-style: italic;
        }
        .allocation-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .allocation-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--glass-border);
            padding: 15px;
            border-radius: 12px;
        }
        .item-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .item-cost {
            font-weight: 700;
            color: var(--warning);
        }
        .sub-allocation {
            border-top: 1px solid var(--glass-border);
            padding-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .sub-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .drawer-footer {
            padding: 30px;
            border-top: 1px solid var(--glass-border);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </Layout>
  );
}
