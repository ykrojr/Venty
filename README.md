# Venty - Marcador de Evento (Em desenvolvimento)

Sistema desenvolvido para organizar a logística de eventos, focado principalmente no controle de produtos e integração com dados de cardápios (via PDF). O backend é feito em Spring Boot (Java) com banco PostgreSQL, e o front usa React com Vite.

## O projeto
A ideia principal é gerenciar diferentes eventos em uma estrutura de SaaS (multi-tenant), permitindo que cada organizador tenha seu espaço isolado. Atualmente o sistema lida com:
- Cadastro e monitoramento de eventos.
- Listagem detalhada de produtos e sub-produtos por evento.
- Script de integração para extrair itens de cardápios em PDF diretamente para o sistema.
- Controle básico de usuários e autenticação JWT.

## Como rodar

### Requisitos
- Java 17
- Node.js
- Postgres

### Setup
1. **Banco**: Crie um database chamado `marcador_eventos` no Postgres.
2. **Backend**: Configure seu usuário e senha do banco no arquivo `.env` que está na pasta `backend/` e rode com `mvn spring-boot:run`. (Não subi o `.env` pro Github por segurança, então cada um usa o seu local).
3. **Frontend**: Na pasta `frontend/`, rode `npm install` e depois `npm run dev`.

---
*Projeto pessoal focado em organização de eventos.*
