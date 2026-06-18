# Prioriza - Funcionalidades Pendentes

## ðŸ“Š Status Geral (Projeto Principal: Code/Prioriza_pasta)

| Categoria | Funcionalidade | Status | Prioridade |
|-----------|---------------|--------|-----------|
| **AutenticaÃ§Ã£o** | Login/Cadastro | âœ… Feito | - |
| **AutenticaÃ§Ã£o** | RecuperaÃ§Ã£o de senha | âœ… Feito | - |
| **Tarefas** | CRUD completo | âœ… Feito | - |
| **Tarefas** | Sistema de prioridades (cores) | âœ… Feito | - |
| **Tarefas** | Subtarefas (checklist) | âœ… Feito | - |
| **Tarefas** | Notas por tarefa | âœ… Feito | - |
| **Tarefas** | Recursos/Links | âœ… Feito | - |
| **VisualizaÃ§Ã£o** | Lista | âœ… Feito | - |
| **VisualizaÃ§Ã£o** | Kanban (drag & drop) | âœ… Feito | - |
| **VisualizaÃ§Ã£o** | Ãrvore | âœ… Feito | - |
| **Foco** | Modo Foco | âœ… Feito | - |
| **Foco** | Pomodoro Timer | âœ… Feito | - |
| **Cronograma** | VisualizaÃ§Ã£o MÃªs | âœ… Feito | - |
| **Cronograma** | VisualizaÃ§Ã£o Semana | âœ… Feito | - |
| **Cronograma** | VisualizaÃ§Ã£o Dia | âœ… Feito | - |
| **Cronograma** | ExportaÃ§Ã£o .ICS | âœ… Feito | - |
| **NotificaÃ§Ãµes** | In-app (navegador) | âœ… Feito | - |
| **NotificaÃ§Ãµes** | Email (Maileroo) | ðŸ”¶ Pendente | 2 |
| **ConfiguraÃ§Ãµes** | Perfil do usuÃ¡rio | âœ… Feito | - |
| **ConfiguraÃ§Ãµes** | Alterar senha | âœ… Feito | - |
| **ConfiguraÃ§Ãµes** | Exportar JSON | âœ… Feito | - |
| **ConfiguraÃ§Ãµes** | Modo offline | âœ… Feito | - |
| **ConfiguraÃ§Ãµes** | AnimaÃ§Ãµes | âœ… Feito | - |
| **ConfiguraÃ§Ãµes** | Dark Mode | âœ… Feito | 3 |
| **SeguranÃ§a** | RLS | âœ… Feito | - |
| **Backend** | Schema Supabase | âœ… Feito | - |

---

## ðŸ”¶ Funcionalidades Pendentes

### 1. NotificaÃ§Ãµes por Email (Maileroo)

**Status:** Script SQL pronto (`setup_email_notifications_maileroo.sql`)

**O que precisa fazer:**

1. **Habilitar extensÃµes no Supabase Dashboard:**
   - Acesse: Supabase â†’ Database â†’ Extensions
   - Habilite: `pg_net` e `pg_cron`

2. **Executar script SQL:**
   - VÃ¡ em: SQL Editor â†’ New Query
   - Copie o conteÃºdo de `setup_email_notifications_maileroo.sql`
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

**Status:** âœ… Implementado!

**O que foi feito:**

1. Habilitado `darkMode: 'class'` no Tailwind
2. Adicionado toggle em Settings â†’ AparÃªncia
3. Adicionada lÃ³gica para aplicar tema via classe CSS

**Para ativar:** VÃ¡ em ConfiguraÃ§Ãµes â†’ AparÃªncia â†’ Ativar Modo Escuro

---

### 3. CorreÃ§Ã£o Bug UI

**Arquivo:** `src/components/modals/CreateTaskModal.jsx`

**Linha 142-149:**

```jsx
// Mudar de:
<label className="mb-1 block text-sm font-medium text-neutral-700">DescriÃ§Ã£o (ObrigatÃ³rio)</label>

// Para:
<label className="mb-1 block text-sm font-medium text-neutral-700">DescriÃ§Ã£o (Opcional)</label>
```

---

## ðŸ“‹ Funkcionalidades Extras (NÃ£o Essenciais)

### Analytics/Dashboard
- GrÃ¡ficos de produtividade
- Tarefas concluÃ­das por semana
- Streak diÃ¡rio

### PWA (Progressive Web App)
- `manifest.json`
- Service worker
- Instalabilidade em mobile

### Tarefas Recorrentes
- DiÃ¡ria, semanal, mensal
- RepetiÃ§Ã£o personalizada

### Tags/Categorias
- Sistema de organizaÃ§Ã£o por tags
- Filtro por tag

### GamificaÃ§Ã£o
- Pontos
- Badges
- Conquistas

---

## ðŸ“… Ordem de ImplementaÃ§Ã£o Sugerida

1. **CorreÃ§Ã£o Bug UI** (1 min)
2. **NotificaÃ§Ãµes Email** (15 min - configurar no Supabase)
3. **Dark Mode** (30-60 min)
4. **Extras** (quando necessÃ¡rio)

---

## âœ… Checklist de VerificaÃ§Ã£o

Execute este checklist para confirmar que tudo estÃ¡ funcionando:

- [ ] Login e cadastro funcionando
- [ ] Criar tarefa com tÃ­tulo
- [ ] Criar tarefa com descriÃ§Ã£o
- [ ] Criar tarefa com prioridade (cores)
- [ ] Criar tarefa com prazo
- [ ] Criar tarefa com lembrete
- [ ] Adicionar subtarefa
- [ ] Adicionar nota
- [ ] Adicionar recurso/link
- [ ] VisualizaÃ§Ã£o Lista funciona
- [ ] Kanban funciona (drag & drop)
- [ ] Ãrvore funciona
- [ ] Modo Foco abre
- [ ] Pomodoro conta corretamente
- [ ] Cronograma MÃªs exibe tarefas
- [ ] Cronograma Semana exibe tarefas
- [ ] Cronograma Dia exibe tarefas
- [ ] ExportaÃ§Ã£o .ICS baixa arquivo
- [ ] ExportaÃ§Ã£o JSON baixa arquivo
- [ ] NotificaÃ§Ãµes navegador aparecem
- [ ] NotificaÃ§Ãµes email aparecem (pendente)
- [ ] Dark Mode funciona (pendente)
- [ ] Logout funciona

---

## ðŸ“ž Precisa de Ajuda?

Para qualquer funcionalidade pendente, posso ajudar a implementar. Basta pedir!