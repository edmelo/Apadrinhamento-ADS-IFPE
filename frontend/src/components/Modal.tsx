import { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { availableTimes } from '../data/mock';
import type { MeetingType } from '../types';
import Icon from './Icon';

export default function Modal() {
  const { modal, closeModal } = useModal();
  const { showToast } = useToast();
  const [meetingType, setMeetingType] = useState<MeetingType>('presencial');

  if (!modal) return null;

  const handleSubmit = (successMessage: string) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    closeModal();
    showToast(successMessage);
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <section className="modal">
        <button className="modal-close" aria-label="Fechar" onClick={closeModal}>
          <Icon name="x" />
        </button>
        <div id="modal-content">
          {modal.kind === 'encontro' && (
            <form onSubmit={handleSubmit('Encontro solicitado com sucesso!')}>
              <h2>Agendar encontro</h2>
              <p>Envie uma sugestão de horário para João.</p>

              <label>
                Tipo de encontro
                <select value={meetingType} onChange={(e) => setMeetingType(e.target.value as MeetingType)}>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual (Google Meet)</option>
                </select>
              </label>

              {meetingType === 'virtual' && (
                <p style={{ margin: '-6px 0 12px', fontSize: 12 }}>
                  Um link do Google Meet será gerado automaticamente e enviado para os dois assim
                  que o encontro for confirmado.
                </p>
              )}

              <label>
                Data
                <input type="date" defaultValue="2026-08-29" />
              </label>
              <label>
                Horário disponível
                <select>
                  {availableTimes.map((time) => (
                    <option key={time}>{time}</option>
                  ))}
                </select>
              </label>
              <label>
                Assunto
                <input placeholder="Ex.: tirar dúvidas sobre Lógica" />
              </label>
              <button className="primary" type="submit">
                Enviar convite
              </button>
            </form>
          )}

          {modal.kind === 'pergunta' && (
            <form onSubmit={handleSubmit('Pergunta publicada no fórum!')}>
              <h2>Fazer uma pergunta</h2>
              <p>A comunidade está aqui para ajudar.</p>
              <label>
                Título
                <input placeholder="Qual é a sua dúvida?" />
              </label>
              <label>
                Categoria
                <select>
                  <option>Lógica de programação</option>
                  <option>Rotina acadêmica</option>
                  <option>Vida no campus</option>
                </select>
              </label>
              <label>
                Detalhes
                <textarea placeholder="Conte um pouco mais..." />
              </label>
              <button className="primary" type="submit">
                Publicar pergunta
              </button>
            </form>
          )}

          {modal.kind === 'aviso' && (
            <form onSubmit={handleSubmit('Aviso publicado no mural!')}>
              <h2>Publicar aviso</h2>
              <p>Visível para todos os estudantes cadastrados.</p>
              <label>
                Título
                <input placeholder="Ex.: Manutenção no laboratório 2" />
              </label>
              <label>
                Categoria
                <select>
                  <option>Aviso</option>
                  <option>Evento</option>
                  <option>Manutenção</option>
                </select>
              </label>
              <label>
                Conteúdo
                <textarea placeholder="Detalhe o aviso..." />
              </label>
              <button className="primary" type="submit">
                Publicar aviso
              </button>
            </form>
          )}

          {modal.kind === 'editar-perfil' && (
            <form onSubmit={handleSubmit('Perfil atualizado com sucesso!')}>
              <h2>Editar perfil</h2>
              <p>Essas informações ajudam a tornar o apadrinhamento mais proveitoso.</p>

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
              <label>
                O que você espera do apadrinhamento?
                <textarea defaultValue="Quero me organizar melhor para o início do curso e conhecer mais sobre as disciplinas." />
              </label>

              <div className="form-actions">
                <button type="button" className="outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="primary" type="submit">
                  Salvar alterações
                </button>
              </div>
            </form>
          )}

          {modal.kind === 'excluir-conta' && (
            <div>
              <h2>Excluir sua conta</h2>
              <p>
                Essa ação é permanente. Você perderá o histórico de encontros, mensagens e o
                vínculo com seu padrinho/madrinha. Tem certeza que deseja continuar?
              </p>
              <div className="form-actions">
                <button className="outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button
                  className="primary"
                  style={{ background: '#b23b3b' }}
                  onClick={() => {
                    closeModal();
                    showToast('Conta excluída com sucesso.');
                    modal.onConfirm?.();
                  }}
                >
                  Sim, excluir conta
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}