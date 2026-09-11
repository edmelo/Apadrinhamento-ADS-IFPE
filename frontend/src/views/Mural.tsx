import Icon from '../components/Icon';
import { tips } from '../data/mock';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';

export default function Mural() {
  const { openModal } = useModal();
  const { showToast } = useToast();

  return (
    <section className="view active" id="mural">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MURAL DE DICAS</p>
          <h1>O que eu gostaria de ter sabido no início.</h1>
          <p className="subtitle">Guias e recomendações feitos por estudantes, para estudantes.</p>
        </div>
        <button className="primary" onClick={() => openModal('dica')}>
          <Icon name="plus" />
          Compartilhar dica
        </button>
      </div>

      <div className="featured-tip">
        <div>
          <span className="tip-tag">DESTAQUE DA SEMANA</span>
          <h2>Como sobreviver à primeira semana de ADS</h2>
          <p>
            Um guia honesto sobre horários, laboratórios, professores e aquele frio na barriga do
            primeiro dia.
          </p>
          <button className="white-button" onClick={() => showToast('Guia aberto')}>
            Ler guia completo <Icon name="arrow" />
          </button>
        </div>
        <span className="big-emoji">🧭</span>
      </div>

      <div className="mural-grid">
        {tips.map((t) => (
          <article className="card tip-card" key={t.title}>
            <span className="tip-icon">{t.emoji}</span>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
            <footer>
              <span>Por {t.author}</span>
              <span>♡ 12</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
