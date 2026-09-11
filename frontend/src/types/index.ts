export type ViewId =
  | 'inicio'
  | 'encontrar'
  | 'agenda'
  | 'chat'
  | 'forum'
  | 'avisos'
  | 'admin'
  | 'perfil'
  | 'login'
  | 'cadastro'
  | 'faq'
  | 'notificacoes';

export interface Mentor {
  name: string;
  initials: string;
  info: string;
  bio: string;
  tags: string[];
  avatarClass: 'avatar-orange' | 'avatar-purple';
}

export interface Topic {
  title: string;
  description: string;
  category: string;
  replies: string;
  time: string;
  initials: string;
  avatarClass: 'avatar-orange' | 'avatar-green';
}

export interface Announcement {
  title: string;
  content: string;
  date: string;
  author: string;
  category: string;
  featured?: boolean;
}

export type MeetingType = 'presencial' | 'virtual';

export interface ModalConfig {
  kind: 'encontro' | 'pergunta' | 'aviso' | 'excluir-conta' | 'editar-perfil';
  onConfirm?: () => void;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

/* TIPOS DA AGENDA */

export type EventType = 'apadrinhamento' | 'academico' | 'pessoal' | 'evento';

export type EventStatus = 'confirmado' | 'aguardando' | 'agendado' | 'concluido' | 'cancelado';

export type EventMode = MeetingType;

export interface AgendaEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: EventType;
  status: EventStatus;
  mode: EventMode;
  location: string;
  personName: string;
  description: string;
}

/* CHAT */

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  initials: string;
  avatarClass: 'avatar-purple' | 'avatar-green' | 'avatar-orange';
  role: string;
  course: string;
  period: string;
  online: boolean;
}