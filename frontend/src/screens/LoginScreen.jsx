import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { api, authApi } from '../services/api';
import toast from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [nomeAdmin, setNomeAdmin] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Conectando ao sistema...');
    
    try {
      if (isRegister) {
        const { data } = await authApi.post(`/register?nomeEmpresa=${encodeURIComponent(nomeEmpresa)}&nomeAdmin=${encodeURIComponent(nomeAdmin)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`);
        login(data.usuario, data.token);
        toast.success(`Bem-vindo, ${data.usuario.nomeAdmin}! Empresa criada.`, { id: loadingToast });
        navigate('/dashboard');
      } else {
        const { data } = await authApi.post('/login', { email, senha });
        login(data.usuario, data.token);
        toast.success(`Bem-vindo de volta!`, { id: loadingToast });
        navigate('/dashboard');
      }
    } catch(err) {
      toast.dismiss(loadingToast);
      // O erro já será tratado pelo interceptor e exibido com toast.error
    }
  }

  return (
    <div className="auth-container">
      <div className="glass-panel auth-box">
        <div className="auth-header">
          <div className="logo-icon"><CalendarDays size={40} /></div>
          <h2>Venty</h2>
          <p>{isRegister ? 'Crie seu espaço de trabalho gratuito' : 'O futuro da gestão profissional de eventos'}</p>
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
          <button className="btn-primary" type="submit">{isRegister ? 'Criar Empresa' : 'Entrar no Painel'}</button>
          
          {/* Adicionaremos o OAuth Google aqui no futuro */}

          <button type="button" onClick={() => setIsRegister(!isRegister)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: 10}}>
            {isRegister ? 'Já tenho uma conta. Fazer Login.' : 'Ainda não sou cliente. Criar Empresa.'}
          </button>
        </form>
      </div>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
    </div>
  );
}
