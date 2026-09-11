import Icon from '../components/Icon';

export default function Notificacoes() {
  return (
    <section className="view active" id="notificacoes">
      <div className="page-heading">
        <div>
          <p className="eyebrow">NOTIFICAÇÕES</p>
          <h1>Suas notificações</h1>
          <p className="subtitle">Acompanhe por aqui as novidades sobre encontros, fórum e avisos.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'var(--surface-muted, #f3f3f3)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="bell" />
        </div>
        <h2 style={{ font: '600 17px Outfit, sans-serif', margin: '0 0 6px' }}>
          Nenhuma notificação por enquanto
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted, #666)', maxWidth: 320, margin: '0 auto' }}>
          Quando houver novidades sobre seus encontros, o fórum ou o mural de avisos, elas vão
          aparecer aqui.
        </p>
      </div>
    </section>
  );
}