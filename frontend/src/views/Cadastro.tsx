import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import type { ViewId } from '../types';

interface CadastroProps {
  onNavigate: (view: ViewId) => void;
}

export default function Cadastro({ onNavigate }: CadastroProps) {
  const { showToast } = useToast();
  
  // 1. O estado agora aceita apenas 3 opções!
  const [tipoPerfil, setTipoPerfil] = useState<'afilhado' | 'madrinha' | 'padrinho'>('afilhado');
  
  const [periodo, setPeriodo] = useState('1º período');

  // 2. A lógica verifica se é afilhado(a) para resetar o período
  useEffect(() => {
    if (tipoPerfil === 'afilhado') setPeriodo('1º período');
    else setPeriodo('3º período');
  }, [tipoPerfil]);

  return (
    <div className="login-split-container">
      
      {/* Lado Esquerdo - Formulário */}
      <div className="login-form-section animate-slide-left">
        <form
          className="card"
          style={{ width: 'min(550px, 92vw)', minHeight: 500, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          onSubmit={(e) => {
            e.preventDefault();
            showToast('Cadastro realizado com sucesso!');
            onNavigate('inicio');
          }}
        >
          <h1 style={{ font: '600 22px Outfit, sans-serif', margin: '0 0 6px' }}>Cadastre-se.</h1>
          <p className="subtitle" style={{ margin: '0 0 22px' }}>
            Leva menos de dois minutos para começar.
          </p>

          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
            <span>Nome completo <span style={{ color: 'red' }}>*</span></span>
            <input type="text" placeholder="Seu nome" required />
          </label>
          
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
            <span>E-mail institucional <span style={{ color: 'red' }}>*</span></span>
            <input type="email" placeholder="seunome@discente.ifpe.edu.br" required />
          </label>
          
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
            <span>Senha <span style={{ color: 'red' }}>*</span></span>
            <input type="password" placeholder="Crie uma senha" required />
          </label>

          {/* 3. Atualizado: Apenas 3 botões de perfil */}
          <div style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
            <span>Quero me cadastrar como: <span style={{ color: 'red' }}>*</span></span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className={`filter ${tipoPerfil === 'afilhado' ? 'active' : ''}`}
                onClick={() => setTipoPerfil('afilhado')}
              >
                Afilhado(a)
              </button>
              <button 
                type="button" 
                className={`filter ${tipoPerfil === 'madrinha' ? 'active' : ''}`}
                onClick={() => setTipoPerfil('madrinha')}
              >
                Madrinha
              </button>
              <button 
                type="button" 
                className={`filter ${tipoPerfil === 'padrinho' ? 'active' : ''}`}
                onClick={() => setTipoPerfil('padrinho')}
              >
                Padrinho
              </button>
            </div>
          </div>

          {/* Renderização baseada em afilhado(a) vs padrinho/madrinha */}
          <div style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
            <span>Período: <span style={{ color: 'red' }}>*</span></span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tipoPerfil === 'afilhado' ? (
                <>
                  {['1º período', '2º período'].map(p => (
                    <button 
                      key={p} type="button" 
                      className={`filter ${periodo === p ? 'active' : ''}`}
                      onClick={() => setPeriodo(p)}
                    >
                      {p}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {['3º período', '4º período', '5º período', '6º período'].map(p => (
                    <button 
                      key={p} type="button" 
                      className={`filter ${periodo === p ? 'active' : ''}`}
                      onClick={() => setPeriodo(p)}
                    >
                      {p}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <button className="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            Criar minha conta
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 18 }}>
            Já tem conta?{' '}
            <button
              type="button"
              className="text-button"
              style={{ display: 'inline', padding: 0 }}
              onClick={() => onNavigate('login')}
            >
              Entrar
            </button>
          </p>
        </form>
      </div>

      {/* Lado Direito - Banner alinhado à direita com padding invertido */}
      <div className="login-banner animate-slide-right" style={{ justifyContent: 'flex-end', padding: '4rem 8rem' }}>
        <div className="banner-content" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          
          <div className="logo" style={{ marginBottom: 20, justifyContent: 'flex-end' }}>
            <span className="logo-mark" style={{ backgroundColor: '#6fd28c', color: '#112417' }}>a</span>
            <span style={{ color: 'white', fontSize: '2.2rem', fontWeight: 700, marginLeft: '8px' }}>
              apadrinha<span style={{ color: '#6fd28c' }}>ADS</span>
            </span>
          </div>

          <p className="banner-description" style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.5, marginTop: 0 }}> Sua jornada começa aqui. Junte-se a dezenas de estudantes construindo uma rede de apoio e colaboração em ADS!
  <br /> Seja bem-vindo(a)!
</p>
        </div>
      </div>
      
    </div>
  );
}