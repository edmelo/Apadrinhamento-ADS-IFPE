import { initialEvents, isPast } from './agenda';
import type { ChatConversation, ChatMessage } from '../types';

export const conversations: ChatConversation[] = [
  {
    id: 'joao',
    name: 'João Mendes',
    initials: 'JM',
    avatarClass: 'avatar-purple',
    role: 'Padrinho',
    course: 'Desenvolvimento de Sistemas',
    period: '5º período',
    online: true,
  },
  {
    id: 'maria',
    name: 'Maria Silva',
    initials: 'MS',
    avatarClass: 'avatar-green',
    role: 'Afilhada',
    course: 'ADS',
    period: '1º período',
    online: false,
  },
  {
    id: 'larissa',
    name: 'Larissa Melo',
    initials: 'LM',
    avatarClass: 'avatar-purple',
    role: 'Madrinha',
    course: 'Dados',
    period: '6º período',
    online: true,
  },
  {
    id: 'rafael',
    name: 'Rafael Nunes',
    initials: 'RN',
    avatarClass: 'avatar-orange',
    role: 'Padrinho',
    course: 'Mobile',
    period: '5º período',
    online: false,
  },
  {
    id: 'camila',
    name: 'Camila Torres',
    initials: 'CT',
    avatarClass: 'avatar-purple',
    role: 'Madrinha',
    course: 'Full stack',
    period: '7º período',
    online: true,
  },
  {
    id: 'bruno',
    name: 'Bruno Ramos',
    initials: 'BR',
    avatarClass: 'avatar-green',
    role: 'Afilhado',
    course: 'ADS',
    period: '1º período',
    online: false,
  },
];

export const messagesByConversation: Record<string, ChatMessage[]> = {
  joao: [
    { id: 'm1', sender: 'them', text: 'Oi! Tudo bem?', time: '14:20' },
    { id: 'm2', sender: 'me', text: 'Tudo sim! E você?', time: '14:22' },
    { id: 'm3', sender: 'them', text: 'Queria saber como está sendo seu início no curso.', time: '14:25' },
    { id: 'm4', sender: 'me', text: 'Está sendo tranquilo! Só com uma dúvida em Banco de Dados.', time: '14:30' },
    { id: 'm5', sender: 'them', text: 'Pode me chamar sempre que precisar!', time: '14:32' },
  ],
  maria: [
    { id: 'm1', sender: 'them', text: 'Oi! Como foi a primeira semana?', time: 'Ontem' },
    { id: 'm2', sender: 'me', text: 'Foi corrida, mas deu pra pegar o ritmo aos poucos.', time: 'Ontem' },
    { id: 'm3', sender: 'them', text: 'Até amanhã!', time: 'Ontem' },
  ],
  larissa: [
    { id: 'm1', sender: 'them', text: 'Vi que você entrou no fórum, boa!', time: 'Seg' },
    { id: 'm2', sender: 'me', text: 'Sim! Tirei uma dúvida sobre Banco de Dados por lá.', time: 'Seg' },
    { id: 'm3', sender: 'them', text: 'Qualquer coisa também pode me chamar aqui.', time: 'Seg' },
  ],
  rafael: [
    { id: 'm1', sender: 'me', text: 'Oi Rafael! Tudo bem?', time: 'Sex' },
    { id: 'm2', sender: 'them', text: 'Tudo certo! Bora marcar aquele encontro?', time: 'Sex' },
  ],
  camila: [
    { id: 'm1', sender: 'them', text: 'Como estão os estudos de Lógica?', time: '10:05' },
    { id: 'm2', sender: 'me', text: 'Meio devagar, mas evoluindo!', time: '10:08' },
    { id: 'm3', sender: 'them', text: 'Se quiser, te passo uns exercícios extras.', time: '10:10' },
    { id: 'm4', sender: 'me', text: 'Quero sim, obrigado!', time: '10:11' },
  ],
  bruno: [],
};

/**
 * Busca o próximo encontro de apadrinhamento agendado com uma pessoa específica
 */
export function getNextMeetingWith(personName: string) {
  return initialEvents
    .filter((e) => e.personName === personName && e.type === 'apadrinhamento' && !isPast(e))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
}