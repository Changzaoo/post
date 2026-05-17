import express from 'express';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Import API route handlers
async function loadHandlers() {
  const { default: telegramHandler } = await import('./api/publish/telegram.js');
  const { default: discordHandler } = await import('./api/publish/discord.js');

  // Publish endpoints - credentials come from env vars, NOT from request body
  app.post('/api/publish/telegram', (req, res) => telegramHandler(req, res));
  app.post('/api/publish/discord', (req, res) => discordHandler(req, res));

  app.post('/api/publish/tiktok', (_req, res) => {
    res.json({
      status: 'mocked',
      message: '🔧 TikTok: Publicação simulada. Para publicar de verdade, é necessário OAuth 2.0 com conta TikTok Business aprovada.',
    });
  });

  app.post('/api/publish/instagram', (_req, res) => {
    res.json({
      status: 'mocked',
      message: '🔧 Instagram: Publicação simulada. Para publicar de verdade, é necessária conta Business ou Creator com Meta Graph API aprovado.',
    });
  });

  app.post('/api/publish/x', (_req, res) => {
    res.json({
      status: 'mocked',
      message: '🔧 X (Twitter): Publicação simulada. Para publicar de verdade, é necessário acesso à API X v2 com OAuth 2.0.',
    });
  });

  // Posts endpoints
  app.get('/api/posts/history', (_req, res) => {
    res.json({ posts: [] });
  });

  app.post('/api/posts/draft', (_req, res) => {
    res.json({ success: true, message: 'Draft saved' });
  });

  app.post('/api/posts/schedule', (_req, res) => {
    res.json({ success: true, message: 'Post scheduled' });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
  });
}

loadHandlers().then(() => {
  app.listen(PORT, () => {
    console.log(`PostFlow API running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
