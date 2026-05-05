import { NavLink } from 'react-router-dom';
import { Home, PackageOpen, Users, LogOut, Settings, Calendar } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function Sidebar() {
  const { logout, user } = useContext(AuthContext);

  const navItemClass = ({ isActive }) => 
    `nav-item ${isActive ? 'active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary-solid), var(--primary-glow))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
        }}>
          V
        </div>
        Venty SaaS
      </div>

      <nav className="nav-links" style={{ flex: 1 }}>
        <NavLink to="/dashboard" className={navItemClass}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/clientes" className={navItemClass}>
          <Users size={20} />
          <span>Clientes</span>
        </NavLink>
        <NavLink to="/calendario" className={navItemClass}>
          <Calendar size={20} />
          <span>Calendário</span>
        </NavLink>
        <NavLink to="/inventario" className={navItemClass}>
          <PackageOpen size={20} />
          <span>Cardápios Base</span>
        </NavLink>
      </nav>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 35, height: 35, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
            {user?.nomeAdmin?.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.nomeEmpresa}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.nomeAdmin}</p>
          </div>
        </div>
        
        <button onClick={logout} className="nav-item" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', color: '#f87171' }}>
          <LogOut size={20} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
