import Icon from '../components/Icon';
import { announcements } from '../data/mock';
import { useModal } from '../context/ModalContext';

export default function Avisos() {
  const { openModal } = useModal();
  const featured = announcements.find((a) => a.featured);
  const rest = announcements.filter((a) => !a.featured);

  return (
    <section className="view active" id="avisos">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MURAL DE AVISOS</p>
          <h1>Fique por dentro do que está acontecendo.</h1>
          <p className="subtitle">Comunicados da coordenação e da organização do apadrinhamento.</p>
        </div>
        <button className="primary" onClick={() => openModal('aviso')}>
          <Icon name="plus" />
          Publicar aviso
        </button>
      </div>

      {featured && (
        <div className="featured-tip">
          <div>
            <span className="tip-tag">DESTAQUE DA SEMANA</span>
            <h2>{featured.title}</h2>
            <p>{featured.content}</p>
          </div>
          <span className="big-emoji">📌</span>
        </div>
      )}

      <div className="mural-grid">
        {rest.map((a) => (
          <article className="card tip-card" key={a.title}>
            <span className="tip-icon">📢</span>
            <h2>{a.title}</h2>
            <p>{a.content}</p>
            <footer>
              <span>Por {a.author}</span>
              <span>{a.date}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}