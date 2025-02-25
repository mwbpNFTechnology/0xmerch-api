// app/api/wallet/getNonce/route.js

import crypto from 'crypto';
// Import the global CORS helper function.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utility to extract the user ID.
import { getUserIdFromRequest } from '../../../lib/utils/serverFirebaseUtils';

/**
 * Handles preflight OPTIONS requests.
 * Browsers send these requests as part of CORS to check if the actual request is safe.
 * This function returns a 204 No Content response with the necessary CORS headers.
 *
 * @returns {Promise<Response>} - A response with status 204 and CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * Handles GET requests to generate and return a nonce.
 * This version requires the client to send a valid Firebase ID token in the Authorization header.
 * The server verifies the token to extract the user ID, then generates a nonce and returns it.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response containing the generated nonce, with CORS headers added.
 */
export async function GET(request) {
  try {
    // Extract the user ID from the request using our server-side utility.
    const userId = await getUserIdFromRequest(request);
    console.log('User ID from token:', userId);
    
    // Generate a 16-byte random value and convert it to a hexadecimal string (nonce).
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create a new Response with the nonce as JSON.
    const response = new Response(JSON.stringify({ nonce }), {
      headers: { "Content-Type": "application/json" },
    });
    
    // Return the response with CORS headers set using the global helper.
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error in GET /api/wallet/getNonce:', error);
    return new Response(JSON.stringify({ error: 'Invalid token or server error' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}