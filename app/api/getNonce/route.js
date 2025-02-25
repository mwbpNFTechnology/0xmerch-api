import crypto from 'crypto';

export async function GET(request) {
  const nonce = crypto.randomBytes(16).toString('hex');
  return new Response(JSON.stringify({ nonce }), {
    headers: { "Content-Type": "application/json" },
  });
}