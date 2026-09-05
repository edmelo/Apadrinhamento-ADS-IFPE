import { useState } from 'react';
import Icon from '../components/Icon';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import type { ViewId } from '../types';

interface InicioProps {
  onNavigate: (view: ViewId) => void;
}

export default function Inicio({ onNavigate }: InicioProps) {
  const { openModal } = useModal();
  const { showToast } = useToast();

  return (
    <section className="view active" id="inicio">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEU ESPAÇO</p>
          <h1>Uma jornada melhor começa com uma boa companhia.</h1>
          <p className="subtitle">Veja o que está acontecendo na sua semana.</p>
        </div>
        <button className="primary" onClick={() => openModal('encontro')}>
          <Icon name="calendar" />
          Marcar uma reunião
        </button>
      </div>

      <div className="dashboard-grid">
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
            <button className="round-button" onClick={() => showToast('Mensagem aberta com João')}>
              <Icon name="send" />
            </button>
          </div>
        </article>

        <article className="card meeting-card">
          <p className="eyebrow">PRÓXIMO ENCONTRO</p>
          <span className="calendar-chip">
            <strong>29</strong>
            <small>AGO</small>
          </span>
          <div>
            <h2>Conversa de boas-vindas</h2>
            <p>
              <Icon name="clock" /> Sábado · 14:00 — 14:45
            </p>
            <button className="text-button" onClick={() => onNavigate('agenda')}>
              Ver detalhes <Icon name="arrow" />
            </button>
          </div>
        </article>

        <ChecklistCard />
      </div>

      <div className="content-columns">
        <section className="card activity">
          <div className="card-heading">
            <div>
              <p className="eyebrow">ATUALIZAÇÕES</p>
              <h2>Atividade recente</h2>
            </div>
            <button className="text-button" onClick={() => onNavigate('forum')}>
              Ver tudo <Icon name="arrow" />
            </button>
          </div>
          <div className="activity-row">
            <span className="activity-icon green">
              <Icon name="check" />
            </span>
            <div>
              <strong>João respondeu à sua pergunta</strong>
              <p>&ldquo;Materiais para começar em Lógica&rdquo;</p>
              <small>Há 2 horas</small>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-icon orange">
              <Icon name="book" />
            </span>
            <div>
              <strong>Novo aviso no mural</strong>
              <p>Semana de acolhimento aos calouros</p>
              <small>Ontem</small>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-icon purple">
              <Icon name="calendar" />
            </span>
            <div>
              <strong>Encontro confirmado</strong>
              <p>Conversa de boas-vindas com João</p>
              <small>27 de agosto</small>
            </div>
          </div>
        </section>

        <section className="card quick-help">
          <p className="eyebrow">PRECISA DE UMA MÃO?</p>
          <h2>Encontre respostas rápidas</h2>
          <p>Explore dúvidas e dicas compartilhadas por quem já passou pelo começo do curso.</p>
          <button className="outline" onClick={() => onNavigate('forum')}>
            Ir para o fórum <Icon name="arrow" />
          </button>
          <div className="scribble">✦</div>
        </section>
      </div>
    </section>
  );
}

function ChecklistCard() {
  const initial = [
    { label: 'Conhecer seu padrinho', checked: true },
    { label: 'Acessar o guia do campus', checked: true },
    { label: 'Participar do primeiro encontro', checked: false },
    { label: 'Fazer sua primeira pergunta', checked: false },
  ];

  return <ChecklistBody items={initial} />;
}

function ChecklistBody({ items: initialItems }: { items: { label: string; checked: boolean }[] }) {
  const [items, setItems] = useState(initialItems);
  const done = items.filter((i) => i.checked).length;

  return (
    <article className="card checklist">
      <div className="card-heading">
        <div>
          <p className="eyebrow">PRIMEIROS PASSOS</p>
          <h2>Seu progresso</h2>
        </div>
        <strong>
          {done}/{items.length}
        </strong>
      </div>
      <div className="progress">
        <span style={{ width: `${(done / items.length) * 100}%` }}></span>
      </div>
      {items.map((item, i) => (
        <label key={item.label} className={item.checked ? 'checked' : ''}>
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() =>
              setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, checked: !it.checked } : it)))
            }
          />{' '}
          {item.label}
        </label>
      ))}
    </article>
  );
}