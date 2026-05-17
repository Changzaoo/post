// Vercel Serverless Function - Instagram Publish (MOCKED)
// Instagram requires Meta Graph API with a Business/Creator account and approved app.
// This endpoint returns a mocked response until OAuth integration is complete.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'mocked',
    platform: 'instagram',
    message: '🔧 Instagram: Publicação simulada. Para publicar de verdade, é necessária conta Business ou Creator com Meta Graph API aprovado. Acesse developers.facebook.com/docs/instagram-api.',
  });
}
