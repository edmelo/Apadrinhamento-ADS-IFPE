import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import type { ViewId } from '../types';

interface CadastroProps {
  onNavigate: (view: ViewId) => void;
}

export default function Cadastro({ onNavigate }: CadastroProps) {
  const { showToast } = useToast();
  const [tipoPerfil, setTipoPerfil] = useState<'afilhado' | 'padrinho'>('afilhado');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--canvas)', padding: '32px 0' }}>
      <form
        className="card"
        style={{ width: 'min(460px, 92vw)', padding: 32 }}
        onSubmit={(e) => {
          e.preventDefault();
          showToast('Cadastro realizado com sucesso!');
          onNavigate('inicio');
        }}
      >
        <div className="logo" style={{ marginBottom: 26 }}>
          <span className="logo-mark">a</span>
          <span style={{ color: 'var(--ink)' }}>
            apadrinha<span style={{ color: 'var(--green)' }}>ADS</span>
          </span>
        </div>

        <h1 style={{ font: '600 22px Outfit, sans-serif', margin: '0 0 6px' }}>Criar conta</h1>
        <p className="subtitle" style={{ margin: '0 0 22px' }}>
          Leva menos de dois minutos para começar.
        </p>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          Nome completo
          <input placeholder="Seu nome" required />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          E-mail institucional
          <input type="email" placeholder="seunome@discente.ifpe.edu.br" required />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          Senha
          <input type="password" placeholder="Crie uma senha" required />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          Quero me cadastrar como
          <select value={tipoPerfil} onChange={(e) => setTipoPerfil(e.target.value as typeof tipoPerfil)}>
            <option value="afilhado">Afilhado(a) — sou calouro(a)</option>
            <option value="padrinho">Padrinho/madrinha — quero mentorar</option>
          </select>
        </label>

        {tipoPerfil === 'afilhado' ? (
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
            Período
            <select defaultValue="1º período">
              <option>1º período</option>
              <option>2º período</option>
            </select>
          </label>
        ) : (
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
            Período
            <select defaultValue="5º período">
              <option>3º período</option>
              <option>4º período</option>
              <option>5º período</option>
              <option>6º período</option>
            </select>
          </label>
        )}

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
  );
}