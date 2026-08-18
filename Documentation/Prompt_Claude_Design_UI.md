# Prompt para Claude Design — Focus Library

Quero que você projete a interface completa (UI) de um produto chamado **Focus Library** — uma biblioteca/sala de estudos virtual voltada para foco e produtividade, inspirada em sites como imissmycafe.com, mas com tema de **biblioteca clássica/aconchegante** em vez de café.

## Sensação e atmosfera desejada

A interface deve transmitir uma sensação de **conforto, aconchego e concentração silenciosa** — como estar sentado numa poltrona confortável numa biblioteca antiga, numa tarde chuvosa, com uma lareira acesa ao fundo. Pense em:

- Tons quentes e terrosos: madeira, âmbar, creme, marrom café, verde musgo escuro, dourado envelhecido
- Texturas sutis que remetam a papel, couro, madeira (sem pesar a performance)
- Tipografia que misture uma fonte serifada acolhedora para títulos (algo como Lora, Merriweather ou Playfair Display) com uma sans-serif limpa para textos funcionais (Inter, Nunito ou similar)
- Iluminação visual "quente" — evitar tons frios, brancos puros ou azuis clínicos
- Micro-interações suaves e lentas (nada de animações abruptas ou "gamificadas") — tudo deve parecer calmo, deliberado, sem pressa
- Deve funcionar bem tanto em modo claro (dia, luz suave) quanto em modo escuro (noite, luz de lareira) — se possível, projete os dois modos

O oposto do que eu quero: interfaces frias, corporativas, tech-startup genéricas, com azul/roxo neon, cards flutuantes agressivos ou gamificação com pontos/badges chamativos.

## Stack técnica (restrição importante)

O frontend será construído em **React + TypeScript usando Material UI (MUI)** como biblioteca de componentes base. Isso significa:

- Quero que você **personalize o tema do Material UI** (via `ThemeProvider`, paleta de cores customizada, tipografia customizada, `overrides`/`styleOverrides` dos componentes) para atingir a estética aconchegante descrita acima — não quero a aparência "padrão MUI" (Roboto + azul Material Design genérico).
- Onde o Material UI tiver limitações (por exemplo, formas de componentes muito rígidas, sombras muito "flat", cantos muito retos), pode sugerir customizações via `sx` prop, `styled()` ou CSS adicional — mas mantendo os componentes MUI como base estrutural (não reinventar componentes do zero).
- Ao entregar os designs, indique quais componentes MUI cada tela usa como base (ex: `Card`, `Slider`, `Drawer`, `Dialog`, `Chip`) e como o tema customizado se aplica a eles.
- Se alguma parte do design exigir algo que o MUI não suporta bem nativamente, aponte isso explicitamente como uma exceção/observação técnica.

## Funcionalidades que precisam de tela/componente

### Fase 1 (MVP) — prioridade máxima no design agora
1. **Tela de Login** — botão "Entrar com Google", com boas-vindas acolhedora (frase de efeito, ilustração ou ícone temático de biblioteca)
2. **Mixer de sons ambiente** — tela principal do app. Precisa de controles de volume independentes para: páginas virando, chuva na janela, relógio de parede, sussurros ao fundo, lareira crepitando, teclado de laptop. Cada som deve ter um ícone/ilustração temática e um slider de volume. Pense em como tornar isso visualmente interessante sem poluir (ex: cards com ícones que "acendem"/ganham destaque quando o volume está ativo)
3. **To-do list** — lista de tarefas simples, com adicionar/completar/remover, integrada visualmente ao restante da tela (talvez como painel lateral ou gaveta retrátil, tipo `Drawer` do MUI)
4. **Presets** — interface para salvar a combinação atual de volumes com um nome e carregá-la depois (ex: um menu de "cenas salvas" com preview/nome)

### Fase 2 — desenhar como próxima etapa
5. **Timer Pomodoro** — vinculado a uma tarefa da to-do list, com estados de foco (25min) e pausa (5min), indicador visual de progresso (radial ou linear)
6. **Dashboard de histórico** — gráfico simples mostrando minutos de foco por dia (últimos 7 dias), estilizado com a mesma paleta quente (nada de gráficos com cores neon padrão de biblioteca de charts)

### Fase 3 — desenhar como visão futura
7. **Lista de salas compartilhadas** — cards de salas temáticas (ex: "Sala de Leitura Silenciosa", "Chuva na Ala Oeste", "Sala de Estudos Noturna") mostrando quantas pessoas estão estudando ali em tempo real (indicador de presença, tipo avatares empilhados ou contador discreto)

## Estrutura de navegação

Pense em uma navegação simples e não intrusiva — provavelmente um layout de app single-page com:
- Header/topbar minimalista (logo, avatar do usuário, talvez toggle dark/light mode)
- Área central dedicada ao mixer de sons (o coração do produto)
- To-do list e presets acessíveis via painel lateral ou gaveta, para não competir visualmente com o mixer
- Navegação para dashboard/salas via um menu discreto (não precisa ser uma sidebar pesada estilo dashboard corporativo)

## Entregáveis esperados

1. Paleta de cores completa (light + dark mode) com códigos hex
2. Tipografia (famílias, pesos, tamanhos para h1-h6, body, caption)
3. Tela de Login
4. Tela principal (Mixer + To-do + Presets integrados)
5. Tela de Dashboard (Fase 2)
6. Tela de Salas Compartilhadas (Fase 3)
7. Especificação de como o tema do MUI deve ser configurado (createTheme customizado) para que eu possa implementar exatamente o que foi desenhado

Priorize qualidade e coerência visual acima de quantidade — prefiro poucas telas muito bem resolvidas a muitas telas genéricas.

---

**Fim do prompt.**
