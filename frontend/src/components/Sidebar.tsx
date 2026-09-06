import Icon from './Icon';
import type { ViewId } from '../types';

interface SidebarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  open: boolean;
}

const menuItems: { id: ViewId; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Início', icon: 'home' },
  { id: 'encontrar', label: 'Encontrar padrinho', icon: 'users' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'forum', label: 'Fórum', icon: 'message' },
  { id: 'avisos', label: 'Mural de avisos', icon: 'bookmark' },
];

export default function Sidebar({ currentView, onNavigate, open }: SidebarProps) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Navegação principal">
      <a
        className="logo"
        href="#inicio"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('inicio');
        }}
      >
        <span className="logo-mark">a</span>
        <span>
          apadrinha<span>ADS</span>
        </span>
      </a>
      <p className="section-label">MENU</p>
      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item${currentView === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button
          className={`nav-item${currentView === 'admin' ? ' active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          <Icon name="chart" />
          Administração
        </button>
        <button className="profile-card" onClick={() => onNavigate('perfil')}>
          <span className="avatar avatar-green">US</span>
          <span>
            <strong>Usuário</strong>
            <small>Afilhado(a) · 1º período</small>
          </span>
          <Icon name="more" />
        </button>
        <button className="nav-item" onClick={() => onNavigate('login')}>
          <Icon name="x" />
          Sair
        </button>
      </div>
    </aside>
  );
}