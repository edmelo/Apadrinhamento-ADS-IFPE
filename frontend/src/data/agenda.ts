import type { AgendaEvent, EventType, EventStatus } from '../types';

export const MIN_YEAR = 2020;
export const MAX_YEAR = 2050;

export const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const typeMeta: Record<EventType, { label: string; color: string }> = {
  apadrinhamento: { label: 'Encontro de apadrinhamento', color: '#7c5cff' },
  academico: { label: 'Atividade acadêmica', color: '#2f8fef' },
  pessoal: { label: 'Lembrete pessoal', color: '#f0a63a' },
  evento: { label: 'Evento do IFPE', color: '#2fa86a' },
};

export const statusMeta: Record<EventStatus, { label: string; color: string }> = {
  confirmado: { label: 'Confirmado', color: '#2fa86a' },
  aguardando: { label: 'Aguardando confirmação', color: '#d9a52a' },
  agendado: { label: 'Agendado', color: '#2f8fef' },
  concluido: { label: 'Concluído', color: '#8a8a8a' },
  cancelado: { label: 'Cancelado', color: '#c1473f' },
};

export const todayDate = new Date();
export const todayIso = todayDate.toISOString().slice(0, 10);

export function isoOffset(offsetDays: number): string {
  const d = new Date(todayDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function isPast(event: AgendaEvent): boolean {
  return event.date < todayIso || event.status === 'concluido' || event.status === 'cancelado';
}

export function clampYear(year: number) {
  return Math.min(Math.max(year, MIN_YEAR), MAX_YEAR);
}


export const emptyEventForm: Omit<AgendaEvent, 'id'> = {
  date: todayIso,
  time: '14:00',
  title: '',
  type: 'apadrinhamento',
  status: 'agendado',
  mode: 'virtual',
  location: '',
  personName: '',
  description: '',
};

export const initialEvents: AgendaEvent[] = [
  {
    id: '1',
    date: isoOffset(0),
    time: '14:00',
    title: 'Conversa de boas-vindas',
    type: 'apadrinhamento',
    status: 'confirmado',
    mode: 'virtual',
    location: 'https://meet.google.com/exemplo',
    personName: 'João Mendes',
    description: 'Primeira conversa para se conhecerem e alinhar expectativas.',
  },
  {
    id: '2',
    date: isoOffset(0),
    time: '16:00',
    title: 'Revisar material de Lógica',
    type: 'pessoal',
    status: 'agendado',
    mode: 'presencial',
    location: '',
    personName: '',
    description: 'Lembrete pessoal.',
  },
  {
    id: '3',
    date: isoOffset(3),
    time: '10:00',
    title: 'Tirar dúvidas sobre Estruturas de Dados',
    type: 'apadrinhamento',
    status: 'aguardando',
    mode: 'presencial',
    location: 'Bloco B — sala 12',
    personName: 'João Mendes',
    description: '',
  },
  {
    id: '4',
    date: isoOffset(6),
    time: '09:00',
    title: 'Semana de acolhimento aos calouros',
    type: 'evento',
    status: 'confirmado',
    mode: 'presencial',
    location: 'Auditório principal',
    personName: '',
    description: '',
  },
  {
    id: '5',
    date: isoOffset(-4),
    time: '15:00',
    title: 'Conversa sobre rotina de estudos',
    type: 'apadrinhamento',
    status: 'concluido',
    mode: 'virtual',
    location: '',
    personName: 'João Mendes',
    description: '',
  },
];

export interface DayCell {
  key: string;
  label: string;
  date: string | null;
  muted: boolean;
  isToday: boolean;
  events: AgendaEvent[];
}

export function buildMonthGrid(year: number, monthIndex: number, events: AgendaEvent[]): DayCell[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
  const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() === monthIndex;

  const cells: DayCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ key: `prev-${i}`, label: String(daysInPrevMonth - i), date: null, muted: true, isToday: false, events: [] });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      key: `cur-${d}`,
      label: String(d),
      date: dateStr,
      muted: false,
      isToday: isCurrentMonth && todayDate.getDate() === d,
      events: events.filter((e) => e.date === dateStr),
    });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= trailing; d++) {
    cells.push({ key: `next-${d}`, label: String(d), date: null, muted: true, isToday: false, events: [] });
  }
  return cells;
}
