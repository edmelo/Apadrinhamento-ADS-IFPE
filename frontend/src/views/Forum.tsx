import { useState } from 'react';
import Icon from '../components/Icon';
import { topics as initialTopics, forumCategories } from '../data/mock';
import { useModal } from '../context/ModalContext';
import type { Topic } from '../types';

export default function Forum() {
  const { openModal } = useModal();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const filteredTopics =
    activeCategory === 'Todos' ? topics : topics.filter((t) => t.category === activeCategory);

  const toggleAnswers = (title: string) => {
    setExpandedTitle((current) => (current === title ? null : title));
  };

  const sendReply = (title: string) => {
    const text = (replyDrafts[title] ?? '').trim();
    if (!text) return;

    setTopics((prev) =>
      prev.map((t) =>
        t.title === title
          ? {
              ...t,
              answers: [
                ...t.answers,
                {
                  id: Date.now().toString(),
                  authorName: 'Usuário',
                  authorInitials: 'US',
                  avatarClass: 'avatar-green',
                  text,
                  time: 'Agora',
                },
              ],
              replies: `${t.answers.length + 1} respostas`,
            }
          : t
      )
    );
    setReplyDrafts((prev) => ({ ...prev, [title]: '' }));
  };

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
            {filteredTopics.map((t) => {
              const isOpen = expandedTitle === t.title;
              return (
                <article className="topic" key={t.title}>
                  <div className="topic-top">
                    <span className={`avatar ${t.avatarClass}`}>{t.initials}</span>
                    <div>
                      <h2>{t.title}</h2>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#849087', marginTop: 2 }}>
                        {t.authorName} · <span className="pill">{t.category}</span>
                      </span>
                    </div>
                  </div>
                  <p>{t.description}</p>

                  <div className="topic-meta">
                    <span>{t.time}</span>
                    <button className="text-button" onClick={() => toggleAnswers(t.title)}>
                      <Icon name="message" />
                      {t.replies}
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--line, #e6e6e6)', marginTop: 14, paddingTop: 14, display: 'grid', gap: 12 }}>
                      {t.answers.length === 0 && (
                        <p style={{ fontSize: 12, color: '#849087' }}>
                          Ainda não há respostas. Seja a primeira pessoa a ajudar!
                        </p>
                      )}
                      {t.answers.map((a) => (
                        <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span className={`avatar ${a.avatarClass}`} style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                            {a.authorInitials}
                          </span>
                          <div style={{ background: 'var(--canvas, #f4f7f5)', borderRadius: 10, padding: '10px 14px', flex: 1 }}>
                            <strong style={{ fontSize: 12.5 }}>{a.authorName}</strong>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#33403a' }}>{a.text}</p>
                            <span style={{ display: 'block', fontSize: 10, color: '#849087', marginTop: 6 }}>{a.time}</span>
                          </div>
                        </div>
                      ))}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendReply(t.title);
                        }}
                        style={{ display: 'flex', gap: 8, marginTop: 4 }}
                      >
                        <input
                          value={replyDrafts[t.title] ?? ''}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t.title]: e.target.value }))}
                          placeholder="Escreva uma resposta..."
                          style={{ flex: 1 }}
                        />
                        <button className="outline" type="submit">
                          Responder
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
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