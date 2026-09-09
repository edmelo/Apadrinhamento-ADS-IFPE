import { useState } from 'react';
import Icon from './Icon';
import type { ViewId } from '../types';

interface TopbarProps {
  onToggleMenu: () => void;
  onNavigate: (view: ViewId) => void;
}

export default function Topbar({ onToggleMenu, onNavigate }: TopbarProps) {
  // Estado para controlar a abertura do modal de saída
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Abrir menu" onClick={onToggleMenu}>
        <Icon name="menu" />
      </button>
      
      <div className="breadcrumb">
        Bem-vindo(a) de volta, <strong>Usuário!</strong>
      </div>
      
      <div className="top-actions">
        <button className="icon-button" aria-label="Notificações" onClick={() => onNavigate('notificacoes')}>
          <Icon name="bell" />
          <b></b>
        </button>
        <button className="help-button" aria-label="Ajuda" onClick={() => onNavigate('faq')}>
          ?
        </button>
        
        {/* Botão Sair com Ícone */}
        <button 
          className="primary" 
          onClick={() => setIsLogoutModalOpen(true)} 
          style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Icon name="log-out" /> Sair
        </button>
      </div>

      {/* ====== MODAL DE CONFIRMAÇÃO DE SAÍDA ====== */}
      <div className={`modal-backdrop ${isLogoutModalOpen ? 'open' : ''}`} onClick={() => setIsLogoutModalOpen(false)}>
        {/* e.stopPropagation() evita que o clique dentro da caixa feche o modal */}
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
          
          <h2 style={{ textAlign: 'center', margin: '0 0 10px' }}>Deseja mesmo sair?</h2>
          <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '24px', color: 'var(--muted)' }}>
            Você precisará fazer login novamente para acessar sua conta.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              className="outline" 
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '44px', 
                padding: '0', 
                boxSizing: 'border-box' 
              }}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="primary" 
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#b23b3b', 
                height: '44px', 
                padding: '0', 
                boxSizing: 'border-box' 
              }}
              onClick={() => {
                setIsLogoutModalOpen(false);
                onNavigate('login');
              }}
            >
              Sair
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}