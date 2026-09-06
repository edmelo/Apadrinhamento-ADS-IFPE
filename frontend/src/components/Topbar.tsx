import Icon from './Icon';
import type { ViewId } from '../types';

interface TopbarProps {
  onToggleMenu: () => void;
  onNavigate: (view: ViewId) => void;
}

export default function Topbar({ onToggleMenu, onNavigate }: TopbarProps) {
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
      </div>
    </header>
  );
}