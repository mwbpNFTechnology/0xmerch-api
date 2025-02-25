import crypto from 'crypto';

// Helper function to set CORS headers on a Response object.
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handles OPTIONS requests (preflight)
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

// Handles GET requests: returns a nonce with CORS headers added.
export async function GET(request) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const response = new Response(JSON.stringify({ nonce }), {
    headers: { "Content-Type": "application/json" },
  });
  return setCorsHeaders(response);
}