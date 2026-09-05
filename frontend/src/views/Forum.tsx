import { useState } from 'react';
import Icon from '../components/Icon';
import { topics, forumCategories } from '../data/mock';
import { useModal } from '../context/ModalContext';

export default function Forum() {
  const { openModal } = useModal();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const filteredTopics =
    activeCategory === 'Todos' ? topics : topics.filter((t) => t.category === activeCategory);

  return (
    <section className="view active" id="forum">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FÓRUM COLABORATIVO</p>
          <h1>Dúvidas compartilhadas, caminhos mais claros.</h1>
          <p className="subtitle">Pergunte, responda e aprenda com a comunidade ADS.</p>
        </div>
        <button className="primary" onClick={() => openModal('pergunta')}>
          <Icon name="plus" />
          Fazer pergunta
        </button>
      </div>

      <div className="forum-layout">
        <div>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Buscar dúvidas, assuntos ou palavras-chave" />
          </div>

          <div className="filter-bar">
            <button
              className={`filter${activeCategory === 'Todos' ? ' active' : ''}`}
              onClick={() => setActiveCategory('Todos')}
            >
              Todos
            </button>
            {forumCategories.map((cat) => (
              <button
                key={cat}
                className={`filter${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="topic-list">
            {filteredTopics.map((t) => (
              <article className="topic" key={t.title}>
                <div className="topic-top">
                  <span className={`avatar ${t.avatarClass}`}>{t.initials}</span>
                  <div>
                    <h2>{t.title}</h2>
                    <span className="pill">{t.category}</span>
                  </div>
                </div>
                <p>{t.description}</p>
                <div className="topic-meta">
                  <span>{t.replies}</span>
                  <span>{t.time}</span>
                </div>
              </article>
            ))}
            {filteredTopics.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                Nenhuma pergunta encontrada nessa categoria ainda.
              </p>
            )}
          </div>
        </div>

        <aside className="forum-side">
          <section className="card author-callout">
            <span className="avatar avatar-orange">MS</span>
            <h3>Compartilhe o que você sabe</h3>
            <p>Sua experiência pode ser a resposta que alguém precisa.</p>
            <button className="outline" onClick={() => openModal('pergunta')}>
              Criar pergunta
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}