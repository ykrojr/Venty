# Venty - Marcador de Evento

Sistema desenvolvido para organizar a logística de eventos, focado principalmente no controle de produtos e integração com dados de cardápios (via PDF). O backend é feito em Spring Boot (Java) com banco PostgreSQL, e o front usa React com Vite.

## O projeto
A ideia principal é gerenciar diferentes eventos em uma estrutura de SaaS (multi-tenant), permitindo que cada organizador tenha seu espaço isolado. Atualmente o sistema lida com:
- Cadastro e monitoramento de eventos.
- Listagem detalhada de produtos e sub-produtos por evento.
- Script de integração para extrair itens de cardápios em PDF diretamente para o sistema.
- Controle básico de usuários e autenticação JWT.

## Setup técnico

### Requisitos
- Java 17
- Node.js
- Postgres

### Como rodar
1. **Banco de dados**: Crie um database chamado `marcador_eventos` no seu Postgres.
2. **Backend**: 
   - Configure o arquivo `.env` dentro da pasta `backend/` com seu usuário e senha do banco.
   - Execute com o comando `mvn spring-boot:run` dentro da pasta.
3. **Frontend**:
   - Entre na pasta `frontend/`.
   - `npm install` para as dependências.
   - `npm run dev` para subir o servidor local.

## Segurança
As credenciais de acesso ao banco e o segredo do JWT não estão no código. Eles devem ser configurados localmente no arquivo `.env` no backend para evitar vazamentos em repositórios públicos.
