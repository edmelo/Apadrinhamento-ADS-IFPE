export type ViewId =
| 'inicio'
| 'encontrar'
| 'agenda'
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

export interface Tip {
emoji: string;
title: string;
description: string;
author: string;
}

export type MeetingType = 'presencial' | 'virtual';

export interface ModalConfig {
kind:
| 'encontro'
| 'pergunta'
| 'dica'
| 'aviso'
| 'excluir-conta';

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
