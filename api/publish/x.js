// Vercel Serverless Function - X (Twitter) Publish (MOCKED)
// X requires OAuth 2.0 with elevated access on the developer portal.
// This endpoint returns a mocked response until OAuth integration is complete.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'mocked',
    platform: 'x',
    message: '🔧 X (Twitter): Publicação simulada. Para publicar de verdade, é necessário acesso à API X v2 com OAuth 2.0. Acesse developer.twitter.com.',
  });
}
