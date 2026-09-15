# Apadrinhamento ADS IFPE

Plataforma web colaborativa desenvolvida para conectar estudantes veteranos (padrinhos) a alunos ingressantes (afilhados) do curso de Análise e Desenvolvimento de Sistemas do IFPE. O sistema centraliza o suporte acadêmico, fornecendo orientações sobre disciplinas, corpo docente, rotinas do campus, dicas de estudo e esclarecimento de dúvidas para facilitar a integração e o progresso no curso.

---

## 👥 Integrantes da Equipe

* **Integrante 1**: Ednaldo Batista de Melo - Arquiteto & Líder Técnico (Arquitetura e Integração)
* **Integrante 2**: Italo - Desenvolvedor Back-end (Lógica de Negócio e APIs)
* **Integrante 3**: Fredson - Desenvolvedor Back-end (Persistência de Dados e Segurança)
* **Integrante 4**: Thuanny - Desenvolvedor Front-end & QA (Interface UI/UX, Testes e Documentação)
* **Integrante 4**: Matheus - Desenvolvedor Front-end & QA (Interface UI/UX, Testes e Documentação)

---

## 📌 Funcionalidades Principais

* **Gestão de Perfis**: Cadastro e autenticação diferenciada para veteranos (padrinhos) e calouros (afilhados).
* **Sistema de Match e Vínculo**: Mecanismo para solicitação e aceite de apadrinhamento.
* **Agenda de Encontros**: Marcação e acompanhamento de mentorias e reuniões de alinhamento.
* **Fórum / FAQ Colaborativo**: Espaço para dúvidas recorrentes sobre disciplinas, professores e rotinas do campus.
* **Mural de Dicas e Guias**: Compartilhamento de materiais, roteiros de estudos e recomendações acadêmicas.
* **Avaliação de Mentorias**: Feedback sobre o suporte prestado pelos padrinhos.

---

## 🛠️ Tecnologias Pretendidas

* **Linguagem & Back-end**: Java, Spring Boot (Spring MVC, Spring Data JPA, Spring Security)
* **Front-end**: HTML5, CSS3, JavaScript (Layout responsivo com foco em UX)
* **Banco de Dados**: PostgreSQL
* **Containerização**: Docker / Docker Compose
* **Cloud & Deploy**: Plataforma em nuvem (ex.: Render, AWS ou Railway)
* **Observabilidade**: Spring Boot Actuator, Micrometer / Prometheus

---

## 🏛️ Arquitetura

* Arquitetura em camadas (Controller, Service, Repository, Model/Entity) no padrão RESTful API.
* Separação clara entre a lógica de negócios e as interfaces de visualização responsivas.
* Persistência gerenciada via Hibernate/Spring Data JPA conectado ao PostgreSQL.

---

## 🧪 Práticas de Testes

* **Testes Unitários**: JUnit 5 e Mockito para validação de regras de negócio em services.
* **Testes de Integração**: Spring Boot Test (`@SpringBootTest`, `@DataJpaTest`) e MockMvc para endpoints de API.

---

## 🚀 Práticas de DevOps, CI/CD e Cloud

* **Integração e Entrega Contínua (CI/CD)**: Pipelines automatizados via GitHub Actions para execução de builds, validação de linting e testes a cada *push* ou *Pull Request*.
* **Containerização**: Empacotamento da aplicação e do banco de dados em contêineres Docker.
* **Deploy Cloud**: Implantação automatizada a partir da branch principal (`main`).
* **Observabilidade**: Endpoints de saúde e métricas de desempenho habilitados com Spring Boot Actuator.

---

## 🌿 Práticas de Controle de Versão (Git Flow simplificado)

* Branch `main` protegida, contendo apenas versões estáveis de produção.
* Branch `develop` para consolidação do desenvolvimento.
* Branches de funcionalidade no padrão `feature/nome-da-feature`.
* Atualizações realizadas exclusivamente via **Pull Requests (PRs)** com revisão de código (Code Review).
* Commits padronizados seguindo a convenção de *Conventional Commits*.

---

## 📐 Práticas de Engenharia de Software

* Adoção de princípios SOLID e Clean Code.
* Design voltado para o usuário (UI/UX) com navegação fluida e acessível.
* Gestão ágil de tarefas utilizando o GitHub Projects / Scrum.
