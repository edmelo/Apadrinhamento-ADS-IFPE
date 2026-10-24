# Guia de estudos, implementação e trabalho em equipe

## Apadrinhamento ADS IFPE

**Finalidade:** orientar uma equipe de cinco estudantes na compreensão,
evolução e apresentação do projeto acadêmico.

**Documento relacionado:** [Documentação do projeto](documentacao-projeto.md)  
**Execução rápida:** [README](../README.md)

---

## 1. Visão geral do projeto

O Apadrinhamento ADS IFPE é uma plataforma para aproximar estudantes
ingressantes (**afilhados**) e estudantes veteranos (**padrinhos**). O MVP
permite criar contas, autenticar usuários, completar perfis, solicitar e
aceitar vínculos, agendar encontros, publicar perguntas e respostas, consultar
dicas e registrar avaliações.

O sistema está organizado em três partes:

```text
Navegador
   ↓
Frontend HTML + CSS + JavaScript
   ↓  HTTP/JSON em /api
API Java 21 + Spring Boot + Spring Security
   ↓
H2 (desenvolvimento) ou PostgreSQL (Docker)
```

### 1.1 Tecnologias que devem ser estudadas

| Área | Tecnologias | O que a equipe deve compreender |
|---|---|---|
| Interface | HTML5, CSS3, JavaScript, Fetch API | DOM, eventos, responsividade, consumo de API e armazenamento do token |
| Backend | Java 21, Spring Boot, Spring Web | Injeção de dependências, controllers, DTOs, validação e tratamento de erros |
| Persistência | Spring Data JPA, Hibernate, H2 e PostgreSQL | Entidades, relacionamentos, repositórios e ciclo de vida dos dados |
| Segurança | Spring Security, OAuth2 Resource Server e JWT | Autenticação, autorização por papel, token e proteção de rotas |
| Operação | Docker Compose, Nginx e AWS EC2 | Containers, variáveis de ambiente, proxy reverso e publicação |
| Qualidade | JUnit 5 e Spring Boot Test | Testes de integração, cenários de negócio e regressão |
| Colaboração | Git e GitHub | Branches, pull requests, revisão e histórico de alterações |

---

## 2. Objetivos de aprendizagem

Ao final do trabalho, cada integrante deve conseguir:

1. Explicar o problema, os usuários e o fluxo principal do sistema.
2. Executar o projeto localmente e com Docker Compose.
3. Descrever a comunicação entre frontend, API e banco de dados.
4. Implementar uma alteração pequena de forma independente.
5. Criar ou alterar um teste para uma regra de negócio.
6. Identificar riscos básicos de segurança, especialmente em autenticação e
   dados sensíveis.
7. Revisar uma contribuição de outro integrante e justificar decisões
   técnicas.
8. Demonstrar o sistema com dados de teste e explicar suas limitações.

O trabalho não deve ser dividido de modo que cada pessoa conheça somente uma
parte. Cada integrante terá uma responsabilidade principal, mas todos deverão
participar das revisões e estudar o fluxo completo.

---

## 3. Guia de estudos por etapas

### Etapa 1 — Entendimento do problema e do código

**Estudar**

- problema de integração de ingressantes;
- perfis de afilhado, padrinho e administrador;
- fluxo de cadastro, login, vínculo, encontro e avaliação;
- estrutura dos diretórios `frontend/`, `backend/` e `docs/`;
- endpoints descritos no README.

**Praticar**

- desenhar o fluxo principal em uma folha ou ferramenta de diagramas;
- executar o sistema e registrar a sequência de chamadas feitas pelo navegador;
- localizar uma entidade, seu repositório, serviço, controller e tela
  correspondente.

**Resultado esperado:** todos conseguem explicar o caminho de uma operação
completa, por exemplo: “solicitar apadrinhamento”.

### Etapa 2 — Fundamentos do backend

**Estudar**

- classes de domínio em `backend/src/main/java/.../domain`;
- repositórios Spring Data;
- camada de serviço e regras de negócio;
- DTOs de entrada e saída;
- validação com `jakarta.validation`;
- respostas HTTP e tratamento de exceções.

**Praticar**

- adicionar uma validação a um request;
- acompanhar uma requisição desde o controller até o repositório;
- escrever um teste para um caso de sucesso e um caso inválido.

### Etapa 3 — Banco de dados e segurança

**Estudar**

- entidades `UserAccount`, `Mentorship`, `Meeting`, `Question`, `Answer`,
  `Tip` e `Review`;
- relacionamentos e estados (`PENDENTE`, `ATIVO`, entre outros);
- diferença entre H2 local e PostgreSQL;
- JWT, `Authorization: Bearer` e papéis `AFILHADO`, `PADRINHO` e `ADMIN`;
- variáveis `JWT_SECRET`, `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`.

**Praticar**

- observar as tabelas criadas durante a execução;
- testar uma rota pública, uma rota autenticada e uma rota de administrador;
- confirmar que uma ação não pode ser executada por usuário sem permissão.

### Etapa 4 — Frontend e integração

**Estudar**

- organização de `frontend/index.html`, `app.js`, `style.css` e
  `integration.css`;
- renderização das telas;
- envio de JSON com `fetch`;
- armazenamento e envio do token;
- tratamento de carregamento, mensagens e erros.

**Praticar**

- localizar a função responsável por cada tela;
- acompanhar uma resposta da API até a atualização visual;
- verificar a interface em tela grande e em tela pequena.

### Etapa 5 — Qualidade, entrega e apresentação

**Estudar**

- testes de integração existentes;
- critérios de aceite e casos de borda;
- logs, health check e configuração por ambiente;
- fluxo de pull request e revisão;
- roteiro de demonstração.

**Praticar**

- executar todos os testes antes da apresentação;
- limpar dados e repetir o fluxo com as contas de demonstração;
- preparar uma explicação curta para cada decisão relevante.

---

## 4. Plano de implementação sugerido

O plano abaixo pode ser adaptado ao calendário da disciplina. Cada semana
termina com uma entrega demonstrável.

| Semana | Foco | Entrega |
|---:|---|---|
| 1 | Problema, personas, requisitos e ambiente | backlog priorizado, fluxo principal e todos os integrantes executando o projeto |
| 2 | Domínio e persistência | entidades, estados, repositórios e dados iniciais compreendidos |
| 3 | Autenticação e autorização | cadastro, login, JWT e proteção de rotas validados |
| 4 | Vínculos e encontros | solicitação, aceite/recusa, agenda e regras de permissão funcionando |
| 5 | Fórum, dicas, avaliações e frontend | fluxo principal integrado e telas revisadas |
| 6 | Testes, correções e documentação | versão candidata, testes passando e roteiro de apresentação |
| 7 | Implantação e apresentação | execução com Docker/AWS, demonstração e retrospectiva |

### Priorização do backlog

**Essencial (MVP):**

- cadastro e login;
- perfil de afilhado e padrinho;
- solicitação, aceite e encerramento de vínculo;
- criação e confirmação de encontros;
- fórum de perguntas e respostas;
- mural de dicas;
- avaliação;
- segurança por perfil;
- persistência e testes do fluxo principal.

**Importante, mas posterior:**

- filtros e paginação;
- recuperação de senha;
- verificação do e-mail institucional;
- notificações;
- moderação avançada;
- documentação OpenAPI/Swagger;
- pipeline CI/CD.

**Fora do primeiro ciclo:** videochamada própria, chat em tempo real e upload
de arquivos. Esses recursos aumentam o escopo e devem ser tratados como
evolução, não como requisito para concluir o MVP.

---

## 5. Divisão de funções entre os cinco integrantes

Os nomes abaixo seguem a equipe registrada no projeto. Se a composição mudar,
o papel pode ser transferido sem alterar as responsabilidades.

| Integrante | Função principal | Responsabilidades na implementação | Entregas e evidências |
|---|---|---|---|
| **Ednaldo Batista de Melo** | Coordenação e arquitetura | manter backlog e decisões técnicas; integrar frontend, API e implantação; acompanhar riscos; conduzir reuniões | diagrama da arquitetura, decisões registradas, integração final e apresentação técnica |
| **Italo** | Backend e regras de negócio | implementar serviços, controllers e DTOs; cuidar dos fluxos de vínculo e encontros; revisar regras de transição de status | endpoints funcionais, testes dos fluxos de negócio e documentação das regras |
| **Fredson** | Dados e segurança | manter entidades, repositórios e configuração de banco; cuidar de JWT, papéis e validações de acesso; revisar segredos e variáveis | modelo de dados, testes de autorização, configuração Docker/PostgreSQL e checklist de segurança |
| **Thuanny** | Frontend e experiência do usuário | implementar telas, formulários, navegação, estados de carregamento e mensagens; verificar acessibilidade e responsividade | telas integradas, fluxo responsivo, evidências de uso e correções de usabilidade |
| **Matheus** | Qualidade, integração e documentação | criar cenários de teste; executar regressões; revisar integração frontend/API; manter guias e roteiro de demonstração | matriz de testes, registro de defeitos, documentação atualizada e roteiro de apresentação |

### Responsabilidade compartilhada

- Todos devem revisar pelo menos uma pull request por ciclo.
- Todos devem executar o projeto antes de afirmar que uma tarefa está pronta.
- Quem implementa uma regra deve explicá-la a pelo menos outro integrante.
- Decisões que alteram API, banco ou fluxo de usuário devem ser discutidas com
  a equipe antes do merge.
- A autoria deve aparecer no histórico do Git, nas pull requests e, quando
  necessário, na documentação acadêmica.

---

## 6. Processo de trabalho com Git

### Fluxo recomendado

```text
issue/tarefa → branch curta → implementação → teste local
→ pull request → revisão de outro integrante → merge
```

Convenção de branches:

```text
feat/nome-da-funcionalidade
fix/nome-do-problema
test/nome-do-cenario
docs/nome-do-documento
```

Exemplos de commits:

```text
feat: adicionar filtro de padrinhos por disponibilidade
fix: bloquear alteração de vínculo por usuário não participante
test: cobrir recusa de solicitação de apadrinhamento
docs: atualizar roteiro de execução com Docker
```

### Critérios para aceitar uma tarefa

- o comportamento está descrito na issue ou no requisito;
- a implementação respeita as camadas existentes;
- entradas inválidas são rejeitadas com mensagem adequada;
- a autorização foi considerada;
- existe teste novo ou o teste existente foi executado;
- a interface não quebra em tamanhos de tela relevantes;
- a documentação foi atualizada quando o uso mudou;
- outro integrante revisou a alteração.

---

## 7. Execução e validação

### Execução integrada

Com o Docker Desktop aberto, na raiz do repositório:

```bash
docker compose up --build
```

Acesse `http://localhost:8088`. Para encerrar:

```bash
docker compose down
```

### Execução local do backend

Com Java 21 e Maven instalados:

```bash
cd backend
mvn spring-boot:run
```

O backend ficará em `http://localhost:8080` e usará H2 em memória. O frontend
pode ser aberto com um servidor HTTP local; para a demonstração integrada, é
preferível usar o Docker Compose, que já configura o proxy do Nginx.

### Testes

```bash
cd backend
mvn test
```

O conjunto mínimo de validação deve cobrir:

| Cenário | Resultado esperado |
|---|---|
| cadastro com dados válidos | usuário criado |
| login com senha correta | token JWT emitido |
| acesso privado sem token | requisição bloqueada |
| afilhado solicita padrinho | vínculo pendente criado |
| padrinho aceita solicitação | vínculo ativo |
| participante agenda encontro | encontro criado |
| usuário publica pergunta, resposta e dica | conteúdo persistido |
| afilhado avalia vínculo | avaliação registrada |
| usuário comum acessa painel administrativo | acesso bloqueado |

---

## 8. Roteiro de demonstração

1. Apresentar o problema e os três perfis de usuário.
2. Mostrar a tela de login e entrar como afilhado.
3. Exibir e completar o perfil.
4. Selecionar um padrinho e enviar uma solicitação.
5. Entrar como padrinho e aceitar o vínculo.
6. Criar e confirmar um encontro.
7. Publicar uma pergunta e respondê-la com outro perfil.
8. Publicar uma dica e registrar uma avaliação.
9. Entrar como administrador e mostrar indicadores e pendências.
10. Explicar a arquitetura, a divisão da equipe, os testes e as limitações.

Cada integrante deve apresentar sua parte e também saber explicar como ela se
conecta às demais. A demonstração deve usar dados não sensíveis e nunca expor
o conteúdo de `.env`, chaves JWT ou senhas reais.

---

## 9. Checklist final da equipe

- [ ] Todos executaram o projeto com Docker Compose.
- [ ] O README e este guia correspondem ao estado atual do código.
- [ ] O fluxo principal foi testado com afilhado, padrinho e administrador.
- [ ] Rotas privadas rejeitam requisições sem autenticação.
- [ ] Regras de autorização foram verificadas para cada perfil.
- [ ] `mvn test` foi executado antes da entrega.
- [ ] Não há senhas, tokens ou chaves reais versionados.
- [ ] A apresentação tem roteiro, responsáveis e tempo definido.
- [ ] Cada integrante consegue explicar pelo menos uma decisão técnica e uma
  limitação do projeto.
- [ ] As próximas melhorias estão separadas do escopo entregue.

## 10. Próximas evoluções para estudo

Depois da entrega do MVP, a equipe pode estudar paginação, filtros no servidor,
Flyway, OpenAPI, recuperação de senha, notificações, acessibilidade, testes de
usabilidade e CI/CD. Cada evolução deve começar com requisito, critério de
aceite, estimativa e teste, evitando adicionar funcionalidades sem controle de
escopo.
