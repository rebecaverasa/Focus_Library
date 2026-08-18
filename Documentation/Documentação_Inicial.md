Focus Library — Documentação do Projeto Pessoal

Nome provisório. Objetivo do projeto: aprofundar conhecimentos fullstack (Python + TypeScript(react/materialUI/ThemeProvider ou StyledComponents)) através de um projeto pessoal completo, usando apenas ferramentas/serviços gratuitos.

1. Conceito

Uma biblioteca/sala de estudos virtual, com tema de biblioteca: mixer de sons ambiente (páginas virando, chuva na janela, relógio de parede, sussurros ao fundo, lareira, teclado de laptop) para acompanhar estudo/trabalho. Este projeto pretende utilizar persistência de dados por usuário, tarefas, timer de produtividade e presença em tempo real — o que justifica uma stack fullstack completa (backend, banco, mensageria, tempo real), além de login com a conta Google do usuário.

2. Funcionalidades
Fase 1: 
MVP:
Mixer de sons ambiente da biblioteca (volume independente por som: páginas, chuva, relógio, sussurros, lareira, etc.)
Autenticação: Login com Google (dados do usuário salvos na nuvem, acessíveis de qualquer dispositivo)
Todo list persistida por usuário
Presets: salvar sua combinação de volumes favorita
Fase 2
Pomodoro / timer de foco vinculado às tarefas
Histórico de sessões de foco (dashboard com gráfico)
Resumo semanal automático (email): tarefas concluídas + minutos de foco
Fase 3 (opcional, mas valiosa para portfólio)
"Salas" de estudo compartilhadas: usuários entram numa sala temática (ex. "Sala de Leitura Silenciosa", "Chuva na Ala Oeste", "Sala de Estudos Noturna") e veem em tempo real quantas outras pessoas estão estudando ali

Fluxo padrão OAuth2 para SPA ("Sign in with Google"):

Frontend usa @react-oauth/google (Google Identity Services) para renderizar o botão de login.
Ao autenticar, o Google retorna um ID token (JWT assinado, com email, nome, foto, sub = ID único do usuário no Google).
Frontend envia esse token para POST /auth/google no backend.
Backend valida o token com a lib google-auth (assinatura + audience = Client ID do projeto).
Backend faz upsert do usuário no Postgres (chave: google_sub) e emite um JWT próprio (access + refresh) para as próximas chamadas.
Dados (tarefas, presets, sessões) ficam vinculados ao google_sub no Postgres — por isso funcionam em qualquer aparelho.

Configuração: Google Cloud Console → criar projeto → configurar OAuth consent screen → criar OAuth Client ID (Web application) → registrar origens autorizadas (localhost:5173 em dev, domínio da Vercel em produção). Sem custo.

Decisão de escopo: login somente via Google, sem email/senha tradicional — evita construir reset de senha, verificação de email, hashing etc., sem perder o valor de portfólio do fluxo OAuth2.

4. Arquitetura (visão geral)
[Frontend React/TS - Vercel]
        |
        | REST + WebSocket
        v
[FastAPI - k3s no Oracle Cloud]
    |         |
    |         +--> [Redis] (cache + Pub/Sub para WebSocket entre réplicas)
    |         +--> [RabbitMQ] (broker de filas)
    |
    +--> [PostgreSQL] (usuários, tarefas, sessões, presets)

[Celery Worker] <-- consome fila --> [RabbitMQ]
[Celery Beat] --> agenda job semanal (resumo de produtividade)
5. Stack Tecnológica
Camada	Tecnologia	Observação
Backend API	Python + FastAPI	REST + docs automáticas (Swagger)
Autenticação	Google OAuth2 + JWT próprio	google-auth (backend), @react-oauth/google (frontend)
Tempo real	WebSocket (FastAPI) + Redis Pub/Sub	sincroniza presença entre réplicas do backend
Fila / tarefas assíncronas	Celery + RabbitMQ	processamento de sessões, resumo semanal
Agendamento	Celery Beat	dispara jobs periódicos
Banco relacional	PostgreSQL	dados persistentes
Cache	Redis	cache de queries + broker do Pub/Sub
Frontend	React + TypeScript (Vite)	mixer de áudio, todo list, dashboard
Gráficos	Recharts / Chart.js	histórico de foco
Notificações	Telegram Bot API	resumo semanal, mais simples que SMTP
Testes backend	pytest + httpx	
Testes frontend	Vitest + Testing Library, Playwright (E2E)	
6. DevOps
Peça	Escolha	Gratuito?
Containerização	Docker + docker-compose (dev local)	sim
Orquestração	Kubernetes (k3s) rodando em VMs ARM do Oracle Cloud Always Free	sim, permanente (alternativa para aprender sem infra: kind/minikube local)
Registry de imagens	GitHub Container Registry (ghcr.io)	sim
CI	GitHub Actions (lint, testes, build da imagem)	sim
CD	GitHub Actions ou ArgoCD (GitOps) aplicando no cluster	sim
Deploy frontend	Vercel	sim, e é o mais usado do mercado para apps React/TS
Deploy backend (alternativa simples antes do k8s)	Render free tier	sim
Observabilidade — métricas	Prometheus + Grafana self-hosted no cluster	sim
Observabilidade — logs	Grafana Loki	sim
Observabilidade — erros	Sentry (free tier)	sim
Observabilidade — uptime	UptimeRobot	sim

Nota sobre Kubernetes gratuito: não existe cluster K8s gerenciado 24/7 grátis para sempre nas grandes clouds (GCP/AWS/Azure só dão crédito por tempo limitado). O caminho usado na prática é subir k3s em VMs do Oracle Cloud Always Free (permanentes, sem prazo). Alternativa para aprender sem se preocupar com infra: kind/minikube local.

7. Roadmap
MVP local: FastAPI + Postgres + login Google + todo list + frontend com mixer de som — tudo via docker-compose
Mensageria: Celery + RabbitMQ para o resumo semanal (job assíncrono simples)
Tempo real: WebSocket + Redis Pub/Sub para as salas compartilhadas
CI: GitHub Actions rodando testes a cada PR
Deploy inicial: Vercel (frontend) + Render/Oracle (backend) — versão "no ar"
Kubernetes + CD + Observabilidade: migração do backend para k3s, adição de Prometheus/Grafana/Sentry