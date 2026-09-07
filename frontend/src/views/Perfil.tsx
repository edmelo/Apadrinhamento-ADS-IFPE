import Icon from '../components/Icon';
import { useModal } from '../context/ModalContext';
import type { ViewId } from '../types';

interface PerfilProps {
  onNavigate: (view: ViewId) => void;
}

const stats = [
  { icon: 'calendar', colorClass: 'purple', label: 'ENCONTROS REALIZADOS', value: '4' },
  { icon: 'message', colorClass: 'orange', label: 'PERGUNTAS NO FÓRUM', value: '2' },
  { icon: 'clock', colorClass: 'blue', label: 'DIAS NA PLATAFORMA', value: '18' },
  { icon: 'chart', colorClass: 'green', label: 'PROGRESSO DO APADRINHAMENTO', value: '50%' },
] as const;

const interests = ['Lógica', 'Front-end', 'Organização'];

export default function Perfil({ onNavigate }: PerfilProps) {
  const { openModal } = useModal();

  return (
    <section className="view active" id="perfil">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEU PERFIL</p>
          <h1>Seu espaço dentro do apadrinhamento.</h1>
          <p className="subtitle">Acompanhe seu progresso e mantenha suas informações atualizadas.</p>
        </div>
        <button className="primary" onClick={() => openModal('editar-perfil')}>
          <Icon name="sliders" />
          Editar perfil
        </button>
      </div>

      <div className="card profile-head" style={{ marginBottom: 20 }}>
        <span className="avatar avatar-green profile-avatar">US</span>
        <div>
          <h2>Usuário</h2>
          <p>Afilhado(a) · 1º período · usuario@discente.ifpe.edu.br</p>
        </div>
        <span className="status">
          <b></b>Vínculo ativo
        </span>
      </div>

      <div className="metrics">
        {stats.map((s) => (
          <article className="metric" key={s.label}>
            <span className={`metric-icon ${s.colorClass}`}>
              <Icon name={s.icon} />
            </span>
            <div>
              <p>{s.label}</p>
              <strong>{s.value}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="content-columns">
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">SOBRE VOCÊ</p>
              <h2>Interesses e disponibilidade</h2>
            </div>
          </div>
          <div className="pills" style={{ marginBottom: 16 }}>
            {interests.map((tag) => (
              <span className="pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 13, margin: '0 0 6px' }}>
            <strong>Disponibilidade:</strong> tardes durante a semana
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            <strong>O que espera do apadrinhamento:</strong> se organizar melhor para o início do
            curso e conhecer mais sobre as disciplinas.
          </p>
        </section>

        <article className="card mentor-summary">
          <div className="card-heading">
            <div>
              <p className="eyebrow">SEU PADRINHO</p>
              <h2>João Mendes</h2>
              <p>5º período · Desenvolvimento de Sistemas</p>
            </div>
            <span className="status">
              <b></b>Disponível
            </span>
          </div>
          <div className="mentor-footer">
            <div className="avatar avatar-purple large">JM</div>
            <span>&ldquo;Pode me chamar sempre que precisar!&rdquo;</span>
            <button className="round-button" onClick={() => onNavigate('agenda')}>
              <Icon name="send" />
            </button>
          </div>
        </article>
      </div>

      <div className="card" style={{ marginTop: 18, borderColor: '#f0d3d3' }}>
        <h2 style={{ fontSize: 15, marginBottom: 4 }}>Zona de risco</h2>
        <p style={{ fontSize: 13, margin: '0 0 14px' }}>
          Excluir sua conta remove permanentemente seu perfil, histórico de encontros e mensagens.
        </p>
        <button
          type="button"
          className="outline"
          style={{ color: '#b23b3b', borderColor: '#e3b6b6' }}
          onClick={() => openModal('excluir-conta', () => onNavigate('login'))}
        >
          Excluir conta
        </button>
      </div>
    </section>
  );
}