// Vercel Serverless Function - TikTok Publish (MOCKED)
// TikTok requires OAuth 2.0 with a Business/Creator account and approved developer app.
// This endpoint returns a mocked response until OAuth integration is complete.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'mocked',
    platform: 'tiktok',
    message: '🔧 TikTok: Publicação simulada. Para publicar de verdade, é necessário OAuth 2.0 com conta TikTok Business aprovada. Acesse developers.tiktok.com.',
  });
}
