// Vercel Serverless Function - Publish to Telegram
// Uses TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from backend environment variables
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, mediaUrl, mediaType } = req.body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        status: 'error',
        message: 'Telegram não configurado. Defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID nas variáveis de ambiente do servidor.',
      });
    }

    if (!text?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Texto é obrigatório.' });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

    if (mediaUrl) {
      // Send media with caption
      const endpoint = mediaType === 'video' ? 'sendVideo' : 'sendPhoto';
      const mediaField = mediaType === 'video' ? 'video' : 'photo';

      const mediaRes = await fetch(`${telegramApiUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          [mediaField]: mediaUrl,
          caption: text.substring(0, 1024),
          parse_mode: 'Markdown',
        }),
      });

      if (!mediaRes.ok) {
        const errText = await mediaRes.text();
        throw new Error(`Telegram API error: ${errText}`);
      }
    } else {
      // Send text-only message
      const msgRes = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.substring(0, 4096),
          parse_mode: 'Markdown',
        }),
      });

      if (!msgRes.ok) {
        const errText = await msgRes.text();
        throw new Error(`Telegram API error: ${errText}`);
      }
    }

    return res.status(200).json({
      status: 'published',
      message: 'Publicado no Telegram com sucesso!',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido ao publicar no Telegram.',
    });
  }
}
