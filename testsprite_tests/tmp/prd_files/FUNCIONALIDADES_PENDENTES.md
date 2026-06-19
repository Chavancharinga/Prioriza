# Prioriza - Funcionalidades Pendentes

## 📊 Status Geral (Projeto Principal: Code/Prioriza_pasta)

| Categoria | Funcionalidade | Status | Prioridade |
|-----------|---------------|--------|-----------|
| **Autenticação** | Login/Cadastro | ✅ Feito | - |
| **Autenticação** | Recuperação de senha | ✅ Feito | - |
| **Tarefas** | CRUD completo | ✅ Feito | - |
| **Tarefas** | Sistema de prioridades (cores) | ✅ Feito | - |
| **Tarefas** | Subtarefas (checklist) | ✅ Feito | - |
| **Tarefas** | Notas por tarefa | ✅ Feito | - |
| **Tarefas** | Recursos/Links | ✅ Feito | - |
| **Visualização** | Lista | ✅ Feito | - |
| **Visualização** | Kanban (drag & drop) | ✅ Feito | - |
| **Visualização** | Árvore | ✅ Feito | - |
| **Foco** | Modo Foco | ✅ Feito | - |
| **Foco** | Pomodoro Timer | ✅ Feito | - |
| **Cronograma** | Visualização Mês | ✅ Feito | - |
| **Cronograma** | Visualização Semana | ✅ Feito | - |
| **Cronograma** | Visualização Dia | ✅ Feito | - |
| **Cronograma** | Exportação .ICS | ✅ Feito | - |
| **Notificações** | In-app (navegador) | ✅ Feito | - |
| **Notificações** | Email (Maileroo) | 🔶 Pendente | 2 |
| **Configurações** | Perfil do usuário | ✅ Feito | - |
| **Configurações** | Alterar senha | ✅ Feito | - |
| **Configurações** | Exportar JSON | ✅ Feito | - |
| **Configurações** | Modo offline | ✅ Feito | - |
| **Configurações** | Animações | ✅ Feito | - |
| **Configurações** | Dark Mode | ✅ Feito | 3 |
| **Segurança** | RLS | ✅ Feito | - |
| **Backend** | Schema Supabase | ✅ Feito | - |
| **IA** | Chat PRIO com contexto das tarefas | ✅ Feito | - |
| **IA** | Criar tarefas por conversa | ✅ Feito | - |
| **IA** | Criar checklist e notas sugeridas | ✅ Feito | - |
| **IA** | Atualizar horários de trabalho | ✅ Feito | - |
| **IA** | Ações destrutivas por conversa | 🔶 Pendente | 2 |

---

## 🔶 Funcionalidades Pendentes

### 1. Notificações por Email (Maileroo)

**Status:** Script SQL pronto (`setup_email_notifications_maileroo.sql`)

**O que precisa fazer:**

1. **Habilitar extensões no Supabase Dashboard:**
   - Acesse: Supabase → Database → Extensions
   - Habilite: `pg_net` e `pg_cron`

2. **Executar script SQL:**
   - Vá em: SQL Editor → New Query
   - Copie o conteúdo de `setup_email_notifications_maileroo.sql`
   - Execute (RUN)

3. **Testar:**
   - Crie uma tarefa com lembrete para daqui 2 minutos
   - Aguarde e verifique seu email

**Arquivos relacionados:**
- `docs/preview/setup_email_notifications_maileroo.sql`
- `docs/preview/setup_email_notifications.sql` (alternativo)
- `docs/preview/verify_notification_status.sql` (debug)
- `docs/preview/debug_email.sql` (debug)
- `docs/preview/GUIA_EMAIL_NOTIFICACOES.md` (guia completo)

---

### 2. Dark Mode

**Status:** ✅ Implementado!

**O que foi feito:**

1. Habilitado `darkMode: 'class'` no Tailwind
2. Adicionado toggle em Settings → Aparência
3. Adicionada lógica para aplicar tema via classe CSS

**Para ativar:** Vá em Configurações → Aparência → Ativar Modo Escuro

---

### 3. Correção Bug UI

**Status:** ✅ Resolvido no modal atual (`src/components/tasks/TaskModal.jsx`)

O campo de descrição está tratado como campo opcional no fluxo de criação/edição de tarefas.

---

### 4. Revisão da IA / PRIO

**Status:** ✅ Integração principal implementada

**O que já está integrado:**

1. **Chat PRIO com contexto real da app**
   - Recebe tarefas, perfil, XP, histórico recente e última tarefa criada.
   - Responde sobre produtividade, prioridades, atrasos, foco e cronograma.

2. **Criação de tarefas por conversa**
   - Cria tarefa no Supabase.
   - Sugere prioridade, estimativa de tempo, prazo, checklist e nota inicial.
   - Usa fallback local quando o backend de IA não responde.

3. **Edição assistida**
   - Pode complementar a última tarefa criada com novos detalhes.
   - Pode atualizar horários de trabalho/disponibilidade no perfil.
   - O calendário automático passa a usar os horários configurados.

4. **IA dentro da tarefa**
   - Sugere sub-tarefas a partir do contexto da tarefa.
   - Resume anotações e checklist para apoiar o modo de trabalho.

**Limites intencionais por segurança:**

- A IA ainda não executa ações destrutivas como apagar tarefas, apagar notas ou alterar email/senha.
- Estas ações devem exigir confirmação explícita no UI antes de serem permitidas.
- O backend usa `OPENROUTER_API_KEY`; sem chave configurada, a app usa fallback determinístico local.

**Configuração necessária:**

- Criar `.env`/`.env.local` com `OPENROUTER_API_KEY`.
- Manter `OPENROUTER_MODEL=deepseek/deepseek-v4-flash`.
- Garantir `VITE_AI_API_URL` apontado para o backend FastAPI em produção.

---

## 📋 Funkcionalidades Extras (Não Essenciais)

### Analytics/Dashboard
- Gráficos de produtividade
- Tarefas concluídas por semana
- Streak diário

### PWA (Progressive Web App)
- `manifest.json`
- Service worker
- Instalabilidade em mobile

### Tarefas Recorrentes
- Diária, semanal, mensal
- Repetição personalizada

### Tags/Categorias
- Sistema de organização por tags
- Filtro por tag

### Gamificação
- Pontos
- Badges
- Conquistas

---

## 📅 Ordem de Implementação Sugerida

1. **Correção Bug UI** (1 min)
2. **Notificações Email** (15 min - configurar no Supabase)
3. **Dark Mode** (30-60 min)
4. **Extras** (quando necessário)

---

## ✅ Checklist de Verificação

Execute este checklist para confirmar que tudo está funcionando:

- [ ] Login e cadastro funcionando
- [ ] Criar tarefa com título
- [ ] Criar tarefa com descrição
- [ ] Criar tarefa com prioridade (cores)
- [ ] Criar tarefa com prazo
- [ ] Criar tarefa com lembrete
- [ ] Adicionar subtarefa
- [ ] Adicionar nota
- [ ] Adicionar recurso/link
- [ ] Visualização Lista funciona
- [ ] Kanban funciona (drag & drop)
- [ ] Árvore funciona
- [ ] Modo Foco abre
- [ ] Pomodoro conta corretamente
- [ ] Cronograma Mês exibe tarefas
- [ ] Cronograma Semana exibe tarefas
- [ ] Cronograma Dia exibe tarefas
- [ ] Exportação .ICS baixa arquivo
- [ ] Exportação JSON baixa arquivo
- [ ] Notificações navegador aparecem
- [ ] Notificações email aparecem (pendente)
- [ ] Dark Mode funciona (pendente)
- [ ] Logout funciona

---

## 📞 Precisa de Ajuda?

Para qualquer funcionalidade pendente, posso ajudar a implementar. Basta pedir!
