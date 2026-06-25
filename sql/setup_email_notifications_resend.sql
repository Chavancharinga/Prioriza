-- ============================================
-- CONFIGURAÇÃO DE NOTIFICAÇÕES VIA RESEND
-- Prioriza App
-- ============================================

-- Atribuir a API Key do Resend como variável de ambiente do Supabase
-- A chave foi fornecida pelo utilizador
ALTER DATABASE postgres SET app.resend_api_key TO 're_FvMJYS9m_Mmmf6jKqsBTksUsy5s5B6nyY';

-- Função para envio de emails via Resend
CREATE OR REPLACE FUNCTION send_reminder_emails_resend()
RETURNS void AS $$
DECLARE
  r record;
  user_email text;
  payload jsonb;
  response_id bigint;
  resend_api_key text := current_setting('app.resend_api_key', true);
BEGIN
  IF resend_api_key IS NULL OR resend_api_key = '' THEN
    RAISE EXCEPTION 'Missing app.resend_api_key. Configure it before scheduling reminders.';
  END IF;

  -- Loop por tarefas com lembrete vencido nas últimas 2 horas que ainda não foram enviadas
  FOR r IN
    SELECT t.id, t.title, t.description, t.user_id, t.reminder, t.due_date
    FROM tasks t
    WHERE t.reminder <= now()
      AND t.reminder > (now() - interval '2 hours')
      AND (t.reminder_sent = false OR t.reminder_sent IS NULL)
      AND t.status != 'Feito'
    ORDER BY t.reminder ASC
    LIMIT 50
  LOOP
    -- Buscar email do usuário
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = r.user_id;

    IF user_email IS NOT NULL THEN
      -- Construir payload do email para o Resend
      -- NOTA: Como não há domínio próprio verificado, OBRIGATÓRIAMENTE temos de usar 'onboarding@resend.dev'
      -- e o email de destino (user_email) deve ser o email associado à conta Resend.
      payload := jsonb_build_object(
        'from', 'Prioriza Lembretes <onboarding@resend.dev>',
        'to', jsonb_build_array(user_email),
        'subject', '⏰ Lembrete: ' || r.title,
        'html', 
          '<!DOCTYPE html>' ||
          '<html>' ||
          '<head><meta charset="UTF-8"></head>' ||
          '<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">' ||
          '<div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">' ||
          
          -- Header
          '<div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 30px; text-align: center;">' ||
          '<h1 style="margin: 0; color: white; font-size: 28px;">🎯 Prioriza</h1>' ||
          '</div>' ||
          
          -- Content
          '<div style="padding: 30px;">' ||
          '<h2 style="color: #1f2937; margin: 0 0 10px 0;">⏰ Lembrete de Tarefa</h2>' ||
          '<h3 style="color: #3b82f6; margin: 0 0 20px 0; font-size: 22px;">' || r.title || '</h3>' ||
          
          CASE 
            WHEN r.description IS NOT NULL AND r.description != '' THEN
              '<div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">' ||
              '<p style="margin: 0; color: #4b5563; line-height: 1.6;">' || r.description || '</p>' ||
              '</div>'
            ELSE ''
          END ||
          
          -- Informações
          '<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">' ||
          '<p style="margin: 0; color: #92400e;"><strong>📅 Hora do lembrete:</strong> ' || 
            to_char(r.reminder AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY às HH24:MI') || '</p>' ||
          CASE 
            WHEN r.due_date IS NOT NULL THEN
              '<p style="margin: 10px 0 0 0; color: #92400e;"><strong>⏳ Prazo final:</strong> ' || 
                to_char(r.due_date AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') || '</p>'
            ELSE ''
          END ||
          '</div>' ||
          
          -- CTA Button
          '<div style="text-align: center; margin: 30px 0;">' ||
          '<a href="https://prioriza.app" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Abrir Prioriza</a>' ||
          '</div>' ||
          
          -- Footer
          '<div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">' ||
          '<p style="margin: 0; color: #6b7280; font-size: 12px;">Prioriza - Seu gerenciador de tarefas inteligente</p>' ||
          '<p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 11px;">Você recebeu este email porque configurou um Lembrete no Prioriza.</p>' ||
          '</div>' ||
          
          '</div>' ||
          '</body>' ||
          '</html>'
      );

      -- Enviar email via Resend API
      SELECT net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || resend_api_key
        ),
        body := payload
      ) INTO response_id;

      -- Marcar como enviado
      UPDATE tasks 
      SET reminder_sent = true,
          reminder_email_sent_at = now()
      WHERE id = r.id;

      RAISE NOTICE 'Email enviado para tarefa % - usuário % (Resend)', r.id, user_email;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar a extensão pg_cron e pg_net (se não estiverem ativas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remover agendamento anterior para não haver duplicação de crons
-- Ignora erro caso não exista (usa o trycatch nativo ou apenas executamos, e se não houver job, não tem problema)
DO $$
BEGIN
  PERFORM cron.unschedule('prioriza-check-reminders');
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- Agendar a nova função do Resend para correr a cada minuto
SELECT cron.schedule(
  'prioriza-check-reminders',
  '* * * * *', -- Minuto a minuto
  $$ SELECT send_reminder_emails_resend(); $$
);
