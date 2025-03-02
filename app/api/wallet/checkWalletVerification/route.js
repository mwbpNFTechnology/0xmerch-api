// app/api/wallet/checkWalletVerification/route.js

// Import our global CORS helper function.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities.
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

// Retrieve the Firestore instance from our shared utility.
const firestore = getFirestoreInstance();

/**
 * Helper function to create a standardized error response with JSON content.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code for the error response.
 * @returns {Response} - A Response object with error details and CORS headers.
 */
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ verify: false, error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  return setCorsHeaders(response);
}

/**
 * Handles preflight OPTIONS requests.
 *
 * @returns {Promise<Response>} - A response with status 204.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * GET handler for checking wallet verification.
 * Expects a query parameter `address` representing the wallet address.
 *
 * Process:
 * 1. Extracts the user's UID by verifying the Firebase ID token from the Authorization header.
 * 2. Reads the wallet address from the URL's query parameters.
 * 3. Checks if a document exists in the user's wallets subcollection with the provided address.
 * 4. Returns { verify: true } if the wallet exists or { verify: false } otherwise.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A response with the verification result.
 */
export async function GET(request) {
  try {
    // Extract the user's UID from the Firebase ID token.
    const userId = await getUserIdFromRequest(request);
    
    // Retrieve the wallet address from the query parameters.
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) {
      return errorResponse('Missing wallet address', 400);
    }
    
    // Reference the wallet document in Firestore.
    const walletRef = firestore.doc(`users/${userId}/wallets/${address}`);
    const walletSnapshot = await walletRef.get();
    
    // Respond with verify: true if the wallet exists.
    const responseBody = walletSnapshot.exists
      ? { verify: true }
      : { verify: false };
      
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error checking wallet verification:', error);
    return errorResponse('Server error', 500);
  }
}