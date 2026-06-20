# Contexto para o Agente (AGENTS.md)

## Visão Geral do Projeto
**Nome do Projeto**: Reserva de Salas - FGMF Arquitetos
**Objetivo**: Desenvolver uma plataforma centralizada e web para gerenciamento e agendamento de 4 salas de reunião em um escritório de arquitetura, substituindo planilhas manuais e evitando conflitos de horário.

## Stack Tecnológica Definida
- **Frontend**: React + TypeScript
- **Backend**: FastAPI (Python)
- **Banco de Dados**: PostgreSQL
- **Infraestrutura e Deploy**: Docker (Dockerfiles individuais) e Docker Compose para orquestração de todos os serviços.

## Arquitetura e Estrutura de Diretórios Esperada
A arquitetura base será dividida em microsserviços organizados em um monorepo (ou diretórios separados sob uma raiz comum):

```text
/trabalho_pro
├── /frontend          # Aplicação React + TypeScript
│   └── Dockerfile
├── /backend           # API FastAPI
│   ├── /app
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── /models    # Schemas Pydantic e Models do banco
│   │   └── /routers   # auth.py, rooms.py, reservations.py
│   └── Dockerfile
├── /database          # Scripts de inicialização do PostgreSQL (opcional)
└── docker-compose.yml # Orquestrador unificado
```

## Requisitos e Funcionalidades Core
1. **Autenticação**: Acesso restrito a e-mails autorizados (Colaboradores e Administradores).
2. **Painel de Status**: Visualização em tempo real das 4 salas com opções de reserva rápida.
3. **Calendário**: Visualização de disponibilidade em grade (salas x horários).
4. **Minhas Reservas**: Consulta e cancelamento de reservas próprias.
5. **Perfis de Salas**: Informações detalhadas de capacidade, recursos e localização.
6. **Painel Administrativo**: Gestão de todas as reservas, gerenciamento de usuários autorizados e indicadores básicos de uso.

## Regras de Negócio Importantes
- É proibido a sobreposição de horários para a mesma sala.
- Não é possível realizar reservas no passado.
- Apenas administradores podem visualizar todas as reservas de forma global e gerenciar permissões.
- O sistema deve validar conflitos tanto no frontend (UX) quanto no backend (segurança de dados).

## Diretrizes de Implementação (Para os próximos passos)
- **Atenção**: Ainda não execute a criação dos arquivos de código. Este documento serve como base de conhecimento (contexto).
- Os protótipos de interface estão localizados na pasta `/prototipo`. As telas criadas no React devem se basear no layout proposto por essas imagens.
- A camada de dados (PostgreSQL) deve garantir integridade com uso adequado de chaves primárias, estrangeiras e constraints (especialmente para evitar overlapping de reservas).
- O Docker Compose deve garantir que a ordem de inicialização seja respeitada (o backend só deve iniciar após o banco de dados estar pronto).
