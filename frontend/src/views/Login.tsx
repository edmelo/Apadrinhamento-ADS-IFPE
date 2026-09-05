import { useToast } from '../context/ToastContext';
import type { ViewId } from '../types';

interface LoginProps {
  onNavigate: (view: ViewId) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { showToast } = useToast();

  return (
    <div className="login-split-container">
      {/* Lado Esquerdo - Boas Vindas */}
      <div className="login-banner">
        <div className="banner-content">
          <div className="logo" style={{ marginBottom: 20 }}>
            <span className="logo-mark" style={{ backgroundColor: '#6fd28c', color: '#112417' }}>a</span>
            <span style={{ color: 'white', fontSize: '2.2rem', fontWeight: 700, marginLeft: '8px' }}>
              apadrinha<span style={{ color: '#6fd28c' }}>ADS</span>
            </span>
          </div>
          <p className="banner-description" style={{ color: 'white', fontSize: '1rem', lineHeight: 1.5 }}>
            Conectando calouros e veteranos para uma jornada acadêmica mais colaborativa e acolhedora no IFPE.
            <br />
            Seja bem-vindo(a)!
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="login-form-section">
        <form
          className="card"
          style={{ width: 'min(400px, 92vw)', padding: 32 }}
          onSubmit={(e) => {
            e.preventDefault();
            showToast('Login realizado com sucesso!');
            onNavigate('inicio');
          }}
        >
          <h1 style={{ font: '600 22px Outfit, sans-serif', margin: '0 0 6px' }}>Acessar o sistema</h1>
          <p className="subtitle" style={{ margin: '0 0 22px' }}>
            Informe suas credenciais institucionais para continuar.
          </p>

          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
            <span>E-mail ou Usuário <span style={{ color: 'red' }}>*</span></span>
            <input type="text" placeholder="seunome@discente.ifpe.edu.br" required style={{ fontWeight: 400 }} />
          </label>
          
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
            <span>Senha <span style={{ color: 'red' }}>*</span></span>
            <input type="password" placeholder="••••••••" required style={{ fontWeight: 400 }} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" style={{ margin: 0 }} /> Manter conectado
            </label>
            <a href="#" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
              Esqueci minha senha
            </a>
          </div>

          <button className="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            Entrar
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 18 }}>
            Ainda não tem conta?{' '}
            <button
              type="button"
              className="text-button"
              style={{ display: 'inline', padding: 0 }}
              onClick={() => onNavigate('cadastro')}
            >
              Cadastre-se
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}