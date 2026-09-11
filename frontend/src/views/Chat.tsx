import { useState } from 'react';
import Icon from '../components/Icon';
import {
  ConversationList,
  ChatBubble,
  NextMeetingBanner,
  ContactInfoPanel,
} from '../components/ChatComponents';
import { conversations, messagesByConversation, getNextMeetingWith } from '../data/chat';
import { formatDateLabel } from '../data/agenda';
import type { ChatMessage, ViewId } from '../types';

interface ChatProps {
  onNavigate: (view: ViewId) => void;
}

export default function Chat({ onNavigate }: ChatProps) {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(messagesByConversation);
  const [draft, setDraft] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId)!;
  const activeMessages = messages[activeId] ?? [];
  const lastMessages = Object.fromEntries(
    conversations.map((c) => [c.id, messages[c.id]?.[messages[c.id].length - 1]])
  );

  const nextMeeting = getNextMeetingWith(activeConversation.name);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: draft.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newMessage] }));
    setDraft('');
  };

  // Ao trocar de conversa, fecha o painel de informações da conversa anterior
  const selectConversation = (id: string) => {
    setActiveId(id);
    setShowInfo(false);
  };

  return (
    <section className="view active" id="chat">
      <div className="page-heading" style={{ marginBottom: 16 }}>
        <div>
          <p className="eyebrow">CHAT</p>
          <h1>Converse com seu padrinho.</h1>
          <p className="subtitle">Acompanhe suas conversas e combine os próximos encontros por aqui.</p>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: 0, display: 'flex', height: 'calc(100vh - 260px)', minHeight: 420, maxHeight: 640, overflow: 'hidden' }}
      >
        <div style={{ flexBasis: '30%', minWidth: 260, maxWidth: 340, display: 'flex' }}>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            search={search}
            onSearchChange={setSearch}
            onSelect={selectConversation}
            lastMessages={lastMessages}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid #e6e6e6',
            }}
          >
            <button
              onClick={() => setShowInfo(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span className={`avatar ${activeConversation.avatarClass}`}>{activeConversation.initials}</span>
              <span style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: 14 }}>{activeConversation.name}</strong>
                <small style={{ fontSize: 12, color: activeConversation.online ? '#2fa86a' : '#999' }}>
                  {activeConversation.online ? '● Online' : 'Offline'}
                </small>
              </span>
            </button>
            <button
              onClick={() => setShowInfo((v) => !v)}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              aria-label="Informações do contato"
            >
              <Icon name="more" />
            </button>
          </div>

          {nextMeeting && (
            <div style={{ paddingTop: 12 }}>
              <NextMeetingBanner
                title={nextMeeting.title}
                dateLabel={`${formatDateLabel(nextMeeting.date)} · ${nextMeeting.time}`}
                onViewAgenda={() => onNavigate('agenda')}
              />
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px' }}>
            {activeMessages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            {activeMessages.length === 0 && (
              <p style={{ fontSize: 13, color: '#777', textAlign: 'center', marginTop: 40 }}>
                Envie a primeira mensagem para {activeConversation.name}.
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid #e6e6e6' }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Digite uma mensagem..."
              style={{ flex: 1 }}
            />
            <button className="primary" type="submit" aria-label="Enviar">
              <Icon name="send" />
            </button>
          </form>
        </div>

        {showInfo && (
          <ContactInfoPanel
            conversation={activeConversation}
            nextMeetingLabel={nextMeeting ? `${formatDateLabel(nextMeeting.date)} · ${nextMeeting.time}` : undefined}
            onClose={() => setShowInfo(false)}
            onViewProfile={() => onNavigate('perfil')}
            onViewAgenda={() => onNavigate('agenda')}
          />
        )}
      </div>
    </section>
  );
}