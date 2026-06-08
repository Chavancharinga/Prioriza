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

**Arquivo:** `src/components/modals/CreateTaskModal.jsx`

**Linha 142-149:**

```jsx
// Mudar de:
<label className="mb-1 block text-sm font-medium text-neutral-700">Descrição (Obrigatório)</label>

// Para:
<label className="mb-1 block text-sm font-medium text-neutral-700">Descrição (Opcional)</label>
```

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