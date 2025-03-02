// app/api/wallet/checkWalletAssignedAll/route.js

// Import our global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities (for user token extraction and Firestore instance).
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';
// Import the Firebase Admin SDK.
import admin from 'firebase-admin';

// Retrieve the Firestore instance.
const firestore = getFirestoreInstance();

/**
 * Handles preflight OPTIONS requests.
 *
 * @returns {Promise<Response>} - A response with status 204 and CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * GET endpoint to check if a wallet address is assigned for any user.
 * The API is protected by Firebase authentication; only authenticated users can call it.
 * Expects a query parameter `walletAddress`.
 *
 * Process:
 * 1. Verifies the Firebase ID token to ensure the caller is authenticated.
 * 2. Reads the walletAddress from the URL's query parameters.
 * 3. Uses a collection group query to search for a document in all users' "wallets" subcollections
 *    where the `walletAddress` field equals the provided value.
 * 4. Returns a JSON response with { assigned: true } if found, otherwise { assigned: false }.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response indicating whether the wallet address is assigned.
 */
export async function GET(request) {
  try {
    // Ensure the request is from an authenticated user.
    await getUserIdFromRequest(request);

    // Parse the walletAddress from the query parameters.
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      const missingResponse = new Response(
        JSON.stringify({ error: 'Missing walletAddress query parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(missingResponse);
    }

    // Use a collection group query to search for the wallet address in all users' wallets subcollections.
    const walletsQuery = firestore
      .collectionGroup('wallets')
      .where('walletAddress', '==', walletAddress);
    const querySnapshot = await walletsQuery.get();

    const responseBody = querySnapshot.empty
      ? { assigned: false }
      : { assigned: true };

    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error checking wallet assignment across all users:', error);
    const errorResponse = new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(errorResponse);
  }
}