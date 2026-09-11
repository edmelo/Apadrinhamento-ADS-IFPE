import Icon from './Icon';
import type { ChatConversation, ChatMessage } from '../types';

/* ConversationList */

interface ConversationListProps {
  conversations: ChatConversation[];
  activeId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  lastMessages: Record<string, ChatMessage | undefined>;
}

export function ConversationList({
  conversations,
  activeId,
  search,
  onSearchChange,
  onSelect,
  lastMessages,
}: ConversationListProps) {
  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ borderRight: '1px solid #e6e6e6', display: 'flex', flexDirection: 'column', minWidth: 240 }}>
      <div className="search" style={{ margin: 12 }}>
        <Icon name="search" />
        <input
          placeholder="Buscar conversas"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div style={{ overflowY: 'auto' }}>
        {filtered.map((c) => {
          const last = lastMessages[c.id];
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                background: isActive ? '#f1f6f2' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid #2fa86a' : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ position: 'relative' }}>
                <span className={`avatar ${c.avatarClass}`}>{c.initials}</span>
                {c.online && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: '#2fa86a',
                      border: '2px solid #fff',
                    }}
                  />
                )}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ display: 'block', fontSize: 13 }}>{c.name}</strong>
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: '#777',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {last ? (last.sender === 'me' ? 'Você: ' : '') + last.text : 'Nenhuma mensagem ainda'}
                </span>
              </span>
              {last && <small style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>{last.time}</small>}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: '#777', padding: '0 14px' }}>Nenhuma conversa encontrada.</p>
        )}
      </div>
    </div>
  );
}

/* ChatBubble */

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const mine = message.sender === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div
        style={{
          maxWidth: '70%',
          background: mine ? '#2fa86a' : '#f1f1f1',
          color: mine ? '#fff' : '#222',
          padding: '9px 13px',
          borderRadius: 14,
          borderBottomRightRadius: mine ? 4 : 14,
          borderBottomLeftRadius: mine ? 14 : 4,
          fontSize: 13.5,
        }}
      >
        <p style={{ margin: 0 }}>{message.text}</p>
        <span style={{ display: 'block', fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
          {message.time}
        </span>
      </div>
    </div>
  );
}

/* NextMeetingBanner */

interface NextMeetingBannerProps {
  title: string;
  dateLabel: string;
  onViewAgenda: () => void;
}

export function NextMeetingBanner({ title, dateLabel, onViewAgenda }: NextMeetingBannerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: '#f1f6f2',
        border: '1px solid #d9ece0',
        borderRadius: 10,
        padding: '10px 14px',
        margin: '0 16px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="calendar" />
        <div>
          <strong style={{ fontSize: 13, display: 'block' }}>{title}</strong>
          <small style={{ fontSize: 12, color: '#666' }}>{dateLabel}</small>
        </div>
      </div>
      <button className="text-button" onClick={onViewAgenda}>
        Ver na agenda <Icon name="arrow" />
      </button>
    </div>
  );
}

/* ContactInfoPanel */

interface ContactInfoPanelProps {
  conversation: ChatConversation;
  nextMeetingLabel?: string;
  onClose: () => void;
  onViewProfile: () => void;
  onViewAgenda: () => void;
}

export function ContactInfoPanel({
  conversation,
  nextMeetingLabel,
  onClose,
  onViewProfile,
  onViewAgenda,
}: ContactInfoPanelProps) {
  return (
    <aside style={{ width: 240, borderLeft: '1px solid #e6e6e6', padding: 20, textAlign: 'center', flexShrink: 0 }}>
      <button
        onClick={onClose}
        style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}
        aria-label="Fechar"
      >
        <Icon name="x" />
      </button>
      <span className={`avatar ${conversation.avatarClass} large`} style={{ margin: '20px auto 10px' }}>
        {conversation.initials}
      </span>
      <h3 style={{ margin: '0 0 2px' }}>{conversation.name}</h3>
      <p style={{ fontSize: 12, color: '#777', margin: '0 0 10px' }}>{conversation.role}</p>
      <p style={{ fontSize: 12, margin: '0 0 2px' }}>{conversation.period}</p>
      <p style={{ fontSize: 12, color: '#777', margin: '0 0 14px' }}>{conversation.course}</p>

      <span className="status" style={{ display: 'inline-flex', marginBottom: 18 }}>
        <b></b>
        {conversation.online ? 'Disponível' : 'Offline'}
      </span>

      {nextMeetingLabel && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 14, marginBottom: 14, textAlign: 'left' }}>
          <p className="eyebrow">PRÓXIMO ENCONTRO</p>
          <p style={{ fontSize: 13, margin: 0 }}>{nextMeetingLabel}</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        <button className="outline" onClick={onViewProfile}>Ver perfil</button>
        <button className="outline" onClick={onViewAgenda}>Ver agenda</button>
      </div>
    </aside>
  );
}