import Icon from '../components/Icon';
import { useToast } from '../context/ToastContext';

const metrics = [
  { icon: 'users', colorClass: 'green', label: 'CALOUROS CADASTRADOS', value: '86', note: '↑ 12 nesta semana', positive: true },
  { icon: 'heart', colorClass: 'purple', label: 'VÍNCULOS ATIVOS', value: '61', note: '71% dos calouros', positive: true },
  { icon: 'message', colorClass: 'orange', label: 'PERGUNTAS RESPONDIDAS', value: '142', note: '↑ 18 esta semana', positive: true },
  { icon: 'clock', colorClass: 'blue', label: 'AGUARDANDO MATCH', value: '08', note: 'Requer atenção', positive: false },
];

const pending = [
  { name: 'Maria Clara', role: 'Afilhada', status: 'Sem padrinho', badge: 'yellow', action: 'Atribuir' },
  { name: 'Diego Alves', role: 'Padrinho', status: 'Validar perfil', badge: 'blue', action: 'Revisar' },
  { name: 'Bianca Lima', role: 'Afilhada', status: 'Sem padrinho', badge: 'yellow', action: 'Atribuir' },
];

export default function Admin() {
  const { showToast } = useToast();

  return (
    <section className="view active" id="admin">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRAÇÃO</p>
          <h1>Visão geral da comunidade.</h1>
          <p className="subtitle">Acompanhe conexões, participação e pontos de atenção.</p>
        </div>
        <button className="primary" onClick={() => showToast('Novo aviso criado')}>
          <Icon name="plus" />
          Publicar aviso
        </button>
      </div>

      <div className="metrics">
        {metrics.map((m) => (
          <article className="metric" key={m.label}>
            <span className={`metric-icon ${m.colorClass}`}>
              <Icon name={m.icon} />
            </span>
            <div>
              <p>{m.label}</p>
              <strong>{m.value}</strong>
              <small className={m.positive ? 'positive' : ''}>{m.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="admin-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">PENDÊNCIAS</p>
              <h2>Solicitações aguardando ação</h2>
            </div>
            <button className="text-button">
              Ver todas <Icon name="arrow" />
            </button>
          </div>
          <div className="table">
            <div className="table-row table-head">
              <span>ESTUDANTE</span>
              <span>PERFIL</span>
              <span>SITUAÇÃO</span>
              <span></span>
            </div>
            {pending.map((p) => (
              <div className="table-row" key={p.name}>
                <strong>{p.name}</strong>
                <span>{p.role}</span>
                <span className={`badge ${p.badge}`}>{p.status}</span>
                <button
                  className="small-button"
                  onClick={() => showToast(`${p.action === 'Atribuir' ? 'Match sugerido para' : 'Perfil de'} ${p.name}${p.action === 'Revisar' ? ' aberto' : ''}`)}
                >
                  {p.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card admin-actions">
          <p className="eyebrow">GESTÃO RÁPIDA</p>
          <button className="outline" onClick={() => showToast('Gestão de usuários aberta')}>
            <Icon name="users" />
            Gerenciar usuários
          </button>
          <button className="outline" onClick={() => showToast('Moderação do mural aberta')}>
            <Icon name="bookmark" />
            Revisar mural e fórum
          </button>
          <button className="outline" onClick={() => showToast('Relatório gerado')}>
            <Icon name="chart" />
            Relatório de mentorias
          </button>
        </section>
      </div>
    </section>
  );
}
