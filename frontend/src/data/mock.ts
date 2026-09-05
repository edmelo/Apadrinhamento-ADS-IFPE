import type { Mentor, Topic, Announcement } from '../types';

export const mentors: Mentor[] = [
  {
    name: 'Camila Torres',
    initials: 'CT',
    info: '7º período · Full stack',
    bio: 'Gosto de transformar dúvidas de programação em conversas sem pressão.',
    tags: ['Lógica', 'Java', 'Projetos'],
    avatarClass: 'avatar-purple',
  },
  {
    name: 'Rafael Nunes',
    initials: 'RN',
    info: '5º período · Mobile',
    bio: 'Posso ajudar você a se organizar, entender as disciplinas e perder o medo de perguntar.',
    tags: ['Rotina', 'Kotlin', 'Carreira'],
    avatarClass: 'avatar-orange',
  },
  {
    name: 'Larissa Melo',
    initials: 'LM',
    info: '6º período · Dados',
    bio: 'Se você curte entender como as coisas funcionam, vamos explorar ADS juntos!',
    tags: ['Python', 'Banco de dados', 'Estágio'],
    avatarClass: 'avatar-purple',
  },
];

export const forumCategories = ['Rotina acadêmica', 'Lógica de programação', 'Vida no campus'];

export const topics: Topic[] = [
  {
    title: 'Como funcionam as faltas nas disciplinas?',
    description: 'Tenho receio de já começar acumulando faltas. Existe um limite por disciplina?',
    category: 'Rotina acadêmica',
    replies: '8 respostas',
    time: 'Há 2 h',
    initials: 'LF',
    avatarClass: 'avatar-green',
  },
  {
    title: 'Material para começar em Lógica de Programação',
    description: 'Alguém indica vídeos, livros ou exercícios para acompanhar a disciplina?',
    category: 'Lógica de programação',
    replies: '3 respostas',
    time: 'Há 1 dia',
    initials: 'AS',
    avatarClass: 'avatar-orange',
  },
  {
    title: 'Como encontrar as salas dos laboratórios?',
    description: 'Ainda fico um pouco perdido no campus. Os laboratórios seguem alguma numeração?',
    category: 'Vida no campus',
    replies: '5 respostas',
    time: 'Há 2 dias',
    initials: 'BR',
    avatarClass: 'avatar-green',
  },
];

export const availableTimes = ['09:00', '10:00', '14:00', '15:00', '16:00'];

export const announcements: Announcement[] = [
  {
    title: 'Semana de acolhimento aos calouros',
    content:
      'De 1 a 5 de setembro teremos rodas de conversa presenciais no bloco B para tirar dúvidas sobre o curso.',
    date: '29 de agosto de 2026',
    author: 'Coordenação ADS',
    category: 'Evento',
    featured: true,
  },
  {
    title: 'Novo prazo para trocas de padrinho',
    content: 'Quem quiser trocar de padrinho/madrinha pode solicitar até o dia 10 de setembro pela Administração.',
    date: '27 de agosto de 2026',
    author: 'Coordenação ADS',
    category: 'Aviso',
  },
  {
    title: 'Manutenção nos laboratórios 3 e 4',
    content: 'Os laboratórios ficarão indisponíveis na próxima quinta-feira das 8h às 12h.',
    date: '25 de agosto de 2026',
    author: 'Coordenação ADS',
    category: 'Manutenção',
  },
];

export const tips = [
  {
    emoji: '🗺️',
    title: 'Onde ficam os laboratórios?',
    description: 'Um mapa e atalhos para você não se perder nos primeiros dias.',
    author: 'João Mendes',
  },
  {
    emoji: '📚',
    title: 'Minha rotina de estudos que funciona',
    description: 'Como organizo demandas, prazos e revisão sem enlouquecer.',
    author: 'Larissa Melo',
  },
  {
    emoji: '💼',
    title: 'Primeiro estágio: por onde começar?',
    description: 'Uma lista prática para preparar seu portfólio desde cedo.',
    author: 'Rafael Nunes',
  },
];