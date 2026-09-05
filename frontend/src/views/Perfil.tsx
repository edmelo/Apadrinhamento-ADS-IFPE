import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import type { ViewId } from '../types';

interface PerfilProps {
  onNavigate: (view: ViewId) => void;
}

export default function Perfil({ onNavigate }: PerfilProps) {
  const { showToast } = useToast();
  const { openModal } = useModal();

  return (
    <section className="view active" id="perfil">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEU PERFIL</p>
          <h1>Conte um pouco sobre você.</h1>
          <p className="subtitle">Essas informações ajudam a tornar o apadrinhamento mais proveitoso.</p>
        </div>
      </div>

      <form
        className="profile-form card"
        onSubmit={(e) => {
          e.preventDefault();
          showToast('Perfil atualizado com sucesso!');
        }}
      >
        <div className="profile-head">
          <span className="avatar avatar-green profile-avatar">US</span>
          <div>
            <h2>Usuário</h2>
            <p>usuario@discente.ifpe.edu.br</p>
          </div>
          <button type="button" className="outline">
            Alterar foto
          </button>
        </div>

        <div className="form-grid">
          <label>
            Nome completo
            <input defaultValue="Usuário" required />
          </label>
          <label>
            Período
            <select defaultValue="1º período">
              <option>1º período</option>
              <option>2º período</option>
            </select>
          </label>
          <label>
            Interesses
            <input defaultValue="Lógica, front-end e organização" />
          </label>
          <label>
            Disponibilidade
            <select defaultValue="Tardes durante a semana">
              <option>Tardes durante a semana</option>
              <option>Manhãs durante a semana</option>
              <option>Noites</option>
            </select>
          </label>
        </div>

        <label>
          O que você espera do apadrinhamento?
          <textarea defaultValue="Quero me organizar melhor para o início do curso e conhecer mais sobre as disciplinas." />
        </label>

        <div className="form-actions">
          <button type="button" className="outline">
            Cancelar
          </button>
          <button className="primary" type="submit">
            Salvar alterações
          </button>
        </div>
      </form>

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