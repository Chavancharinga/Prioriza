import fetch from 'node-fetch';

const resendKey = 're_FvMJYS9m_Mmmf6jKqsBTksUsy5s5B6nyY';

async function sendTestEmail() {
    try {
        console.log("A preparar template de e-mail Prioriza (Design Profissional)...");

        const htmlTemplate = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #1E3A89; padding: 40px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">PRIORIZA</h1>
            <p style="color: #bfdbfe; margin: 12px 0 0 0; font-size: 15px; font-weight: 500;">O seu foco para hoje</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Ponto de Situação</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">O sistema identificou as seguintes tarefas pendentes. Verifique os prazos e garanta a conclusão atempada das suas prioridades.</p>
            
            <!-- Task List -->
            <div style="margin-bottom: 40px;">
              
              <!-- Task Item (Prazo) -->
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700; line-height: 1.4;">Revisar modulo de autenticacao</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 700;">Prazo crítico a terminar (Hoje às 18:00)</p>
                  <p style="margin: 0; color: #64748b; font-size: 14px;">Estimativa de esforço: 45 minutos</p>
                </div>
              </div>

              <!-- Task Item (Lembrete) -->
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700; line-height: 1.4;">Atualizar documentacao do projeto</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <p style="margin: 0; color: #1E3A89; font-size: 14px; font-weight: 700;">Lembrete de tarefa (Hoje às 20:30)</p>
                  <p style="margin: 0; color: #64748b; font-size: 14px;">Estimativa de esforço: 60 minutos</p>
                </div>
              </div>

            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              <a href="https://chavancharinga.github.io/Prioriza/" style="display: inline-block; background-color: #1E3A89; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Ver</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px 24px; text-align: center;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Este email foi enviado automaticamente pelo Prioriza.</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Nao responda a este endereco.</p>
          </div>
        </div>
        `;

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Prioriza <onboarding@resend.dev>',
                to: ['equipa.mk2@gmail.com'],
                subject: 'Resumo Diário de Tarefas - Prioriza',
                html: htmlTemplate
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log("Email de teste (layout profissional) enviado com sucesso!");
            console.log("ID da mensagem:", data.id);
        } else {
            console.error("Falha ao enviar o e-mail:", data);
        }
    } catch (err) {
        console.error("Erro na execução do script:", err.message);
    }
}

sendTestEmail();
