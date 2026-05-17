// Backend API - Publish to Discord
// Uses DISCORD_WEBHOOK_URL from environment variables
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, mediaUrl } = req.body;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({
        status: 'error',
        message: 'Discord não configurado. Defina DISCORD_WEBHOOK_URL nas variáveis de ambiente.',
      });
    }

    if (!text?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Texto é obrigatório.' });
    }

    const payload = {
      content: text.substring(0, 2000),
      username: 'PostFlow',
      ...(mediaUrl && {
        embeds: [{
          title: 'PostFlow - Nova Publicação',
          description: text.substring(0, 4096),
          color: 0x5865f2,
          image: { url: mediaUrl },
          timestamp: new Date().toISOString(),
          footer: { text: 'Compartilhado via PostFlow' },
        }],
      }),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Discord webhook error (${response.status}): ${errText}`);
    }

    return res.status(200).json({
      status: 'published',
      message: 'Publicado no Discord com sucesso!',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido ao publicar no Discord.',
    });
  }
}
