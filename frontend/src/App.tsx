import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Modal from './components/Modal';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import type { ViewId } from './types';

import Inicio from './views/Inicio';
import Encontrar from './views/Encontrar';
import Agenda from './views/Agenda';
import Forum from './views/Forum';
import Avisos from './views/Avisos';
import Admin from './views/Admin';
import Perfil from './views/Perfil';
import Login from './views/Login';
import Cadastro from './views/Cadastro';
import Faq from './views/Faq';
import Notificacoes from './views/Notificacoes';

const AUTH_VIEWS: ViewId[] = ['login', 'cadastro'];

function AppShell() {
  const [view, setView] = useState<ViewId>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (next: ViewId) => {
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (AUTH_VIEWS.includes(view)) {
    return (
      <>
        {view === 'login' && <Login onNavigate={navigate} />}
        {view === 'cadastro' && <Cadastro onNavigate={navigate} />}
        <Modal />
      </>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'inicio':
        return <Inicio onNavigate={navigate} />;
      case 'encontrar':
        return <Encontrar />;
      case 'agenda':
        return <Agenda />;
      case 'forum':
        return <Forum />;
      case 'avisos':
        return <Avisos />;
      case 'admin':
        return <Admin />;
      case 'perfil':
        return <Perfil onNavigate={navigate} />;
      case 'faq':
        return <Faq />;
      case 'notificacoes':
        return <Notificacoes />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar currentView={view} onNavigate={navigate} open={sidebarOpen} />
      <main className="main-content">
        <Topbar onToggleMenu={() => setSidebarOpen((o) => !o)} onNavigate={navigate} />
        {renderView()}
      </main>
      <Modal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <AppShell />
      </ModalProvider>
    </ToastProvider>
  );
}