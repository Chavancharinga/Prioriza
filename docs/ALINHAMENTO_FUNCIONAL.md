# Alinhamento funcional do Prioriza

Este documento verifica a app contra a fundamentação do projeto e serve como guia de continuidade.

## Implementado

- Gestão manual de tarefas com título, descrição, prazo, lembrete, estimativa, status e prioridade.
- Prioridades visuais em 5 cores do urgente ao tranquilo: P1 vermelho, P2 laranja, P3 amarelo, P4 lima, P5 verde.
- Visualização por Lista, Kanban e Árvore para apoiar decisão e organização.
- Planeamento diário, semanal e mensal com cronograma automático baseado em prioridade, prazo, duração e horários do perfil.
- Espaço de trabalho da tarefa com status, Pomodoro, checklist, bloco de notas e histórico de atividade.
- Links entre notas e tarefas usando `[[nome da tarefa]]`, útil para estudo e revisão.
- Gamificação com XP, nível, streak, penalização por atraso e painel clicável de XP.
- Assistente PRIO com chat sobre tarefas, produtividade, criação de tarefas por conversa, checklist, nota e estimativa.
- IA por backend em `VITE_AI_API_URL`, usando OpenRouter com modelo padrão `deepseek/deepseek-v4-flash`.
- Fallback local no PRIO quando a IA não responde, mantendo criação básica de tarefas.
- Login persistente com opção “Permanecer logado”.

## Parcial

- Notificações existem como lembrete e eventos internos de atraso/XP, mas ainda falta PWA push real para avisos fora da app.
- “Tarefa inteligente” já tem base via PRIO e sugestões por IA, mas ainda falta o fluxo dedicado de quiz com 3 a 6 perguntas antes de gerar cronograma completo.
- Exportação ICS ainda não está implementada.
- O stack atual usa Supabase em vez de Firebase, mantendo a arquitetura de API/backend prevista para deploy.

## Próximos passos recomendados

1. Criar tela/fluxo “Tarefa inteligente” com quiz curto e saída JSON validada.
2. Transformar resposta da IA em cronograma editável com tarefas-filhas, Kanban, Árvore e Calendário.
3. Adicionar notificações PWA para prazos urgentes e revisão de anotações.
4. Implementar exportação ICS a partir do cronograma.
