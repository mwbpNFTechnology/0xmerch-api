// app/api/wallet/checkWalletAssignedPublic/route.js

// Import our global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities for user token extraction and Firestore instance.
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

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
 * GET endpoint to check if a wallet address is present in the `wallets` array field
 * of any document in the publicUsers collection.
 * The API is protected by Firebase authentication.
 *
 * Process:
 * 1. Verifies the Firebase ID token to ensure the caller is authenticated.
 * 2. Reads the walletAddress from the URL's query parameters.
 * 3. Fetches all documents in the `publicUsers` collection.
 * 4. Iterates over each document and checks if the `wallets` array field contains
 *    an object with a matching `walletAddress`.
 * 5. Returns a JSON response with { assigned: true } if found, otherwise { assigned: false }.
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

    // Fetch all publicUsers documents.
    const publicUsersSnapshot = await firestore.collection('publicUsers').get();
    let assigned = false;
    publicUsersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.wallets)) {
        // Check if any wallet in the array has a walletAddress that matches the query.
        if (data.wallets.some((wallet) => wallet.walletAddress === walletAddress)) {
          assigned = true;
        }
      }
    });

    const responseBody = { assigned };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error checking wallet assignment in publicUsers:', error);
    const errorResponse = new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(errorResponse);
  }
}