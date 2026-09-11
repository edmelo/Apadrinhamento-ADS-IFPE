import { useState } from 'react';
import Icon from '../components/Icon';
import type { FaqSection } from '../types';

const faqSections: FaqSection[] = [
  {
    title: 'Sobre o programa',
    items: [
      {
        question: 'O que é o Apadrinhamento ADS?',
        answer: 'É um espaço criado para aproximar estudantes que estão iniciando o curso de ADS de alunos de períodos mais avançados, facilitando a adaptação à faculdade e à rotina acadêmica.',
      },
      {
        question: 'Quem pode participar?',
        answer: 'Estudantes de ADS podem participar como afilhados ou padrinhos, de acordo com o período e os critérios definidos pelo programa.',
      },
      {
        question: 'O que faz um padrinho?',
        answer: 'O padrinho oferece orientação e apoio ao afilhado, compartilhando experiências sobre disciplinas, estudos, projetos, professores, estágio e vida acadêmica.',
      },
      {
        question: 'O que faz um afilhado?',
        answer: 'O afilhado pode tirar dúvidas, conversar com seu padrinho, participar dos encontros e aproveitar as experiências compartilhadas para se adaptar melhor ao curso.',
      },
    ],
  },
  {
    title: 'Padrinhos e afilhados',
    items: [
      {
        question: 'Como encontro um padrinho?',
        answer: 'Na seção "Encontrar padrinho", você pode visualizar os padrinhos disponíveis e escolher alguém de acordo com seus interesses, área de conhecimento e disponibilidade.',
      },
      {
        question: 'Posso escolher meu padrinho?',
        answer: 'Sim. O sistema permite que o estudante demonstre interesse em um padrinho disponível. A solicitação poderá ser analisada e confirmada conforme as regras do programa.',
      },
      {
        question: 'Posso trocar de padrinho?',
        answer: 'Caso o vínculo não esteja funcionando bem, o estudante poderá solicitar uma troca à administração do programa.',
      },
      {
        question: 'Posso ser padrinho e afilhado ao mesmo tempo?',
        answer: 'Isso depende das regras estabelecidas pela coordenação do programa e do período em que o estudante se encontra.',
      },
      {
        question: 'Preciso conhecer meu padrinho pessoalmente?',
        answer: 'Não necessariamente. Os encontros podem acontecer presencialmente ou por videochamada, dependendo da disponibilidade dos participantes.',
      },
    ],
  },
  {
    title: 'Encontros e agenda',
    items: [
      {
        question: 'Como agendo um encontro?',
        answer: 'Acesse a seção "Agenda" e selecione a opção para criar um novo encontro. Escolha uma data, horário e assunto para a conversa.',
      },
      {
        question: 'Posso cancelar ou alterar um encontro?',
        answer: 'Sim. Caso seja necessário, o encontro poderá ser alterado ou cancelado, de acordo com as funcionalidades disponíveis no sistema.',
      },
      {
        question: 'Onde encontro meus próximos encontros?',
        answer: 'Eles ficam disponíveis na seção "Agenda" e também podem aparecer como destaque na página inicial.',
      },
      {
        question: 'O que acontece se eu não puder comparecer?',
        answer: 'É recomendado avisar o padrinho ou afilhado com antecedência para que o encontro possa ser remarcado.',
      },
    ],
  },
  {
    title: 'Fórum',
    items: [
      {
        question: 'Para que serve o fórum?',
        answer: 'O fórum permite que estudantes façam perguntas e compartilhem respostas sobre disciplinas, programação, estágio, rotina acadêmica e outros assuntos relacionados ao curso.',
      },
      {
        question: 'Quem pode responder às perguntas?',
        answer: 'Qualquer estudante participante da comunidade pode contribuir, desde que respeite as regras de convivência.',
      },
      {
        question: 'Posso fazer qualquer pergunta?',
        answer: 'Você pode perguntar sobre assuntos relacionados à experiência acadêmica e ao curso. Conteúdos ofensivos, discriminatórios ou inadequados não são permitidos.',
      },
      {
        question: 'Posso responder uma pergunta mesmo não sendo padrinho?',
        answer: 'Sim. O fórum é colaborativo e permite que outros estudantes compartilhem seus conhecimentos e experiências.',
      },
    ],
  },
];

// 1. Planificamos (juntamos) todos os itens para ficar igual ao formato de "feed" do fórum
const allFaqs = faqSections.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    category: section.title,
  }))
);

// 2. Extraímos as categorias para criar os botões (pills) de filtro
const categories = ['Todos', ...faqSections.map((s) => s.title)];

// Função para gerar uma cor de avatar combinando com a categoria
const getAvatarStyle = (category: string) => {
  switch (category) {
    case 'Sobre o programa': return { bg: '#e8f5ed', color: '#166534', initials: 'SP' };
    case 'Padrinhos e afilhados': return { bg: '#fff0e6', color: '#c2410c', initials: 'PA' };
    case 'Encontros e agenda': return { bg: '#e0f2fe', color: '#0369a1', initials: 'EA' };
    case 'Fórum': return { bg: '#f3e8ff', color: '#7e22ce', initials: 'FO' };
    default: return { bg: '#f3f4f6', color: '#4b5563', initials: '??' };
  }
};

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Lógica para filtrar as dúvidas por texto e por categoria
  const filteredFaqs = allFaqs.filter((faq) => {
    const textLower = searchTerm.toLowerCase();
    const matchesSearch =
      faq.question.toLowerCase().includes(textLower) ||
      faq.answer.toLowerCase().includes(textLower);
    
    const matchesCategory = activeCategory === 'Todos' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="view active" id="faq">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AJUDA</p>
          <h1>FAQ — Perguntas Frequentes.</h1>
          <p className="subtitle">Tudo o que você precisa saber sobre o Apadrinhamento ADS.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* LADO ESQUERDO: Busca, Filtros e Lista de Perguntas */}
        <div style={{ flex: '1 1 600px' }}>
          
          {/* Barra de Pesquisa */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: '#fff', 
              border: '1px solid var(--border, #e6e6e6)', 
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginBottom: '16px' 
            }}
          >
            <Icon name="search" />
            <input
              type="text"
              placeholder="Buscar dúvidas, assuntos ou palavras-chave"
              style={{ border: 'none', outline: 'none', width: '100%', marginLeft: '12px', fontSize: '15px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Botões de Filtro (Pills) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: isActive ? '1px solid #bbf7d0' : '1px solid var(--border, #e6e6e6)',
                    background: isActive ? '#e8f5ed' : 'transparent',
                    color: isActive ? '#166534' : 'var(--muted, #666)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Cards de FAQ estilo Fórum */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredFaqs.map((faq, i) => {
              const avatar = getAvatarStyle(faq.category);
              return (
                <div key={i} className="card" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
                  
                  {/* Avatar Colorido (Iniciais da Categoria) */}
                  <div 
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: avatar.bg, color: avatar.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '13px'
                    }}
                  >
                    {avatar.initials}
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: 'var(--text-main, #112417)' }}>
                      {faq.question}
                    </h3>
                    <span 
                      style={{
                        display: 'inline-block', padding: '4px 8px', background: '#f5f5f5', border: '1px solid #ebebeb',
                        color: 'var(--muted, #666)', borderRadius: '12px', fontSize: '11px', marginBottom: '12px', fontWeight: 500
                      }}
                    >
                      {faq.category}
                    </span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#556b5d', lineHeight: '1.6' }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Mensagem caso a busca não encontre nada */}
            {filteredFaqs.length === 0 && (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted, #666)' }}>
                Nenhuma pergunta encontrada para "{searchTerm}".
              </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: Card Auxiliar (Estilo "Compartilhe o que você sabe") */}
        <aside style={{ width: 'min(100%, 320px)' }}>
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center', background: '#f9fafa' }}>
            <div 
              style={{
                width: '48px', height: '48px', borderRadius: '50%', background: '#fff0e6', color: '#c2410c',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 16px', fontSize: '18px'
              }}
            >
              ?
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Ainda tem dúvidas?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--muted, #666)', lineHeight: '1.5' }}>
              Se você não encontrou o que procurava, mande uma mensagem direta para a coordenação do programa.
            </p>
            <button className="outline" style={{ width: '100%', justifyContent: 'center' }}>
              Falar com suporte
            </button>
          </div>
        </aside>

      </div>
    </section>
  );
}