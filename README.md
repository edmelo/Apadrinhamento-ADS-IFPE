# Apadrinhamento ADS IFPE

Plataforma web acadêmica para conectar estudantes veteranos (**padrinhos**) e ingressantes (**afilhados**) do curso de Análise e Desenvolvimento de Sistemas do IFPE.

O projeto evoluiu do protótipo visual para um MVP full stack: o frontend consome uma API REST, os dados são persistidos, os usuários se autenticam por JWT e as permissões são separadas por perfil.

Para orientar os estudos, a divisão de responsabilidades e o processo de
implementação da equipe, consulte o
[guia acadêmico de estudos e implementação](docs/guia-estudos-implementacao-equipe.md).

## Funcionalidades implementadas

- Cadastro e login de afilhados e padrinhos.
- Autenticação JWT e autorização por perfil.
- Edição do perfil acadêmico.
- Listagem e solicitação de padrinhos.
- Aceite, recusa e encerramento de vínculos.
- Agenda de encontros com estados de confirmação.
- Fórum com perguntas e respostas.
- Mural de dicas colaborativas.
- Avaliação de apadrinhamento.
- Indicadores e pendências para administradores.
- Interface responsiva para computador e celular.
- Dados iniciais para demonstração.
- Testes de integração das regras e da segurança HTTP.

## Tecnologias

### Frontend

- HTML5
- CSS3, Flexbox e Grid
- JavaScript sem framework
- API Fetch e armazenamento local do token

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Web, Data JPA, Security e Validation
- JWT com OAuth2 Resource Server
- H2 para execução local
- PostgreSQL no Docker Compose
- JUnit 5 e Spring Boot Test

## Estrutura

```text
frontend/                   interface e integração com a API
backend/                    aplicação Spring Boot
  src/main/java/            domínio, repositórios, serviços e controllers
  src/main/resources/       configuração
  src/test/java/            testes de integração
docs/                       documentação acadêmica e PDF
docker-compose.yml          ambiente integrado
nginx.conf                  frontend e proxy da API
```

## Executar com Docker

É necessário abrir o Docker Desktop antes de iniciar.

```bash
docker compose up --build
```

Depois, acesse `http://localhost:8088`.

Para publicar o sistema em uma instância EC2 com domínio e HTTPS, consulte o
[guia de implantação na AWS](docs/implantacao-aws-ec2.md).

O ambiente inicia três serviços:

1. PostgreSQL para persistência.
2. API Spring Boot.
3. Nginx servindo o frontend e encaminhando `/api`.

Para encerrar:

```bash
docker compose down
```

Para encerrar e apagar o banco local criado pelo Compose:

```bash
docker compose down -v
```

## Executar para desenvolvimento

Com Java 21 e Maven instalados:

```bash
cd backend
mvn spring-boot:run
```

O backend usará H2 em memória e ficará em `http://localhost:8080`. Em seguida, abra `frontend/index.html` ou sirva a pasta `frontend` com um servidor HTTP local.

## Acessos de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Afilhada | `ana@ifpe.edu.br` | `senha123` |
| Padrinho | `joao@ifpe.edu.br` | `senha123` |
| Administrador | `admin@ifpe.edu.br` | `admin123` |

As contas são criadas apenas quando o banco está vazio.

## Endpoints principais

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Autenticar |
| GET/PUT | `/api/users/me` | Consultar ou editar perfil |
| GET | `/api/mentors` | Listar padrinhos |
| GET/POST/PATCH | `/api/mentorships` | Gerenciar vínculos |
| GET/POST/PATCH | `/api/meetings` | Gerenciar encontros |
| GET/POST | `/api/questions` | Consultar ou publicar perguntas |
| GET/POST | `/api/questions/{id}/answers` | Consultar ou publicar respostas |
| GET/POST | `/api/tips` | Consultar ou publicar dicas |
| POST | `/api/reviews` | Avaliar um vínculo |
| GET | `/api/admin/indicators` | Indicadores administrativos |
| GET | `/api/admin/pending` | Solicitações pendentes |

As rotas privadas exigem `Authorization: Bearer <token>`.

## Executar testes

```bash
cd backend
mvn test
```

Os testes cobrem o fluxo principal — cadastro, autenticação, match, aceite, encontro, pergunta, resposta, dica e avaliação — e confirmam que a API bloqueia requisições sem JWT.

## Configuração

As principais variáveis de ambiente são:

| Variável | Finalidade |
|---|---|
| `DB_URL` | URL JDBC do banco |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DDL_AUTO` | Estratégia de atualização do schema |
| `JWT_SECRET` | Chave de assinatura dos tokens |
| `TOKEN_HOURS` | Validade do token em horas |

Troque as credenciais e a chave JWT antes de publicar o sistema.

## Equipe

- Ednaldo Batista de Melo — arquitetura e liderança técnica.
- Italo — backend e regras de negócio.
- Fredson — persistência e segurança.
- Thuanny — frontend, QA e documentação.
- Matheus — frontend, QA e documentação.

## Próximas melhorias

- Paginação e filtros executados no servidor.
- Recuperação de senha e verificação de e-mail institucional.
- Notificações e mensagens em tempo real.
- Upload de imagens e anexos.
- Migrations com Flyway em vez de atualização automática do schema.
- Documentação OpenAPI/Swagger.
- Pipeline CI/CD e implantação em homologação.
- Testes de acessibilidade e usabilidade com estudantes.
