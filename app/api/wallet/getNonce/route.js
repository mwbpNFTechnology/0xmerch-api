// app/api/wallet/getNonce/route.js

import crypto from 'crypto';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getUserIdFromRequest } from '../../../lib/utils/serverFirebaseUtils';

/**
 * Handles preflight OPTIONS requests.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * Handles GET requests to generate and return a nonce.
 * This version requires a valid Firebase ID token.
 */
export async function GET(request) {
  try {
    // verifying the token using our utility function.
    await getUserIdFromRequest(request);
    
    // Generate a nonce.
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create a JSON response with the nonce.
    const response = new Response(JSON.stringify({ nonce }), {
      headers: { "Content-Type": "application/json" },
    });
    
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error in GET /api/wallet/getNonce:', error);
    return setCorsHeaders(new Response(JSON.stringify({ error: 'Invalid token or server error' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
}