// Import Node.js crypto module to generate random values.
import crypto from 'crypto';
// Import Firebase Admin SDK (assumes it is already initialized in your project)
import admin from 'firebase-admin';
// Import the global CORS helper function from our shared utility file.
import { setCorsHeaders } from '../../../lib/utils/cors';

// Ensure Firebase Admin is initialized (if not already).
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID, // Your Firebase project ID.
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // Your service account email.
      // Convert escaped newlines to real newlines if needed.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

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
 * The server verifies the token, then generates a nonce and returns it in a JSON response.
 *
 * @returns {Promise<Response>} - A JSON response containing the generated nonce,
 * with CORS headers added.
 */
export async function GET(request) {
  try {
    // Retrieve the Authorization header from the request.
    // The header should be in the format: "Bearer <token>".
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No Authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Invalid Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Verify the token using Firebase Admin.
    // This returns a decoded token containing the user's UID.
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log('Token verified for user:', userId);
    
    // Generate a 16-byte random value and convert it to a hexadecimal string (nonce).
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create a new Response with the nonce as JSON.
    const response = new Response(JSON.stringify({ nonce }), {
      headers: { "Content-Type": "application/json" },
    });
    
    // Return the response with CORS headers set using the global helper.
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error in GET /api/getNonce:', error);
    return new Response(JSON.stringify({ error: 'Invalid token or server error' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}