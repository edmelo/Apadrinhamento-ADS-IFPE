import { useState } from 'react';
import Icon from '../components/Icon';
import { mentors } from '../data/mock';
import { useToast } from '../context/ToastContext';

const filters = ['Todos', 'Lógica e programação', 'Carreira', 'Rotina acadêmica'];

export default function Encontrar() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const { showToast } = useToast();

  return (
    <section className="view active" id="encontrar">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONEXÕES</p>
          <h1>Encontre o padrinho ideal para você.</h1>
          <p className="subtitle">Escolha alguém que combine com seus interesses e disponibilidade.</p>
        </div>
      </div>

      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
        <button className="filter">
          <Icon name="sliders" /> Filtros
        </button>
      </div>

      <div className="mentor-grid">
        {mentors.map((m) => (
          <article className="card mentor-card" key={m.name}>
            <div className="mentor-person">
              <span className={`avatar ${m.avatarClass} large`}>{m.initials}</span>
              <div>
                <h2>{m.name}</h2>
                <p className="course">{m.info}</p>
              </div>
            </div>
            <p className="bio">{m.bio}</p>
            <div className="pills">
              {m.tags.map((tag) => (
                <span className="pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="mentor-actions">
              <button className="outline" onClick={() => showToast(`Perfil de ${m.name} aberto`)}>
                Ver perfil
              </button>
              <button
                className="primary"
                onClick={() => showToast(`Solicitação enviada para ${m.name}!`)}
              >
                Solicitar apadrinhamento
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}