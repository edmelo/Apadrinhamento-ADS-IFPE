import type { FaqSection } from '../types';

const faqSections: FaqSection[] = [
  {
    title: 'Sobre o programa',
    items: [
      {
        question: 'O que é o Apadrinhamento ADS?',
        answer:
          'É um espaço criado para aproximar estudantes que estão iniciando o curso de ADS de alunos de períodos mais avançados, facilitando a adaptação à faculdade e à rotina acadêmica.',
      },
      {
        question: 'Quem pode participar?',
        answer:
          'Estudantes de ADS podem participar como afilhados ou padrinhos, de acordo com o período e os critérios definidos pelo programa.',
      },
      {
        question: 'O que faz um padrinho?',
        answer:
          'O padrinho oferece orientação e apoio ao afilhado, compartilhando experiências sobre disciplinas, estudos, projetos, professores, estágio e vida acadêmica.',
      },
      {
        question: 'O que faz um afilhado?',
        answer:
          'O afilhado pode tirar dúvidas, conversar com seu padrinho, participar dos encontros e aproveitar as experiências compartilhadas para se adaptar melhor ao curso.',
      },
    ],
  },
  {
    title: 'Padrinhos e afilhados',
    items: [
      {
        question: 'Como encontro um padrinho?',
        answer:
          'Na seção "Encontrar padrinho", você pode visualizar os padrinhos disponíveis e escolher alguém de acordo com seus interesses, área de conhecimento e disponibilidade.',
      },
      {
        question: 'Posso escolher meu padrinho?',
        answer:
          'Sim. O sistema permite que o estudante demonstre interesse em um padrinho disponível. A solicitação poderá ser analisada e confirmada conforme as regras do programa.',
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
        answer:
          'Não necessariamente. Os encontros podem acontecer presencialmente ou por videochamada, dependendo da disponibilidade dos participantes.',
      },
    ],
  },
  {
    title: 'Encontros e agenda',
    items: [
      {
        question: 'Como agendo um encontro?',
        answer:
          'Acesse a seção "Agenda" e selecione a opção para criar um novo encontro. Escolha uma data, horário e assunto para a conversa.',
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
        answer:
          'O fórum permite que estudantes façam perguntas e compartilhem respostas sobre disciplinas, programação, estágio, rotina acadêmica e outros assuntos relacionados ao curso.',
      },
      {
        question: 'Quem pode responder às perguntas?',
        answer: 'Qualquer estudante participante da comunidade pode contribuir, desde que respeite as regras de convivência.',
      },
      {
        question: 'Posso fazer qualquer pergunta?',
        answer:
          'Você pode perguntar sobre assuntos relacionados à experiência acadêmica e ao curso. Conteúdos ofensivos, discriminatórios ou inadequados não são permitidos.',
      },
      {
        question: 'Posso responder uma pergunta mesmo não sendo padrinho?',
        answer: 'Sim. O fórum é colaborativo e permite que outros estudantes compartilhem seus conhecimentos e experiências.',
      },
    ],
  },
];

export default function Faq() {
  return (
    <section className="view active" id="faq">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AJUDA</p>
          <h1>FAQ — Perguntas Frequentes</h1>
          <p className="subtitle">Tudo o que você precisa saber sobre o Apadrinhamento ADS.</p>
        </div>
      </div>

      {faqSections.map((section) => (
        <section key={section.title} className="card" style={{ marginBottom: 18 }}>
          <h2 style={{ font: '600 16px Outfit, sans-serif', margin: '0 0 14px' }}>{section.title}</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {section.items.map((item) => (
              <details
                key={item.question}
                style={{
                  border: '1px solid var(--border, #e6e6e6)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  {item.question}
                </summary>
                <p style={{ fontSize: 13, marginTop: 8, marginBottom: 2, color: 'var(--muted, #666)' }}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}