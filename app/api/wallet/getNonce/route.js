// app/api/wallet/getNonce/route.js

// Import Node.js crypto module to generate random values.
import crypto from 'crypto';
// Import the global CORS helper function from our shared utility file.
import { setCorsHeaders } from '../../../lib/utils/cors';

/**
 * Handles preflight OPTIONS requests.
 * Browsers send OPTIONS requests as part of CORS to check if the actual request is safe.
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
 * A nonce is a random value that can be used to ensure that each request is unique,
 * commonly used in authentication flows.
 *
 * @returns {Promise<Response>} - A JSON response containing the generated nonce,
 * with CORS headers added.
 */
export async function GET() {
  // Generate a 16-byte random value and convert it to a hexadecimal string.
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Create a new Response with the nonce as JSON.
  const response = new Response(JSON.stringify({ nonce }), {
    headers: { "Content-Type": "application/json" },
  });
  
  // Return the response with CORS headers set using the global helper.
  return setCorsHeaders(response);
}